import React, { useState } from 'react';
import Chat from './components/Chat';
import HomeLoanStage1, { HomeLoanFormData } from './components/HomeLoanStage1';
import Tabs from './components/Tabs';
import './App.css';

const initialFormData: HomeLoanFormData = {
  loanPurpose: '',
  age: '',
  income: '',
  expenses: '',
  debts: '',
  employmentType: '',
};

function formDataToContext(form: HomeLoanFormData): string {
  if (!form.loanPurpose && !form.age && !form.income && !form.expenses && !form.employmentType) return '';
  return [
    form.loanPurpose && `Loan purpose: ${form.loanPurpose}`,
    form.age && `Age: ${form.age}`,
    form.income && `Annual income: $${form.income}`,
    form.expenses && `Monthly expenses: $${form.expenses}`,
    form.debts && form.debts !== '0' && `Existing debts: $${form.debts}`,
    form.employmentType && `Employment type: ${form.employmentType}`,
  ].filter(Boolean).join('\n');
}

function App() {
  const [formData, setFormData] = useState<HomeLoanFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState(0);
  const [chatExpanded, setChatExpanded] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
                <HomeLoanStage1 formData={formData} onFormChange={handleFormChange} />
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
          <div className="chatbot-card">
            <button
              className="expand-chat-btn side"
              onClick={() => setChatExpanded((prev) => !prev)}
              aria-label={chatExpanded ? 'Show Application' : 'Expand Chat'}
            >
              {chatExpanded ? '»' : '«'}
            </button>
            <Chat context={formDataToContext(formData)} />
          </div>
        </div>
      </main>
      <footer className="site-footer">
        <p className="footer-disclaimer">This is not financial advice. For professional help, speak to a licensed mortgage broker.</p>
      </footer>
    </div>
  );
}

export default App;
