import React, { useState, useEffect, useRef } from 'react';
import Chat from './components/Chat';
import { HomeLoanFormData } from './components/BorrowingCalculator';
import Tabs from './components/Tabs';
import './App.css';
import BorrowingCalculator from './components/BorrowingCalculator';

const initialFormData: HomeLoanFormData = {
  isFirstTimeBuyer: false,
  loanPurpose: '',
  borrowingType: 'Individual',
  age: '30',
  dependents: '0',
  employmentType: '',
  grossIncome: '',
  incomeFrequency: 'monthly',
  otherIncome: '',
  otherIncomeFrequency: 'monthly',
  secondPersonIncome: '',
  secondPersonIncomeFrequency: 'monthly',
  secondPersonOtherIncome: '',
  secondPersonOtherIncomeFrequency: 'monthly',
  rentalIncome: '',
  livingExpenses: '',
  rentBoard: '',
  hasHecs: false,
  creditCardLimits: '',
  loanRepayment: '',
  loanTerm: '30',
  interestRate: '6.0',
};

function formDataToContext(form: HomeLoanFormData): string {
  const lines = [
    form.isFirstTimeBuyer ? `First-time home buyer: Yes` : `First-time home buyer: No`,
    form.borrowingType && `Borrowing as: ${form.borrowingType === 'couple' ? 'Couple' : 'Individual'}`,
    form.loanPurpose && `Loan purpose: ${form.loanPurpose}`,
    form.age ? `Age: ${form.age}` : '',
    form.dependents ? `Number of dependents: ${form.dependents}` : '',
    form.employmentType && `Employment type: ${form.employmentType}`,
    form.grossIncome ? `First person's gross income: $${form.grossIncome} (${form.incomeFrequency})` : '',
    form.otherIncome ? `First person's other income: $${form.otherIncome} (${form.otherIncomeFrequency})` : '',
    form.borrowingType === 'couple' && form.secondPersonIncome ? `Second person's gross income: $${form.secondPersonIncome} (${form.secondPersonIncomeFrequency})` : '',
    form.borrowingType === 'couple' && form.secondPersonOtherIncome ? `Second person's other income: $${form.secondPersonOtherIncome} (${form.secondPersonOtherIncomeFrequency})` : '',
    form.loanPurpose === 'Investor' && form.rentalIncome ? `Expected weekly rental income: $${form.rentalIncome}` : '',
    form.livingExpenses ? `Living expenses: $${form.livingExpenses}` : '',
    form.rentBoard ? `Rent/board: $${form.rentBoard}` : '',
    `HECS/HELP debt: ${form.hasHecs ? 'Yes' : 'No'}`,
    form.creditCardLimits ? `Credit card limits: $${form.creditCardLimits}` : '',
    form.loanRepayment ? `Personal/car loan repayment: $${form.loanRepayment}` : '',
    form.loanTerm ? `Loan term: ${form.loanTerm} years` : '',
    form.interestRate ? `Interest rate: ${form.interestRate}%` : '',
  ];
  return lines.filter(Boolean).join('\n');
}

function getEstimatePayload(form: HomeLoanFormData) {
  return {
    ...form,
    age: Number(form.age),
    dependents: Number(form.dependents),
    grossIncome: Number(form.grossIncome),
    otherIncome: Number(form.otherIncome),
    secondPersonIncome: Number(form.secondPersonIncome),
    secondPersonOtherIncome: Number(form.secondPersonOtherIncome),
    rentalIncome: Number(form.rentalIncome),
    livingExpenses: Number(form.livingExpenses),
    rentBoard: Number(form.rentBoard),
    creditCardLimits: Number(form.creditCardLimits),
    loanRepayment: Number(form.loanRepayment),
    loanTerm: Number(form.loanTerm),
    interestRate: Number(form.interestRate),
  };
}

function App() {
  const [formData, setFormData] = useState<HomeLoanFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState(0);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [loanRepayment, setLoanRepayment] = useState<number | null>(null);
  const [estimateSummary, setEstimateSummary] = useState<string>('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (name === 'isFirstTimeBuyer' || name === 'hasHecs') {
      if (value === 'true') {
        newValue = true;
      } else if (value === 'false') {
        newValue = false;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  // Debounced estimate API call
  useEffect(() => {
    if (activeTab !== 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch('http://localhost:8000/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getEstimatePayload(formData)),
      })
        .then(res => res.json())
        .then(data => {
          setEstimate(data.estimate);
          setLoanRepayment(data.loan_repayment);
          setEstimateSummary(data.summary);
        })
        .catch(() => {
          setEstimate(null);
          setLoanRepayment(null);
          setEstimateSummary('');
        });
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData, activeTab]);

  const tabLabels = [
    'Stage 1: Your Details',
    'Stage 2',
    'Stage 3',
    'Stage 4',
  ];

  const handleChatToggle = () => {
    setIsChatExpanded(!isChatExpanded);
  };

  const handleChatAction = (action: any) => {
    if (action.type === 'update_field') {
      // Create a synthetic event to update the form
      const syntheticEvent = {
        target: {
          name: action.payload.field,
          value: action.payload.value,
          type: typeof action.payload.value === 'boolean' ? 'radio' : 'text'
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleFormChange(syntheticEvent);
    }
  };

  return (
    <div className="site-wrapper">
      <header className="site-header">
        <nav className="navbar">
          <div className="site-name">Mortgage Mate</div>
        </nav>
      </header>
      <section className="hero-section">
        <h1 className="hero-headline">Get instant answers to your mortgage questions.</h1>
        <p className="hero-subtitle">Your free, friendly mortgage assistant.</p>
      </section>
      <div className="content-wrapper">
        <main className="main-content">
          <div className="main-left">
            <Tabs labels={tabLabels} activeIndex={activeTab} onTabChange={setActiveTab}>
              {activeTab === 0 && (
                <BorrowingCalculator formData={formData} onFormChange={handleFormChange} />
              )}
              {activeTab === 1 && (
                <div className="stage-card"><h2 className="stage-title">Stage 2 (Coming Soon)</h2></div>
              )}
              {activeTab === 2 && (
                <div className="stage-card"><h2 className="stage-title">Stage 3 (Coming Soon)</h2></div>
              )}
              {activeTab === 3 && (
                <div className="stage-card"><h2 className="stage-title">Stage 4 (Coming Soon)</h2></div>
              )}
            </Tabs>
          </div>
        </main>
        <aside className="estimate-sidebar">
          {estimate !== null && (
            <div className="estimate-box">
              <div className="estimate-label">Estimated Borrowing Power</div>
              <div className="estimate-value">${estimate.toLocaleString()}</div>
              <div className="estimate-divider"></div>
              <div className="estimate-label">Monthly Loan Repayment</div>
              <div className="estimate-value">${loanRepayment?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
          )}
        </aside>
      </div>
      <Chat 
        isExpanded={isChatExpanded}
        onToggle={handleChatToggle}
        context={formDataToContext(formData)}
        onAction={handleChatAction}
      />
    </div>
  );
}

export default App;
 