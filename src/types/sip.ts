export interface SIPCalculationRequest {
  monthlyInvestment: number;
  annualReturnRate: number;
  years: number;
  upfrontInvestment?: number;
  topupAmount?: number;
  topupFrequency?: 'none' | 'annual' | 'percentage';
  topupPercentage?: number;
}

export interface MonthlyData {
  month: number;
  invested: number;
  value: number;
  topupApplied: number;
}

export interface SIPCalculationResult {
  totalInvested: number;
  maturityValue: number;
  estimatedReturns: number;
  upfrontInvestment: number;
  totalTopups: number;
  monthlyData: MonthlyData[];
}
