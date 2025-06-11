from pydantic import BaseModel, Field as PydanticField
from typing import List, Dict, Any, Optional, Literal, Union
import enum

class ChatRequest(BaseModel):
    message: str
    context: str

class ActionType(enum.Enum):
    UPDATE_FIELD = "update_field"
    DO_NOTHING = "do_nothing"
    SUGGESTED_ANSWERS = "suggested_answers"

class IncomeFrequency(enum.Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class EmploymentType(enum.Enum):
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    SELF_EMPLOYED = "Self-employed"
    UNEMPLOYED = "Unemployed"

class LoanPurpose(enum.Enum):
    OWNER_OCCUPIED = "Owner-occupied"
    INVESTOR = "Investor"

class BorrowingType(enum.Enum):
    INDIVIDUAL = "Individual"
    COUPLE = "Couple"

class Field(enum.Enum):
    GROSS_INCOME = "grossIncome"
    INCOME_FREQUENCY = "incomeFrequency"
    OTHER_INCOME = "otherIncome"
    OTHER_INCOME_FREQUENCY = "otherIncomeFrequency"
    SECOND_PERSON_INCOME = "secondPersonIncome"
    SECOND_PERSON_INCOME_FREQUENCY = "secondPersonIncomeFrequency"
    SECOND_PERSON_OTHER_INCOME = "secondPersonOtherIncome"
    SECOND_PERSON_OTHER_INCOME_FREQUENCY = "secondPersonOtherIncomeFrequency"
    RENTAL_INCOME = "rentalIncome"
    LIVING_EXPENSES = "livingExpenses"
    RENT_BOARD = "rentBoard"
    DEPENDENTS = "dependents"
    CREDIT_CARD_LIMITS = "creditCardLimits"
    LOAN_REPAYMENT = "loanRepayment"
    HAS_HECS = "hasHecs"
    AGE = "age"
    EMPLOYMENT_TYPE = "employmentType"
    LOAN_PURPOSE = "loanPurpose"
    LOAN_TERM = "loanTerm"
    INTEREST_RATE = "interestRate"
    BORROWING_TYPE = "borrowingType"

class SuggestedAnswersPayload(BaseModel):
    field: Field
    value: List[str]

class UpdateFieldPayload(BaseModel):
    field: Field
    value: Union[str, int, float, bool]

class Action(BaseModel):
    type: ActionType
    payload: Union[UpdateFieldPayload, SuggestedAnswersPayload]

class ChatResponse(BaseModel):
    response: str
    actions: Optional[List[Action]] = None

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
