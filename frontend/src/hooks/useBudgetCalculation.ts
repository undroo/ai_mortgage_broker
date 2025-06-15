import { useMemo } from 'react';

interface BudgetCalculationProps {
  estimate: number | null;
  downPaymentType: 'percentage' | 'amount';
  downPaymentValue: string;
}

export const useBudgetCalculation = ({
  estimate,
  downPaymentType,
  downPaymentValue,
}: BudgetCalculationProps) => {
  return useMemo(() => {
    // Default to 0 if no estimate
    const currentEstimate = estimate || 0;
    
    // Default to 0 if no down payment value
    const downPayment = parseFloat(downPaymentValue) || 0;
    
    let totalBudget = 0;
    let downPaymentAmount = 0;

    if (downPaymentType === 'percentage') {
      if (downPayment >= 5 && downPayment <= 100) {
        totalBudget = Math.round(currentEstimate / (1 - (downPayment / 100)));
        downPaymentAmount = Math.round(totalBudget * (downPayment / 100));
      }
    } else {
      if (downPayment >= currentEstimate * 0.05) {
        totalBudget = Math.round(currentEstimate + downPayment);
        downPaymentAmount = downPayment;
      }
    }

    return { totalBudget, downPaymentAmount };
  }, [estimate, downPaymentType, downPaymentValue]);
}; 