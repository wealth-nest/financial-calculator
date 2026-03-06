const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SIPRequest {
  monthlyInvestment: number;
  annualReturnRate: number;
  years: number;
  upfrontInvestment?: number;
  topupAmount?: number;
  topupFrequency?: 'none' | 'annual' | 'percentage';
  topupPercentage?: number;
}

interface MonthlyData {
  month: number;
  invested: number;
  value: number;
  topupApplied: number;
}

interface SIPResponse {
  totalInvested: number;
  maturityValue: number;
  estimatedReturns: number;
  upfrontInvestment: number;
  totalTopups: number;
  monthlyData: MonthlyData[];
}

function calculateSIP(
  monthlyInvestment: number,
  annualReturnRate: number,
  years: number,
  upfrontInvestment: number = 0,
  topupAmount: number = 0,
  topupFrequency: 'none' | 'annual' | 'percentage' = 'none',
  topupPercentage: number = 0
): SIPResponse {
  const monthlyRate = annualReturnRate / 12 / 100;
  const totalMonths = years * 12;
  const monthlyData: MonthlyData[] = [];

  let totalInvested = upfrontInvestment;
  let currentValue = upfrontInvestment;
  let totalTopups = 0;
  let currentSIP = monthlyInvestment;

  for (let month = 1; month <= totalMonths; month++) {
    // At the start of each new year (after the first), increase the SIP amount
    let topupApplied = 0;
    if (month > 1 && (month - 1) % 12 === 0) {
      if (topupFrequency === 'annual' && topupAmount > 0) {
        topupApplied = topupAmount;
        currentSIP += topupAmount;
        totalTopups += topupAmount;
      } else if (topupFrequency === 'percentage' && topupPercentage > 0) {
        const increase = Math.round((currentSIP * topupPercentage) / 100);
        topupApplied = increase;
        currentSIP += increase;
        totalTopups += increase;
      }
    }

    currentValue = currentValue * (1 + monthlyRate);
    currentValue += currentSIP;
    totalInvested += currentSIP;

    monthlyData.push({
      month,
      invested: Math.round(totalInvested * 100) / 100,
      value: Math.round(currentValue * 100) / 100,
      topupApplied: Math.round(topupApplied * 100) / 100,
    });
  }

  const maturityValue = Math.round(currentValue * 100) / 100;
  const estimatedReturns = Math.round((maturityValue - totalInvested) * 100) / 100;

  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    maturityValue,
    estimatedReturns,
    upfrontInvestment: Math.round(upfrontInvestment * 100) / 100,
    totalTopups: Math.round(totalTopups * 100) / 100,
    monthlyData,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const {
      monthlyInvestment,
      annualReturnRate,
      years,
      upfrontInvestment = 0,
      topupAmount = 0,
      topupFrequency = 'none',
      topupPercentage = 0,
    }: SIPRequest = await req.json();

    if (!monthlyInvestment || annualReturnRate === undefined || !years) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (monthlyInvestment <= 0 || annualReturnRate < 0 || years <= 0 || upfrontInvestment < 0) {
      return new Response(
        JSON.stringify({ error: "Invalid parameter values" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const result = calculateSIP(
      monthlyInvestment,
      annualReturnRate,
      years,
      upfrontInvestment,
      topupAmount,
      topupFrequency,
      topupPercentage
    );

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
