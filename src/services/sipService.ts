import { SIPCalculationRequest, SIPCalculationResult, MonthlyData } from '../types/sip';

export async function calculateSIP(
  request: SIPCalculationRequest
): Promise<SIPCalculationResult> {
  const {
    monthlyInvestment,
    annualReturnRate,
    years,
    upfrontInvestment = 0,
    topupAmount = 0,
    topupFrequency = 'none',
    topupPercentage = 0,
  } = request;

  const monthlyRate = annualReturnRate / 12 / 100;
  const totalMonths = years * 12;
  const monthlyData: MonthlyData[] = [];

  let totalInvested = upfrontInvestment;
  let currentValue = upfrontInvestment;
  let totalTopups = 0;
  let currentSIP = monthlyInvestment;

  for (let month = 1; month <= totalMonths; month++) {
    // At the start of each new year (after the first), step up the SIP
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
