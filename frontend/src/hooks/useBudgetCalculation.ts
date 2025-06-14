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
    if (!estimate || !downPaymentValue) return { totalBudget: null, downPaymentAmount: null };

    const downPayment = parseFloat(downPaymentValue);
    if (isNaN(downPayment)) return { totalBudget: null, downPaymentAmount: null };

    let totalBudget: number | null = null;

    if (downPaymentType === 'percentage') {
      if (downPayment < 5 || downPayment > 100) return { totalBudget: null, downPaymentAmount: null };
      totalBudget = Math.round(estimate / (1 - (downPayment / 100)));
    } else {
      if (downPayment < estimate * 0.05) return { totalBudget: null, downPaymentAmount: null };
      totalBudget = Math.round(estimate + downPayment);
    }

    const downPaymentAmount = downPaymentType === 'percentage'
      ? Math.round(totalBudget * (downPayment / 100))
      : downPayment;

    return { totalBudget, downPaymentAmount };
  }, [estimate, downPaymentType, downPaymentValue]);
}; 