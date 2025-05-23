# Borrowing Model
from pydantic import BaseModel
import json

class EstimateRequest(BaseModel): # Simplified borrowing model
    grossIncome: float
    incomeFrequency: str
    otherIncome: float
    otherIncomeFrequency: str
    livingExpenses: float
    rentBoard: float
    dependents: int
    creditCardLimits: float
    loanRepayment: float
    hasHecs: bool
    hecsRepayment: float
    age: int
    employmentType: str
    loanPurpose: str
    loanTerm: int
    interestRate: float
    borrowingType: str

class BorrowingResponse(BaseModel):
    total_income: float
    total_expenses: float
    hasHecs: bool
    net_income: float
    borrowing_power: float

class BorrowingModel:
    def __init__(self):
        self.details = None
        self.assumptions = self.load_assumptions()
        
    def load_assumptions(self):
        with open('backend/utils/assumptions.json', 'r') as f:
            return json.load(f)

    def update_details(self, request: EstimateRequest):
        self.details = request
        # Calculate borrowing power
        # 1. Calculate the total income
        self.calculate_total_income()
        # 2. Calculate the total expenses
        self.calculate_total_expenses()
        # 3. Calculate the borrowing power
        self.calculate_borrowing_power()

    def get_borrowing_response(self):
        if self.details != None:
            return BorrowingResponse(
                total_income=self.yearly_income,
                total_expenses=self.total_expense,
                hasHecs=self.details.hasHecs,
                net_income=self.yearly_income_after_expenses,
                borrowing_power=self.borrowing_power
            )
        else:
            return None
    
    def calculate_total_income(self): # Convert all income to yearly
        if self.details.incomeFrequency == "weekly":
            self.yearly_income = self.details.grossIncome * 52
            self.yearly_other_income = self.details.otherIncome * 52
        elif self.details.incomeFrequency == "monthly":
            self.yearly_income = self.details.grossIncome * 12
            self.yearly_other_income = self.details.otherIncome * 12
        else:
            self.yearly_income = self.details.grossIncome
            self.yearly_other_income = self.details.otherIncome

        
        
    def calculate_total_expenses(self): # Convert all expenses to yearly
        # Rent/Board expenses
        self.yearly_rentBoard = self.details.rentBoard*12

        self.calculate_living_expenses()
        self.calculate_loan_repayment()
        self.total_expense = self.yearly_rentBoard + self.yearly_livingExpenses + self.yearly_total_loan_repayment

    def calculate_loan_repayment(self):
        self.yearly_credit_card_limits = self.details.creditCardLimits
        self.yearly_loan_repayment = self.details.loanRepayment * 12
        self.yearly_total_loan_repayment = self.yearly_loan_repayment + self.yearly_credit_card_limits * 0.04

    def calculate_living_expenses(self): # Convert all living expenses to yearly
        self.yearly_livingExpenses = self.details.livingExpenses*12


        # Living expenses cannot be below the HEM benchmark
        if self.details.dependents > 3:
            dependents = 3
        else:
            dependents = self.details.dependents
        hem_benchmark = self.assumptions['hem_benchmark']['simple'][self.details.borrowingType][str(dependents)]
        self.hem_benchmark = hem_benchmark * 12
        if self.yearly_livingExpenses < hem_benchmark:
            self.yearly_livingExpenses = hem_benchmark

    def calculate_borrowing_power(self):
        self.yearly_income_after_expenses = self.yearly_income - self.total_expense
        if self.yearly_income_after_expenses < 0:
            self.borrowing_power = 0
        else:
            # PV = P * (1 - (1 + r)^-n) / r 
            self.borrowing_power = round(self.yearly_income_after_expenses * (1 - (1 + self.details.interestRate)**-self.details.loanTerm) / self.details.interestRate, 2)

