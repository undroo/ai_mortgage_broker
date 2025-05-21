import React, { useState, useEffect, useRef } from 'react';
import Chat from './components/Chat';
import HomeLoanStage1, { HomeLoanFormData } from './components/HomeLoanStage1';
import Tabs from './components/Tabs';
import './App.css';

const initialFormData: HomeLoanFormData = {
  loanPurpose: '',
  age: 30,
  dependents: 0,
  employmentType: '',
  grossIncome: 0,
  incomeFrequency: 'monthly',
  otherIncome: 0,
  otherIncomeFrequency: 'monthly',
  livingExpenses: 0,
  rentBoard: 0,
  hasHecs: false,
  hecsRepayment: 0,
  creditCardLimits: 0,
  loanRepayment: 0,
  loanTerm: 30,
  interestRate: 6.0,
};

function formDataToContext(form: HomeLoanFormData): string {
  const lines = [
    form.loanPurpose && `Loan purpose: ${form.loanPurpose}`,
    form.age ? `Age: ${form.age}` : '',
    form.dependents ? `Number of dependents: ${form.dependents}` : '',
    form.employmentType && `Employment type: ${form.employmentType}`,
    form.grossIncome ? `Gross income: $${form.grossIncome} (${form.incomeFrequency})` : '',
    form.otherIncome ? `Other income: $${form.otherIncome} (${form.otherIncomeFrequency})` : '',
    form.livingExpenses ? `Living expenses: $${form.livingExpenses}` : '',
    form.rentBoard ? `Rent/board: $${form.rentBoard}` : '',
    `HECS/HELP debt: ${form.hasHecs ? 'Yes' : 'No'}`,
    form.hasHecs && form.hecsRepayment ? `HECS/HELP monthly repayment: $${form.hecsRepayment}` : '',
    form.creditCardLimits ? `Credit card limits: $${form.creditCardLimits}` : '',
    form.loanRepayment ? `Personal/car loan repayment: $${form.loanRepayment}` : '',
    form.loanTerm ? `Loan term: ${form.loanTerm} years` : '',
    form.interestRate ? `Interest rate: ${form.interestRate}%` : '',
  ];
  return lines.filter(Boolean).join('\n');
}

function App() {
  const [formData, setFormData] = useState<HomeLoanFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState(0);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [estimateSummary, setEstimateSummary] = useState<string>('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    if (type === 'number') {
      newValue = value === '' ? '' : Number(value);
    }
    if (name === 'hasHecs') {
      newValue = value === 'true';
    }
    setFormData({ ...formData, [name]: newValue });
  };

  // Debounced estimate API call
  useEffect(() => {
    if (activeTab !== 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch('http://localhost:8000/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(res => res.json())
        .then(data => {
          setEstimate(data.estimate);
          setEstimateSummary(data.summary);
        })
        .catch(() => {
          setEstimate(null);
          setEstimateSummary('');
        });
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line
  }, [formData, activeTab]);

  const tabLabels = [
    'Stage 1: Your Details',
    'Stage 2',
    'Stage 3',
    'Stage 4',
  ];

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
      <main className={`main-content twocolumns${chatExpanded ? ' chat-expanded' : ''}`}>
        {!chatExpanded && (
          <div className="main-left">
            <Tabs labels={tabLabels} activeIndex={activeTab} onTabChange={setActiveTab}>
              {activeTab === 0 && (
                <>
                  <HomeLoanStage1 formData={formData} onFormChange={handleFormChange} />
                </>
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
        )}
        <div className={`main-right${chatExpanded ? ' expanded' : ''}`}>
          <div className="estimate-card">
            {estimate !== null && (
              <div className="estimate-box">
                <div className="estimate-label">Estimated Borrowing Power</div>
                <div className="estimate-value">${estimate.toLocaleString()}</div>
              </div>
              )}
          </div>
          <div className="chatbot-card">
            <button
              className="expand-chat-btn side"
              onClick={() => setChatExpanded((prev) => !prev)}
              aria-label={chatExpanded ? 'Show Application' : 'Expand Chat'}
            >
              {chatExpanded ? '»' : '«'}
            </button>
            <div className="chatbot-section-header">Your Mortgage Mate</div>
            <Chat context={formDataToContext(formData)} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
