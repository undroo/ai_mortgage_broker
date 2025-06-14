import React from 'react';
import './BorrowingCalculator.css';

export interface HomeLoanFormData {
  isFirstTimeBuyer: boolean;
  loanPurpose: string;
  borrowingType: string;
  age: string | number;
  dependents: string | number;
  employmentType: string;
  grossIncome: string | number;
  incomeFrequency: string;
  otherIncome: string | number;
  otherIncomeFrequency: string;
  // Second person's income fields
  secondPersonIncome: string | number;
  secondPersonIncomeFrequency: string;
  secondPersonOtherIncome: string | number;
  secondPersonOtherIncomeFrequency: string;
  // Rental income field
  rentalIncome: string | number;
  livingExpenses: string | number;
  rentBoard: string | number;
  hasHecs: boolean;
  creditCardLimits: string | number;
  loanRepayment: string | number;
  loanTerm: string | number;
  interestRate: string | number;
}

interface BorrowingCalculatorProps {
  formData: HomeLoanFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const BorrowingCalculator: React.FC<BorrowingCalculatorProps> = ({ formData, onFormChange }) => {
  const isCouple = formData.borrowingType === 'Couple';
  const isInvestor = formData.loanPurpose === 'Investor';

  const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === 'true';
    
    // Create a synthetic event that matches the expected type
    const syntheticEvent = {
      target: {
        name: e.target.name,
        value: value.toString(), // Convert boolean to string
        type: 'radio'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onFormChange(syntheticEvent);
  };

  return (
    <div className="borrowing-calculator">
      <div className="stage-card">
        <h2 className="stage-title">Stage 1: Your Details</h2>
        <form className="stage-form">
          {/* Personal Details */}
          <div className="form-section">
            <div className="form-section-title">Personal Details</div>
            <label className="toggle-label">
              Are you a first-time home buyer?
              <div className="toggle-group">
                <label>
                  <input
                    type="radio"
                    name="isFirstTimeBuyer"
                    value="true"
                    checked={formData.isFirstTimeBuyer === true}
                    onChange={handleBooleanChange}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="isFirstTimeBuyer"
                    value="false"
                    checked={formData.isFirstTimeBuyer === false}
                    onChange={handleBooleanChange}
                  />
                  No
                </label>
              </div>
            </label>
            <label>
              Borrowing as
              <select name="borrowingType" value={formData.borrowingType} onChange={onFormChange} required>
                <option value="Individual">Individual</option>
                <option value="Couple">Couple</option>
              </select>
            </label>
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
                min="0"
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
            <div className="form-section-title">Total Income (Pre-tax)</div>
            <div className="income-row">
              <label className="income-label">
                {isCouple ? "First person's gross income/wages" : "Gross income/wages"}
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
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="income-row">
              <label className="income-label">
                {isCouple ? "First person's other income (optional)" : "Other income (optional)"}
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
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Second person's income fields */}
            {isCouple && (
              <>
                <div className="form-section-title" style={{ marginTop: '1.5rem' }}>Second Person's Income</div>
                <div className="income-row">
                  <label className="income-label">
                    Second person's gross income/wages
                    <input
                      type="number"
                      name="secondPersonIncome"
                      value={formData.secondPersonIncome || ''}
                      onChange={onFormChange}
                      min="0"
                      required
                      placeholder="e.g. 7000"
                    />
                  </label>
                  <select
                    name="secondPersonIncomeFrequency"
                    value={formData.secondPersonIncomeFrequency}
                    onChange={onFormChange}
                    className="income-frequency-select"
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="income-row">
                  <label className="income-label">
                    Second person's other income (optional)
                    <input
                      type="number"
                      name="secondPersonOtherIncome"
                      value={formData.secondPersonOtherIncome || ''}
                      onChange={onFormChange}
                      min="0"
                      placeholder="e.g. 500"
                    />
                  </label>
                  <select
                    name="secondPersonOtherIncomeFrequency"
                    value={formData.secondPersonOtherIncomeFrequency}
                    onChange={onFormChange}
                    className="income-frequency-select"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </>
            )}

            {/* Rental income field for investors */}
            {isInvestor && (
              <div className="income-row" style={{ marginTop: '1.5rem' }}>
                <label className="income-label">
                  Expected weekly rental income
                  <input
                    type="number"
                    name="rentalIncome"
                    value={formData.rentalIncome || ''}
                    onChange={onFormChange}
                    min="0"
                    required
                    placeholder="e.g. 500"
                  />
                </label>
                <div className="income-frequency-select" style={{ visibility: 'hidden' }}>
                  Weekly
                </div>
              </div>
            )}
          </div>

          {/* Expenses */}
          <div className="form-section">
            <div className="form-section-title">Total Expenses (Monthly)</div>
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
                    onChange={handleBooleanChange}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="hasHecs"
                    value="false"
                    checked={formData.hasHecs === false}
                    onChange={handleBooleanChange}
                  />
                  No
                </label>
              </div>
            </label>
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
    </div>
  );
};

export default BorrowingCalculator; 