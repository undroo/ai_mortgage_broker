import React from 'react';
import './HomeLoanStage1.css';

export interface HomeLoanFormData {
  loanPurpose: string;
  age: number;
  dependents: number;
  employmentType: string;
  grossIncome: number;
  incomeFrequency: string;
  otherIncome: number;
  otherIncomeFrequency: string;
  livingExpenses: number;
  rentBoard: number;
  hasHecs: boolean;
  hecsRepayment: number;
  creditCardLimits: number;
  loanRepayment: number;
  loanTerm: number;
  interestRate: number;
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
        {/* Personal Details */}
        <div className="form-section">
          <div className="form-section-title">Personal Details</div>
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
              value={formData.age || ''}
              onChange={onFormChange}
              min="18"
              max="99"
              required
              placeholder="Your age"
            />
          </label>
          <label>
            Number of dependents
            <input
              type="number"
              name="dependents"
              value={formData.dependents || ''}
              onChange={onFormChange}
              min="0"
              max="10"
              required
              placeholder="e.g. 0"
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
        </div>

        {/* Income */}
        <div className="form-section">
          <div className="form-section-title">Income (Gross)</div>
          <div className="income-row">
            <label className="income-label">
              Gross income/wages
              <input
                type="number"
                name="grossIncome"
                value={formData.grossIncome || ''}
                onChange={onFormChange}
                min="0"
                required
                placeholder="e.g. 7000"
              />
            </label>
            <select
              name="incomeFrequency"
              value={formData.incomeFrequency}
              onChange={onFormChange}
              className="income-frequency-select"
              required
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div className="income-row">
            <label className="income-label">
              Other income (optional)
              <input
                type="number"
                name="otherIncome"
                value={formData.otherIncome || ''}
                onChange={onFormChange}
                min="0"
                placeholder="e.g. 500"
              />
            </label>
            <select
              name="otherIncomeFrequency"
              value={formData.otherIncomeFrequency}
              onChange={onFormChange}
              className="income-frequency-select"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>

        {/* Expenses */}
        <div className="form-section">
          <div className="form-section-title">Expenses (Monthly)</div>
          <label>
            Living expenses (exclude rent/mortgage)
            <input
              type="number"
              name="livingExpenses"
              value={formData.livingExpenses || ''}
              onChange={onFormChange}
              min="0"
              required
              placeholder="e.g. 2500"
            />
          </label>
          <label>
            Rent or board (if applicable)
            <input
              type="number"
              name="rentBoard"
              value={formData.rentBoard || ''}
              onChange={onFormChange}
              min="0"
              placeholder="e.g. 1200"
            />
          </label>
        </div>

        {/* Debts */}
        <div className="form-section">
          <div className="form-section-title">Debts</div>
          <label className="toggle-label">
            HECS/HELP student debt
            <div className="toggle-group">
              <label>
                <input
                  type="radio"
                  name="hasHecs"
                  value="true"
                  checked={formData.hasHecs === true}
                  onChange={onFormChange}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="hasHecs"
                  value="false"
                  checked={formData.hasHecs === false}
                  onChange={onFormChange}
                />
                No
              </label>
            </div>
          </label>
          {formData.hasHecs === true && (
            <label>
              HECS/HELP monthly repayment
              <input
                type="number"
                name="hecsRepayment"
                value={formData.hecsRepayment || ''}
                onChange={onFormChange}
                min="0"
                placeholder="e.g. 200"
                required
              />
            </label>
          )}
          <label>
            Credit card limits (total across all cards)
            <input
              type="number"
              name="creditCardLimits"
              value={formData.creditCardLimits || ''}
              onChange={onFormChange}
              min="0"
              placeholder="e.g. 10000"
            />
          </label>
          <label>
            Personal or car loans (monthly repayment)
            <input
              type="number"
              name="loanRepayment"
              value={formData.loanRepayment || ''}
              onChange={onFormChange}
              min="0"
              placeholder="e.g. 350"
            />
          </label>
        </div>

        {/* Loan Settings */}
        <div className="form-section">
          <div className="form-section-title">Loan Settings</div>
          <label>
            Loan term (years)
            <input
              type="number"
              name="loanTerm"
              value={formData.loanTerm || ''}
              disabled
              min="1"
              max="40"
            />
          </label>
          <label>
            Interest rate (%)
            <input
              type="number"
              name="interestRate"
              value={formData.interestRate || ''}
              onChange={onFormChange}
              min="0"
              max="20"
              step="0.01"
              required
            />
          </label>
        </div>
      </form>
    </div>
  );
};

export default HomeLoanStage1; 