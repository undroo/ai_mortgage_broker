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
  onNext: () => void;
}

const BorrowingCalculator: React.FC<BorrowingCalculatorProps> = ({ 
  formData, 
  onFormChange,
  onNext 
}) => {
  const isCouple = formData.borrowingType === 'Couple';
  const isInvestor = formData.loanPurpose === 'Investor';

  const handleFormChange = (field: string, value: string | boolean) => {
    const syntheticEvent = {
      target: {
        name: field,
        value: value,
        type: typeof value === 'boolean' ? 'radio' : 'text'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onFormChange(syntheticEvent);

    // Update interest rate based on loan purpose
    if (field === 'loanPurpose') {
      const rateEvent = {
        target: {
          name: 'interestRate',
          value: value === 'Investor' ? '5.8' : '5.5',
          type: 'text'
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onFormChange(rateEvent);
    }
  };

  const getMissingFields = () => {
    const missing = [];
    if (!formData.grossIncome) missing.push('Gross Income');
    if (!formData.borrowingType) missing.push('Borrowing Type');
    if (!formData.loanPurpose) missing.push('Loan Purpose');
    return missing;
  };

  const missingFields = getMissingFields();
  const isButtonDisabled = missingFields.length > 0;

  return (
    <div className="borrowing-calculator">
      <div className="stage-card">
        <h2 className="stage-title">Stage 1: Your Details</h2>
        <form className="stage-form">
          {/* Personal Details */}
          <div className="form-section">
          <div className="form-section-title">Personal Details</div>
            <div className="form-row">
              <div className="form-group">
                <div className="borrowing-type-options">
                  <div 
                    className={`borrowing-type-option ${formData.isFirstTimeBuyer === true ? 'selected' : ''}`}
                    onClick={() => handleFormChange('isFirstTimeBuyer', true)}
                  >
                    <h4>First Time Buyer</h4>
                    <p>This is my first time buying a property</p>
                  </div>
                  <div 
                    className={`borrowing-type-option ${formData.isFirstTimeBuyer === false ? 'selected' : ''}`}
                    onClick={() => handleFormChange('isFirstTimeBuyer', false)}
                  >
                    <h4>Current Property Owner</h4>
                    <p>I own or have owned property before</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="borrowing-type-options">
                  <div 
                    className={`borrowing-type-option ${formData.borrowingType === 'Individual' ? 'selected' : ''}`}
                    onClick={() => handleFormChange('borrowingType', 'Individual')}
                  >
                    <h4>Single</h4>
                    <p>I am applying for a loan by myself</p>
                  </div>
                  <div 
                    className={`borrowing-type-option ${formData.borrowingType === 'Couple' ? 'selected' : ''}`}
                    onClick={() => handleFormChange('borrowingType', 'Couple')}
                  >
                    <h4>Couple</h4>
                    <p>I am applying for a loan with my partner</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="borrowing-type-options">
                  <div 
                    className={`borrowing-type-option ${formData.loanPurpose === 'Owner-occupied' ? 'selected' : ''}`}
                    onClick={() => handleFormChange('loanPurpose', 'Owner-occupied')}
                  >
                    <h4>Owner Occupier</h4>
                    <p>I want to live in this property</p>
                  </div>
                  <div 
                    className={`borrowing-type-option ${formData.loanPurpose === 'Investor' ? 'selected' : ''}`}
                    onClick={() => handleFormChange('loanPurpose', 'Investor')}
                  >
                    <h4>Investor</h4>
                    <p>I want to rent out this property</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Income */}
          <div className="form-section">
            <div className="form-section-title">Total Income (Pre-tax)</div>
            <div className="income-row">
              <label className="income-label">
                {isCouple ? "First person's gross income/wages" : "Gross income/wages"}
                <div className="income-input-group">
                  <input
                    type="number"
                    name="grossIncome"
                    value={formData.grossIncome || ''}
                    onChange={onFormChange}
                    min="0"
                    required
                    placeholder="e.g. 7000"
                  />
                  <div className="frequency-buttons">
                    <button
                      type="button"
                      className={`frequency-button ${formData.incomeFrequency === 'weekly' ? 'selected' : ''}`}
                      onClick={() => handleFormChange('incomeFrequency', 'weekly')}
                    >
                      Weekly
                    </button>
                    <button
                      type="button"
                      className={`frequency-button ${formData.incomeFrequency === 'monthly' ? 'selected' : ''}`}
                      onClick={() => handleFormChange('incomeFrequency', 'monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      className={`frequency-button ${formData.incomeFrequency === 'yearly' ? 'selected' : ''}`}
                      onClick={() => handleFormChange('incomeFrequency', 'yearly')}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
              </label>
            </div>
            <div className="income-row">
              <label className="income-label">
                {isCouple ? "First person's other income (optional)" : "Other income (optional)"}
                <div className="income-input-group">
                  <input
                    type="number"
                    name="otherIncome"
                    value={formData.otherIncome || ''}
                    onChange={onFormChange}
                    min="0"
                    placeholder="e.g. 500"
                  />
                  <div className="frequency-buttons">
                    <button
                      type="button"
                      className={`frequency-button ${formData.otherIncomeFrequency === 'weekly' ? 'selected' : ''}`}
                      onClick={() => handleFormChange('otherIncomeFrequency', 'weekly')}
                    >
                      Weekly
                    </button>
                    <button
                      type="button"
                      className={`frequency-button ${formData.otherIncomeFrequency === 'monthly' ? 'selected' : ''}`}
                      onClick={() => handleFormChange('otherIncomeFrequency', 'monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      className={`frequency-button ${formData.otherIncomeFrequency === 'yearly' ? 'selected' : ''}`}
                      onClick={() => handleFormChange('otherIncomeFrequency', 'yearly')}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
              </label>
            </div>

            {/* Second person's income fields */}
            {isCouple && (
              <>
                <div className="form-section-title" style={{ marginTop: '1.5rem' }}>Second Person's Income</div>
                <div className="income-row">
                  <label className="income-label">
                    Second person's gross income/wages
                    <div className="income-input-group">
                      <input
                        type="number"
                        name="secondPersonIncome"
                        value={formData.secondPersonIncome || ''}
                        onChange={onFormChange}
                        min="0"
                        required
                        placeholder="e.g. 7000"
                      />
                      <div className="frequency-buttons">
                        <button
                          type="button"
                          className={`frequency-button ${formData.secondPersonIncomeFrequency === 'weekly' ? 'selected' : ''}`}
                          onClick={() => handleFormChange('secondPersonIncomeFrequency', 'weekly')}
                        >
                          Weekly
                        </button>
                        <button
                          type="button"
                          className={`frequency-button ${formData.secondPersonIncomeFrequency === 'monthly' ? 'selected' : ''}`}
                          onClick={() => handleFormChange('secondPersonIncomeFrequency', 'monthly')}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          className={`frequency-button ${formData.secondPersonIncomeFrequency === 'yearly' ? 'selected' : ''}`}
                          onClick={() => handleFormChange('secondPersonIncomeFrequency', 'yearly')}
                        >
                          Yearly
                        </button>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="income-row">
                  <label className="income-label">
                    Second person's other income (optional)
                    <div className="income-input-group">
                      <input
                        type="number"
                        name="secondPersonOtherIncome"
                        value={formData.secondPersonOtherIncome || ''}
                        onChange={onFormChange}
                        min="0"
                        placeholder="e.g. 500"
                      />
                      <div className="frequency-buttons">
                        <button
                          type="button"
                          className={`frequency-button ${formData.secondPersonOtherIncomeFrequency === 'weekly' ? 'selected' : ''}`}
                          onClick={() => handleFormChange('secondPersonOtherIncomeFrequency', 'weekly')}
                        >
                          Weekly
                        </button>
                        <button
                          type="button"
                          className={`frequency-button ${formData.secondPersonOtherIncomeFrequency === 'monthly' ? 'selected' : ''}`}
                          onClick={() => handleFormChange('secondPersonOtherIncomeFrequency', 'monthly')}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          className={`frequency-button ${formData.secondPersonOtherIncomeFrequency === 'yearly' ? 'selected' : ''}`}
                          onClick={() => handleFormChange('secondPersonOtherIncomeFrequency', 'yearly')}
                        >
                          Yearly
                        </button>
                      </div>
                    </div>
                  </label>
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
                placeholder="e.g. $2,500 per month"
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
                placeholder="e.g. $1,200 per month"
              />
            </label>
          </div>

          {/* Debts */}
          <div className="form-section">
            <div className="form-section-title">Debts</div>
            <div className="form-row">
              <div className="form-group">
                <label>HECS/HELP Debt</label>
                <div className="borrowing-type-options">
                  <div 
                    className={`borrowing-type-option ${formData.hasHecs === true ? 'selected' : ''}`}
                    onClick={() => handleFormChange('hasHecs', true)}
                  >
                    <h4>Yes</h4>
                    <p>I have a HECS/HELP debt</p>
                  </div>
                  <div 
                    className={`borrowing-type-option ${formData.hasHecs === false ? 'selected' : ''}`}
                    onClick={() => handleFormChange('hasHecs', false)}
                  >
                    <h4>No</h4>
                    <p>I don't have a HECS/HELP debt</p>
                  </div>
                </div>
              </div>
            </div>
            <label>
              Credit card limits (total across all cards)
              <input
                type="number"
                name="creditCardLimits"
                value={formData.creditCardLimits || ''}
                onChange={onFormChange}
                min="0"
                placeholder="e.g. $10,000 total credit card limits"
              />
            </label>
            <label>
              All loan repayments (monthly repayment)
              <input
                type="number"
                name="loanRepayment"
                value={formData.loanRepayment || ''}
                onChange={onFormChange}
                min="0"
                placeholder="e.g. $350 per month"
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
            <div className="form-row">
              <div className="form-group">
                <label>Interest Rate</label>
                <div className="interest-rate-options">
                  <div 
                    className={`interest-rate-option ${formData.interestRate === '5.5' ? 'selected' : ''}`}
                    onClick={() => handleFormChange('interestRate', '5.5')}
                  >
                    <h4>Owner-occupied</h4>
                    <p>5.5% p.a.</p>
                  </div>
                  <div 
                    className={`interest-rate-option ${formData.interestRate === '5.8' ? 'selected' : ''}`}
                    onClick={() => handleFormChange('interestRate', '5.8')}
                  >
                    <h4>Investor</h4>
                    <p>5.8% p.a.</p>
                  </div>
                  <div 
                    className={`interest-rate-option custom-rate ${formData.interestRate !== '6.0' && formData.interestRate !== '6.5' ? 'selected' : ''}`}
                  >
                    <h4>Custom Rate</h4>
                    <div className="custom-rate-input">
                      <input
                        type="number"
                        name="interestRate"
                        value={formData.interestRate}
                        onChange={onFormChange}
                        min="0"
                        max="20"
                        step="0.1"
                        placeholder="Enter rate"
                      />
                      <span>% p.a.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="navigation-buttons">
          <div className="button-tooltip-container">
            <button 
              onClick={onNext} 
              className="next-button"
              disabled={isButtonDisabled}
            >
              Next
            </button>
            {isButtonDisabled && (
              <div className="tooltip">
                Please fill in the following required fields:
                <ul>
                  {missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowingCalculator; 