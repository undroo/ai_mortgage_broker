import React from 'react';
import './PlanningStage.css';

interface PlanningStageProps {
  borrowingPower: number | null;
  downPaymentType: 'percentage' | 'amount';
  downPaymentValue: string;
  onDownPaymentTypeChange: (type: 'percentage' | 'amount') => void;
  onDownPaymentValueChange: (value: string) => void;
  totalBudget: number | null;
  downPaymentAmount: number | null;
  governmentSchemes: GovernmentScheme[];
  isLoadingSchemes: boolean;
  onNext: () => void;
  onBack: () => void;
}

export interface GovernmentScheme {
  name: string;
  eligibilityDescription: string;
  offer: string;
  eligibilityRequirements: Array<[string, boolean]>;
}

const PlanningStage: React.FC<PlanningStageProps> = ({
  borrowingPower,
  downPaymentType,
  downPaymentValue,
  onDownPaymentTypeChange,
  onDownPaymentValueChange,
  totalBudget,
  downPaymentAmount,
  onNext,
  onBack,
  governmentSchemes
}) => {
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    validateInput();
  }, [downPaymentValue, downPaymentType, borrowingPower]);

  const validateInput = () => {
    if (!borrowingPower || !downPaymentValue) {
      setError(null);
      return;
    }

    const downPayment = parseFloat(downPaymentValue);
    if (isNaN(downPayment)) {
      setError('Please enter a valid number');
      return;
    }

    setError(null);

    if (downPaymentType === 'percentage') {
      if (downPayment < 5 || downPayment > 100) {
        setError('Down payment percentage must be between 5% and 100%');
      }
    } else {
      if (downPayment < borrowingPower * 0.05) {
        setError('Down payment must be at least 5% of the total property value');
      }
    }
  };

  const handleDownPaymentChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    onDownPaymentValueChange(numericValue);
  };

  return (
    <div className="planning-stage">
      <div className="stage-card">
        <h2 className="stage-title">Stage 2: Budget Planning</h2>
        
        <div className="borrowing-power-summary">
          <h3>Your Borrowing Power</h3>
          <p className="amount">${borrowingPower?.toLocaleString() || '0'}</p>
        </div>

        <div className="down-payment-section">
          <h3>Down Payment</h3>
          <div className="down-payment-type">
            <label>
              <input
                type="radio"
                value="percentage"
                checked={downPaymentType === 'percentage'}
                onChange={(e) => onDownPaymentTypeChange(e.target.value as 'percentage')}
              />
              Percentage
            </label>
            <label>
              <input
                type="radio"
                value="amount"
                checked={downPaymentType === 'amount'}
                onChange={(e) => onDownPaymentTypeChange(e.target.value as 'amount')}
              />
              Amount
            </label>
          </div>

          <div className="input-group">
            <input
              type="text"
              value={downPaymentValue}
              onChange={(e) => handleDownPaymentChange(e.target.value)}
              placeholder={downPaymentType === 'percentage' ? 'Enter percentage (e.g., 20)' : 'Enter amount'}
            />
            <span className="input-suffix">
              {downPaymentType === 'percentage' ? '%' : '$'}
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        {totalBudget && (
          <div className="total-budget-section">
            <h3>Your Total Budget</h3>
            <p className="amount">${totalBudget.toLocaleString()}</p>
            <div className="budget-breakdown">
              <div className="breakdown-item">
                <span>Borrowing Power:</span>
                <span>${borrowingPower?.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span>Down Payment:</span>
                <span>${downPaymentAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="government-schemes-section">
          <h3>Government Schemes</h3>
          {governmentSchemes.length > 0 ? (
            <div className="schemes-list">
              {governmentSchemes.map((scheme, index) => (
                <div key={index} className="scheme-card">
                  <div className="scheme-header">
                    <h4>{scheme.name}</h4>
                    <div className="scheme-offer">{scheme.offer}</div>
                  </div>
                  <p className="scheme-description">{scheme.eligibilityDescription}</p>
                  <div className="scheme-requirements">
                    <h5>Eligibility Requirements:</h5>
                    <ul>
                      {scheme.eligibilityRequirements.map(([requirement, isEligible], i) => (
                        <li key={i} className={isEligible ? 'eligible' : 'not-eligible'}>
                          <span className="requirement-icon">
                            {isEligible ? '✓' : '✗'}
                          </span>
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-schemes">
              No government schemes available for your current situation.
            </div>
          )}
        </div>

        <div className="navigation-buttons">
          <button onClick={onBack} className="back-button">Back</button>
          <button 
            onClick={onNext} 
            className="next-button"
            disabled={!totalBudget || !!error}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanningStage; 