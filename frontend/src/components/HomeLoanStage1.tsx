import React from 'react';
import './HomeLoanStage1.css';

export interface HomeLoanFormData {
  loanPurpose: string;
  age: string;
  income: string;
  expenses: string;
  debts: string;
  employmentType: string;
}

interface Props {
  formData: HomeLoanFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const HomeLoanStage1: React.FC<Props> = ({ formData, onFormChange }) => {
  return (
    <div className="stage-card">
      <h2 className="stage-title">Stage 1: Your Details</h2>
      <form className="stage-form">
        <label>
          Loan purpose
          <select name="loanPurpose" value={formData.loanPurpose} onChange={onFormChange} required>
            <option value="" disabled>Select purpose</option>
            <option value="Owner-occupied">Owner-occupied</option>
            <option value="Investor">Investor</option>
          </select>
        </label>
        <label>
          Age
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={onFormChange}
            min="18"
            max="99"
            required
            placeholder="Your age"
          />
        </label>
        <label>
          Annual income (before tax)
          <input
            type="number"
            name="income"
            value={formData.income}
            onChange={onFormChange}
            min="0"
            required
            placeholder="e.g. 90000"
          />
        </label>
        <label>
          Monthly expenses
          <input
            type="number"
            name="expenses"
            value={formData.expenses}
            onChange={onFormChange}
            min="0"
            required
            placeholder="e.g. 2500"
          />
        </label>
        <label>
          Existing debts (optional)
          <input
            type="number"
            name="debts"
            value={formData.debts}
            onChange={onFormChange}
            min="0"
            placeholder="e.g. 10000"
          />
        </label>
        <label>
          Employment type
          <select name="employmentType" value={formData.employmentType} onChange={onFormChange} required>
            <option value="" disabled>Select employment</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Self-employed">Self-employed</option>
            <option value="Unemployed">Unemployed</option>
          </select>
        </label>
        <button type="button" className="next-btn">Next</button>
      </form>
    </div>
  );
};

export default HomeLoanStage1; 