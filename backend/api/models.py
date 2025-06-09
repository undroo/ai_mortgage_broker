from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChatRequest(BaseModel):
    message: str
    context: str

class ChatResponse(BaseModel):
    response: str
    actions: Optional[List[Dict[str, Any]]] = None

class EstimateRequest(BaseModel):
    grossIncome: float
    incomeFrequency: str
    otherIncome: float
    otherIncomeFrequency: str
    secondPersonIncome: float
    secondPersonIncomeFrequency: str
    secondPersonOtherIncome: float
    secondPersonOtherIncomeFrequency: str
    rentalIncome: float
    livingExpenses: float
    rentBoard: float
    dependents: int
    creditCardLimits: float
    loanRepayment: float
    hasHecs: bool
    age: int
    employmentType: str
    loanPurpose: str
    loanTerm: int
    interestRate: float
    borrowingType: str

class EstimateResponse(BaseModel):
    estimate: float
    loan_repayment: float
    summary: str

class BorrowingResponse(BaseModel):
    total_income: float
    total_income_after_tax: float
    total_expenses: float
    stated_living_expenses: float
    hem_benchmark: float
    monthly_hem_benchmark: float
    hasHecs: bool
    yearly_hecs_repayment: float
    employment_type: str
    net_income: float
    borrowing_power: float
    loan_purpose: str
    loan_repayment: float
