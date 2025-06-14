import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import Chat from './components/Chat';
import { HomeLoanFormData } from './components/BorrowingCalculator';
import Tabs from './components/Tabs';
import './App.css';
import BorrowingCalculator from './components/BorrowingCalculator';
import PropertyAnalysis from './components/PropertyAnalysis';
import PlanningStage from './components/PlanningStage';
import { useBudgetCalculation } from './hooks/useBudgetCalculation';
import { GovernmentScheme } from './components/PlanningStage';

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

// Create a client
const queryClient = new QueryClient();

// Property search query function
const fetchPropertyData = async (url: string) => {
  const response = await fetch('http://localhost:8000/property/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      categories: ['work', 'groceries', 'schools']
    }),
  });
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  
  const data = await response.json();
  console.log('Property data:', data);
  return data;
};

// Government schemes query function
const fetchGovernmentSchemes = async () => {
  const response = await fetch('http://localhost:8000/api/government-schemes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      state: 'NSW', // TODO: expand this to other states eventually
    }),
  });
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  
  const data = await response.json();
  return data.schemes;
};

function AppContent() {
  const [formData, setFormData] = useState<HomeLoanFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState(0);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [loanRepayment, setLoanRepayment] = useState<number | null>(null);
  const [estimateSummary, setEstimateSummary] = useState<string>('');
  const debounceRef = useRef<NodeJS.Timeout>();
  const [propertyUrl, setPropertyUrl] = useState<string>('');
  const [downPaymentType, setDownPaymentType] = useState<'percentage' | 'amount'>('percentage');
  const [downPaymentValue, setDownPaymentValue] = useState<string>('20');
  // React Query for property data
  const { 
    data: propertyResponse,
    isLoading: isPropertyLoading,
    error: propertyError,
    refetch: refetchProperty
  } = useQuery({
    queryKey: ['property', propertyUrl],
    queryFn: () => fetchPropertyData(propertyUrl),
    enabled: false, // Don't fetch automatically
  });

  // React Query for government schemes
  const { 
    data: schemes = [],
    isLoading: isSchemesLoading,
    error: schemesError
  } = useQuery({
    queryKey: ['governmentSchemes', formData],
    queryFn: fetchGovernmentSchemes,
    enabled: activeTab === 1, // Only fetch when on planning stage
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue: any = value;
    
    // Handle boolean fields
    if (name === 'hasHecs' || name === 'isFirstTimeBuyer') {
      newValue = value === 'true';
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

  const handlePropertySubmit = async (url: string) => {
    setPropertyUrl(url);
    refetchProperty();
  };

  const { totalBudget, downPaymentAmount } = useBudgetCalculation({
    estimate,
    downPaymentType,
    downPaymentValue,
  });

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
            <Tabs labels={['Stage 1: Borrowing Power', 'Stage 2: Planning', 'Stage 3: Analyze Properties']} activeIndex={activeTab} onTabChange={setActiveTab}>
              {activeTab === 0 && (
                <BorrowingCalculator formData={formData} onFormChange={handleFormChange} />
              )}
              {activeTab === 1 && (
                <PlanningStage
                  borrowingPower={estimate}
                  downPaymentType={downPaymentType}
                  downPaymentValue={downPaymentValue}
                  onDownPaymentTypeChange={setDownPaymentType}
                  onDownPaymentValueChange={setDownPaymentValue}
                  totalBudget={totalBudget}
                  downPaymentAmount={downPaymentAmount}
                  onNext={() => setActiveTab(2)}
                  onBack={() => setActiveTab(0)}
                  governmentSchemes={schemes}
                  isLoadingSchemes={isSchemesLoading}
                />
              )}
              {activeTab === 2 && (
                <PropertyAnalysis
                  url={propertyUrl}
                  onUrlChange={setPropertyUrl}
                  onSubmit={handlePropertySubmit}
                  propertyData={propertyResponse?.property_data || null}
                  distanceInfo={propertyResponse?.distance_info || null}
                  error={propertyError ? propertyError.message : null}
                  isLoading={isPropertyLoading}
                  onNext={() => setActiveTab(3)}
                  onBack={() => setActiveTab(1)}
                />
              )}
            </Tabs>
          </div>
        </main>
        <aside className="estimate-sidebar">
          <div className="estimate-container">
            {/* {estimate !== null && (
              <div className="estimate-box">
                <h3>Estimated Borrowing Power</h3>
                <p className="estimate-value">
                  ${estimate.toLocaleString()}
                </p>
              </div>
            )} */}
            {/* <div className="estimate-divider"></div> */}
            {totalBudget !== null && (
              <div className="estimate-box">
                <h3>Total Budget</h3>
                <p className="estimate-value total-budget">
                  ${totalBudget.toLocaleString()}
                </p>
                <div className="budget-breakdown">
                  <div className="breakdown-item">
                    <span>Borrowing Power:</span>
                    <span>${estimate?.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Down Payment:</span>
                    <span>${downPaymentAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="estimate-divider"></div>
            {loanRepayment !== null && (
              <div className="estimate-box">
                <h3>Estimated Monthly Repayment</h3>
                <p className="estimate-value">
                  ${loanRepayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            )}
            <div className="estimate-divider"></div>
            {estimateSummary && (
              <div className="estimate-box">
                <div className="estimate-summary">
                  <p>{estimateSummary}</p>
                </div>
              </div>
            )}
          </div>
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

// Wrap the app with QueryClientProvider
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
 