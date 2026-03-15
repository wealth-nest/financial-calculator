import { EMICalculationRequest, EMICalculationResult, MonthlyEMIData } from '../types/emi';

export function calculateEMI(request: EMICalculationRequest): EMICalculationResult {
  const {
    loanAmount,
    annualInterestRate,
    tenureYears,
    prepaymentType,
    prepaymentValue,
  } = request;

  const monthlyRate = annualInterestRate / 12 / 100;
  const originalTenureMonths = tenureYears * 12;

  // EMI = P × r × (1+r)^n / ((1+r)^n - 1)
  const emi =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, originalTenureMonths)) /
        (Math.pow(1 + monthlyRate, originalTenureMonths) - 1)
      : loanAmount / originalTenureMonths;

  // Calculate without prepayment first (for comparison)
  const totalWithoutPrepayment = emi * originalTenureMonths;
  const interestWithoutPrepayment = totalWithoutPrepayment - loanAmount;

  // Now simulate month by month with prepayments
  const monthlyData: MonthlyEMIData[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let totalPrepayment = 0;
  let month = 0;

  while (balance > 0.01 && month < originalTenureMonths * 2) {
    month++;
    const interestForMonth = balance * monthlyRate;
    let principalForMonth = emi - interestForMonth;

    // If remaining balance is less than EMI
    if (balance + interestForMonth <= emi) {
      principalForMonth = balance;
      balance = 0;
      totalInterest += interestForMonth;

      monthlyData.push({
        month,
        emi: Math.round((principalForMonth + interestForMonth) * 100) / 100,
        principal: Math.round(principalForMonth * 100) / 100,
        interest: Math.round(interestForMonth * 100) / 100,
        prepayment: 0,
        outstandingBalance: 0,
      });
      break;
    }

    balance -= principalForMonth;
    totalInterest += interestForMonth;

    // Apply prepayment
    let prepayment = 0;
    if (prepaymentType !== 'none' && prepaymentValue > 0) {
      if (prepaymentType === 'fixed' && month % 12 === 0) {
        // Fixed amount prepayment every year
        prepayment = Math.min(prepaymentValue, balance);
      } else if (prepaymentType === 'percentage' && month % 12 === 0) {
        // Percentage of outstanding balance every year
        prepayment = Math.min(Math.round((balance * prepaymentValue) / 100), balance);
      } else if (prepaymentType === 'additional_emi' && month % 12 === 0) {
        // Additional EMIs worth of payment every year
        prepayment = Math.min(emi * prepaymentValue, balance);
      }
    }

    balance -= prepayment;
    totalPrepayment += prepayment;
    if (balance < 0) balance = 0;

    monthlyData.push({
      month,
      emi: Math.round(emi * 100) / 100,
      principal: Math.round(principalForMonth * 100) / 100,
      interest: Math.round(interestForMonth * 100) / 100,
      prepayment: Math.round(prepayment * 100) / 100,
      outstandingBalance: Math.round(balance * 100) / 100,
    });
  }

  const actualTenureMonths = month;
  const totalPayment = Math.round((totalInterest + loanAmount) * 100) / 100;
  const interestSaved = Math.round((interestWithoutPrepayment - totalInterest) * 100) / 100;
  const monthsSaved = originalTenureMonths - actualTenureMonths;

  return {
    monthlyEMI: Math.round(emi * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayment,
    totalPrepayment: Math.round(totalPrepayment * 100) / 100,
    actualTenureMonths,
    originalTenureMonths,
    interestSaved: Math.max(0, interestSaved),
    monthsSaved: Math.max(0, monthsSaved),
    monthlyData,
  };
}
