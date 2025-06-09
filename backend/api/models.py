from pydantic import BaseModel, Field as PydanticField
from typing import List, Dict, Any, Optional, Literal, Union
import enum

class ChatRequest(BaseModel):
    message: str
    context: str

class ActionType(enum.Enum):
    UPDATE_FIELD = "update_field"
    DO_NOTHING = "do_nothing"

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

class Action(BaseModel):
    type: ActionType
    field: Field
    value: Union[str, int, float, bool]

    @property
    def validated_value(self) -> Any:
        """Validate and convert the value based on the field type."""
        if self.field == Field.INCOME_FREQUENCY:
            return IncomeFrequency(self.value)
        elif self.field == Field.OTHER_INCOME_FREQUENCY:
            return IncomeFrequency(self.value)
        elif self.field == Field.SECOND_PERSON_INCOME_FREQUENCY:
            return IncomeFrequency(self.value)
        elif self.field == Field.SECOND_PERSON_OTHER_INCOME_FREQUENCY:
            return IncomeFrequency(self.value)
        elif self.field == Field.EMPLOYMENT_TYPE:
            return EmploymentType(self.value)
        elif self.field == Field.LOAN_PURPOSE:
            return LoanPurpose(self.value)
        elif self.field == Field.BORROWING_TYPE:
            return BorrowingType(self.value)
        elif self.field in [Field.GROSS_INCOME, Field.OTHER_INCOME, Field.SECOND_PERSON_INCOME, 
                          Field.SECOND_PERSON_OTHER_INCOME, Field.RENTAL_INCOME, Field.LIVING_EXPENSES,
                          Field.RENT_BOARD, Field.CREDIT_CARD_LIMITS, Field.LOAN_REPAYMENT,
                          Field.INTEREST_RATE]:
            return float(self.value)
        elif self.field in [Field.DEPENDENTS, Field.AGE, Field.LOAN_TERM]:
            return int(self.value)
        elif self.field == Field.HAS_HECS:
            return bool(self.value)
        return self.value

    class Config:
        json_schema_extra = {
            "example": {
                "type": "update_field",
                "field": "grossIncome",
                "value": 100000
            }
        }

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
