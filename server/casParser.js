/**
 * CAS (Consolidated Account Statement) PDF Parser
 *
 * Parses CAMS and KFintech CAS PDFs to extract mutual fund holdings.
 * CAS PDFs are typically password-protected with PAN (first 5 chars) + DOB (DDMMYYYY).
 *
 * Supported CAS formats:
 * - CAMS CAS (myCAMS)
 * - KFintech CAS (KFintech / KFIN)
 * - NSDL CAS (Consolidated Account Statement via NSDL)
 *
 * The parser looks for:
 * 1. Valuation summary table at the end (most reliable)
 * 2. Folio-level holdings with closing balances
 * 3. Individual transaction entries to compute cost
 */

/**
 * Parse CAS PDF text and extract holdings
 * @param {string} text - Extracted text from the PDF
 * @returns {{ holdings: Array, statementDate: string|null, investorName: string|null, panNumber: string|null }}
 */
export function parseCASText(text) {
  const result = {
    holdings: [],
    statementDate: null,
    investorName: null,
    panNumber: null,
  };

  // Normalize text
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullText = text.replace(/\r/g, '');

  // --- Extract investor info ---
  // PAN
  const panMatch = fullText.match(/PAN\s*:\s*([A-Z]{5}\d{4}[A-Z])/i);
  if (panMatch) result.panNumber = panMatch[1].toUpperCase();

  // Statement date
  const dateMatch = fullText.match(/(?:as on|statement period.*?to)\s*(\d{1,2}[-\/]\w{3,}[-\/]\d{2,4})/i);
  if (dateMatch) result.statementDate = dateMatch[1];

  // Investor name (usually after "Name:" or at the top)
  const nameMatch = fullText.match(/(?:Investor Name|Name)\s*:\s*(.+)/i);
  if (nameMatch) result.investorName = nameMatch[1].trim();

  // --- Strategy 1: Parse "Valuation on" summary section ---
  // CAMS CAS typically has a valuation summary table at the end
  const valuationHoldings = parseValuationSummary(fullText, lines);
  if (valuationHoldings.length > 0) {
    result.holdings = valuationHoldings;
    return result;
  }

  // --- Strategy 2: Parse folio-by-folio holdings ---
  const folioHoldings = parseFolioHoldings(fullText, lines);
  if (folioHoldings.length > 0) {
    result.holdings = folioHoldings;
    return result;
  }

  // --- Strategy 3: Line-by-line keyword extraction ---
  const lineHoldings = parseLineByLine(lines);
  if (lineHoldings.length > 0) {
    result.holdings = lineHoldings;
    return result;
  }

  return result;
}

/**
 * Strategy 1: Parse valuation summary table
 * Looks for patterns like:
 *   Scheme Name | Folio | Closing Balance | NAV | Valuation | Cost Value
 */
function parseValuationSummary(fullText, lines) {
  const holdings = [];

  // Find start of valuation section
  let valuationStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (
      (line.includes('valuation') && (line.includes('holding') || line.includes('cost'))) ||
      line.includes('market value of investment') ||
      line.includes('valuation as on') ||
      (line.includes('closing') && line.includes('nav') && line.includes('value'))
    ) {
      valuationStart = i;
      break;
    }
  }

  if (valuationStart === -1) return holdings;

  // Parse rows after the header
  let currentScheme = '';
  for (let i = valuationStart + 1; i < lines.length; i++) {
    const line = lines[i];

    // Stop at grand total or end markers
    if (/grand\s*total|total\s*value|disclaimer|note\s*:/i.test(line)) break;

    // Try to extract: Scheme Name followed by numbers (units, NAV, value, cost)
    // Pattern: some text ... number ... number ... number
    const numbers = extractNumbers(line);

    if (numbers.length >= 2) {
      // If this line has a scheme name + numbers
      const textPart = line.replace(/[\d,]+\.?\d*/g, '').replace(/\s+/g, ' ').trim();

      if (textPart.length > 10 && isSchemeName(textPart)) {
        currentScheme = textPart;
      }

      if (currentScheme) {
        // Try to identify: units, nav, current value, cost value
        let units = 0, nav = 0, currentValue = 0, costValue = 0;

        if (numbers.length >= 4) {
          units = numbers[0];
          nav = numbers[1];
          currentValue = numbers[2];
          costValue = numbers[3];
        } else if (numbers.length === 3) {
          units = numbers[0];
          nav = numbers[1];
          currentValue = numbers[2];
        } else if (numbers.length === 2) {
          // Could be currentValue and costValue on a continuation line
          currentValue = numbers[0];
          costValue = numbers[1];
        }

        // Validate: NAV is typically 5-5000, units > 0, values > 100
        if (currentValue > 100 && units > 0) {
          holdings.push({
            schemeName: cleanSchemeName(currentScheme),
            units,
            currentNav: nav > 0 ? nav : undefined,
            currentValue,
            investedValue: costValue > 0 ? costValue : currentValue,
          });
          currentScheme = '';
        }
      }
    } else if (line.length > 10 && isSchemeName(line)) {
      // This is likely a scheme name line, numbers on next line
      currentScheme = line;
    }
  }

  return deduplicateHoldings(holdings);
}

/**
 * Strategy 2: Parse folio-by-folio sections
 * Looks for:
 *   Folio No: XXXX
 *   Fund House Name - Scheme Name
 *   Closing Unit Balance: XXX.XXX
 *   Valuation on DD-Mon-YYYY: INR XX,XXX.XX
 */
function parseFolioHoldings(fullText, lines) {
  const holdings = [];
  let currentFundHouse = '';
  let currentScheme = '';
  let currentUnits = 0;
  let currentValue = 0;
  let costValue = 0;
  let inFolio = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    // Detect fund house headers
    if (isFundHouseLine(line)) {
      currentFundHouse = line.trim();
      continue;
    }

    // Detect folio
    if (/folio\s*(no|number)?\s*:?\s*\d/i.test(line)) {
      // Save previous folio's holding if we have one
      if (inFolio && currentScheme && (currentUnits > 0 || currentValue > 0)) {
        holdings.push({
          schemeName: cleanSchemeName(currentScheme),
          units: currentUnits,
          currentValue: currentValue || 0,
          investedValue: costValue > 0 ? costValue : currentValue,
        });
      }
      inFolio = true;
      currentScheme = '';
      currentUnits = 0;
      currentValue = 0;
      costValue = 0;
      continue;
    }

    if (!inFolio) continue;

    // Scheme name (usually the line after folio, or contains plan/growth/direct keywords)
    if (!currentScheme && line.length > 15 && isSchemeName(line)) {
      currentScheme = line;
      continue;
    }

    // Closing unit balance
    const closingMatch = line.match(/closing\s*(?:unit\s*)?balance\s*:?\s*([\d,]+\.?\d*)/i);
    if (closingMatch) {
      currentUnits = parseIndianNumber(closingMatch[1]);
      continue;
    }

    // Valuation
    const valMatch = line.match(/valuation.*?(?:INR|Rs\.?)\s*([\d,]+\.?\d*)/i);
    if (valMatch) {
      currentValue = parseIndianNumber(valMatch[1]);
      continue;
    }

    // Cost value
    const costMatch = line.match(/cost\s*(?:value)?\s*:?\s*(?:INR|Rs\.?)\s*([\d,]+\.?\d*)/i);
    if (costMatch) {
      costValue = parseIndianNumber(costMatch[1]);
      continue;
    }

    // Market value alternative pattern
    const marketMatch = line.match(/(?:market|current)\s*value\s*:?\s*(?:INR|Rs\.?)\s*([\d,]+\.?\d*)/i);
    if (marketMatch) {
      currentValue = parseIndianNumber(marketMatch[1]);
      continue;
    }

    // Amount invested / total cost
    const investedMatch = line.match(/(?:total|amount)\s*(?:invested|cost)\s*:?\s*(?:INR|Rs\.?)\s*([\d,]+\.?\d*)/i);
    if (investedMatch) {
      costValue = parseIndianNumber(investedMatch[1]);
      continue;
    }
  }

  // Don't forget last folio
  if (inFolio && currentScheme && (currentUnits > 0 || currentValue > 0)) {
    holdings.push({
      schemeName: cleanSchemeName(currentScheme),
      units: currentUnits,
      currentValue: currentValue || 0,
      investedValue: costValue > 0 ? costValue : currentValue,
    });
  }

  return deduplicateHoldings(holdings);
}

/**
 * Strategy 3: Line-by-line pattern matching
 * Last resort - find lines that look like fund names and extract nearby numbers
 */
function parseLineByLine(lines) {
  const holdings = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!isSchemeName(line) || line.length < 15) continue;

    // Look at nearby lines (next 5) for numeric data
    let units = 0, value = 0, cost = 0;
    for (let j = i + 1; j <= Math.min(i + 5, lines.length - 1); j++) {
      const nums = extractNumbers(lines[j]);
      if (nums.length >= 3) {
        units = nums[0];
        value = nums[nums.length - 2] > nums[nums.length - 1] ? nums[nums.length - 2] : nums[nums.length - 1];
        cost = nums[nums.length - 2] < nums[nums.length - 1] ? nums[nums.length - 2] : nums[nums.length - 1];
        break;
      } else if (nums.length === 2 && value === 0) {
        value = Math.max(...nums);
        cost = Math.min(...nums);
      }
    }

    if (value > 100) {
      holdings.push({
        schemeName: cleanSchemeName(line),
        units,
        currentValue: value,
        investedValue: cost > 0 ? cost : value,
      });
    }
  }

  return deduplicateHoldings(holdings);
}

// --- Helper functions ---

function extractNumbers(line) {
  // Match numbers like 1,234.56 or 12345.67 or 12345
  const matches = line.match(/(?<!\w)([\d,]+\.?\d*)(?!\w)/g);
  if (!matches) return [];
  return matches
    .map((m) => parseIndianNumber(m))
    .filter((n) => n > 0);
}

function parseIndianNumber(str) {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function isSchemeName(line) {
  const lower = line.toLowerCase();
  const schemeKeywords = [
    'fund', 'plan', 'growth', 'direct', 'regular', 'dividend', 'idcw',
    'scheme', 'option', 'flexi', 'equity', 'debt', 'liquid', 'hybrid',
    'index', 'gilt', 'bond', 'credit', 'balanced', 'multi', 'large',
    'mid', 'small', 'cap', 'nifty', 'sensex', 'etf', 'savings',
    'overnight', 'ultra', 'short', 'long', 'dynamic', 'floating',
    'arbitrage', 'elss', 'tax', 'advantage', 'opportunity',
    'bluechip', 'emerging', 'focused', 'contra', 'value',
  ];
  const matchCount = schemeKeywords.filter((kw) => lower.includes(kw)).length;
  return matchCount >= 2;
}

function isFundHouseLine(line) {
  const fundHouses = [
    'aditya birla', 'axis mutual', 'bandhan mutual', 'baroda bnp',
    'canara robeco', 'dsp mutual', 'edelweiss', 'franklin templeton',
    'groww', 'hdfc mutual', 'hsbc mutual', 'icici prudential',
    'invesco', 'iti mutual', 'jm financial', 'kotak mahindra',
    'lic mutual', 'mahindra manulife', 'mirae asset', 'motilal oswal',
    'navi mutual', 'nippon india', 'pgim india', 'ppfas mutual',
    'parag parikh', 'quant mutual', 'quantum mutual', 'sbi mutual',
    'shriram mutual', 'sundaram mutual', 'tata mutual',
    'union mutual', 'uti mutual', 'whiteoak', 'zerodha',
    'samco mutual', 'helios mutual', '360 one', 'bajaj finserv',
    'nj mutual', 'old bridge',
  ];
  const lower = line.toLowerCase();
  return fundHouses.some((fh) => lower.includes(fh));
}

function cleanSchemeName(name) {
  return name
    .replace(/\s+/g, ' ')
    .replace(/^\d+\s*/, '') // Remove leading numbers
    .replace(/folio\s*(?:no|number)?\s*:?\s*\S+/i, '') // Remove folio references
    .replace(/\(Advisor:.*?\)/gi, '') // Remove advisor info
    .replace(/Registrar\s*:?\s*\w+/gi, '') // Remove registrar info
    .trim();
}

function deduplicateHoldings(holdings) {
  const map = new Map();
  for (const h of holdings) {
    const key = h.schemeName.toLowerCase().replace(/\s+/g, ' ');
    if (map.has(key)) {
      // Merge: add units and values
      const existing = map.get(key);
      existing.units += h.units;
      existing.currentValue += h.currentValue;
      existing.investedValue += h.investedValue;
    } else {
      map.set(key, { ...h });
    }
  }
  return Array.from(map.values());
}
