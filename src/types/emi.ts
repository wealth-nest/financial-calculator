export interface EMICalculationRequest {
  loanAmount: number;
  annualInterestRate: number;
  tenureYears: number;
  prepaymentType: 'none' | 'fixed' | 'percentage' | 'additional_emi';
  prepaymentValue: number;
}

export interface MonthlyEMIData {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  prepayment: number;
  outstandingBalance: number;
}

export interface EMICalculationResult {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  totalPrepayment: number;
  actualTenureMonths: number;
  originalTenureMonths: number;
  interestSaved: number;
  monthsSaved: number;
  monthlyData: MonthlyEMIData[];
}
