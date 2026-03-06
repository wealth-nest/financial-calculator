export interface LumpsumCalculationRequest {
  investmentAmount: number;
  annualReturnRate: number;
  years: number;
}

export interface LumpsumCalculationResult {
  investedAmount: number;
  maturityValue: number;
  estimatedReturns: number;
}
