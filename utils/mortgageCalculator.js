/**
 * Mortgage Calculator Utility
 * Calculate mortgage payments, affordability, and amortization schedules
 */

/**
 * Calculate monthly mortgage payment
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as percentage, e.g., 5.5)
 * @param {number} years - Amortization period in years
 * @returns {Object} Payment details
 */
function calculatePayment(principal, annualRate, years) {
  if (!principal || principal <= 0) {
    throw new Error('Principal must be greater than 0');
  }
  if (!annualRate || annualRate < 0) {
    throw new Error('Interest rate must be 0 or greater');
  }
  if (!years || years <= 0) {
    throw new Error('Amortization period must be greater than 0');
  }
  
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  let monthlyPayment;
  
  if (monthlyRate === 0) {
    // Interest-free loan
    monthlyPayment = principal / numberOfPayments;
  } else {
    monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }
  
  const totalPaid = monthlyPayment * numberOfPayments;
  const totalInterest = totalPaid - principal;
  
  return {
    principal: principal,
    annualRate: annualRate,
    amortizationYears: years,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    numberOfPayments: numberOfPayments
  };
}

/**
 * Calculate maximum affordable mortgage
 * @param {number} monthlyIncome - Gross monthly income
 * @param {number} monthlyDebts - Other monthly debt payments
 * @param {number} annualRate - Annual interest rate
 * @param {number} years - Amortization period
 * @param {number} maxDebtRatio - Maximum debt-to-income ratio (default 0.32 for 32%)
 * @returns {Object} Affordability details
 */
function calculateAffordability(monthlyIncome, monthlyDebts, annualRate, years, maxDebtRatio = 0.32) {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  // Maximum monthly payment based on debt ratio
  const maxMonthlyPayment = (monthlyIncome * maxDebtRatio) - monthlyDebts;
  
  if (maxMonthlyPayment <= 0) {
    return {
      affordable: false,
      message: 'Income is too low or debts are too high for mortgage qualification',
      maxMonthlyPayment: 0,
      maxPrincipal: 0
    };
  }
  
  let maxPrincipal;
  
  if (monthlyRate === 0) {
    maxPrincipal = maxMonthlyPayment * numberOfPayments;
  } else {
    maxPrincipal = maxMonthlyPayment *
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
  }
  
  // Calculate max property value (assuming 20% down payment)
  const maxPropertyValue = maxPrincipal / 0.8; // 80% LTV
  const requiredDownPayment = maxPropertyValue * 0.2;
  
  return {
    affordable: true,
    monthlyIncome: monthlyIncome,
    monthlyDebts: monthlyDebts,
    maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
    maxPrincipal: Math.round(maxPrincipal * 100) / 100,
    maxPropertyValue: Math.round(maxPropertyValue * 100) / 100,
    requiredDownPayment: Math.round(requiredDownPayment * 100) / 100,
    debtRatio: maxDebtRatio
  };
}

/**
 * Generate amortization schedule
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate
 * @param {number} years - Amortization period
 * @param {number} startDate - Start date (defaults to today)
 * @returns {Array} Amortization schedule
 */
function generateAmortizationSchedule(principal, annualRate, years, startDate = new Date()) {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  const monthlyPayment = calculatePayment(principal, annualRate, years).monthlyPayment;
  
  const schedule = [];
  let remainingPrincipal = principal;
  let currentDate = new Date(startDate);
  
  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPayment = remainingPrincipal * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingPrincipal -= principalPayment;
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    schedule.push({
      paymentNumber: i,
      date: new Date(currentDate),
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      remainingBalance: Math.max(0, Math.round(remainingPrincipal * 100) / 100)
    });
  }
  
  return schedule;
}

/**
 * Calculate prepayment impact
 * @param {number} principal - Original loan amount
 * @param {number} annualRate - Annual interest rate
 * @param {number} years - Original amortization period
 * @param {number} prepaymentAmount - One-time prepayment amount
 * @param {number} prepaymentMonth - Month when prepayment is made
 * @returns {Object} Prepayment impact
 */
function calculatePrepaymentImpact(principal, annualRate, years, prepaymentAmount, prepaymentMonth) {
  const originalSchedule = generateAmortizationSchedule(principal, annualRate, years);
  const originalTotalInterest = calculatePayment(principal, annualRate, years).totalInterest;
  const originalPayments = originalSchedule.length;
  
  // Calculate new schedule after prepayment
  let remainingPrincipal = principal;
  let monthsPaid = 0;
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculatePayment(principal, annualRate, years).monthlyPayment;
  
  for (let i = 1; i <= prepaymentMonth && remainingPrincipal > 0; i++) {
    const interestPayment = remainingPrincipal * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingPrincipal -= principalPayment;
    monthsPaid++;
  }
  
  // Apply prepayment
  remainingPrincipal = Math.max(0, remainingPrincipal - prepaymentAmount);
  
  // Calculate new amortization
  if (remainingPrincipal <= 0) {
    return {
      principal: principal,
      prepaymentAmount: prepaymentAmount,
      prepaymentMonth: prepaymentMonth,
      originalTotalInterest: originalTotalInterest,
      newTotalInterest: originalSchedule.slice(0, monthsPaid).reduce((sum, p) => sum + p.interest, 0),
      interestSaved: originalTotalInterest - originalSchedule.slice(0, monthsPaid).reduce((sum, p) => sum + p.interest, 0),
      paymentsReduced: originalPayments - monthsPaid,
      newAmortizationYears: monthsPaid / 12
    };
  }
  
  const newYears = years - (prepaymentMonth / 12);
  const newPayment = calculatePayment(remainingPrincipal, annualRate, newYears);
  const newTotalInterest = originalSchedule.slice(0, monthsPaid).reduce((sum, p) => sum + p.interest, 0) + newPayment.totalInterest;
  const interestSaved = originalTotalInterest - newTotalInterest;
  const paymentsRemaining = newPayment.numberOfPayments;
  const totalPayments = monthsPaid + paymentsRemaining;
  const paymentsReduced = originalPayments - totalPayments;
  
  return {
    principal: principal,
    prepaymentAmount: prepaymentAmount,
    prepaymentMonth: prepaymentMonth,
    originalTotalInterest: originalTotalInterest,
    newTotalInterest: Math.round(newTotalInterest * 100) / 100,
    interestSaved: Math.round(interestSaved * 100) / 100,
    paymentsReduced: paymentsReduced,
    newAmortizationYears: totalPayments / 12,
    newMonthlyPayment: newPayment.monthlyPayment
  };
}

module.exports = {
  calculatePayment,
  calculateAffordability,
  generateAmortizationSchedule,
  calculatePrepaymentImpact
};

