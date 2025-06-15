# Borrowing Model
from pydantic import BaseModel
import json
from models.tax_rates import calculate_tax
from models.hec_rates import calculate_hecs_repayment
from api.models import EstimateRequest, BorrowingResponse, GovernmentScheme

class BorrowingModel:
    def __init__(self):
        self.details = None
        self.assumptions = self.load_assumptions()
        self.government_schemes = self.load_government_schemes()
        self.eligible_government_schemes = []
        
    def load_assumptions(self):
        with open('backend/utils/assumptions.json', 'r') as f:
            return json.load(f)
        
    def load_government_schemes(self):
        with open('backend/utils/government_schemes.json', 'r') as f:
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
                total_income=self.yearly_income+self.yearly_other_income,
                total_income_after_tax=self.yearly_income_after_tax,
                total_expenses=self.total_expense,
                hasHecs=self.details.hasHecs,
                net_income=self.yearly_income_after_expenses,
                borrowing_power=self.borrowing_power,
                stated_living_expenses=self.yearly_stated_livingExpenses,
                yearly_hecs_repayment=self.yearly_hecs_repayment,
                employment_type=self.details.employmentType,
                loan_purpose=self.details.loanPurpose,
                loan_repayment=self.expected_loan_repayment,
                hem_benchmark=self.hem_benchmark,
                monthly_hem_benchmark=self.hem_benchmark/12
            )
        else:
            return None
        
    def get_eligible_government_schemes(self):
        if self.eligible_government_schemes is not None:
            return self.eligible_government_schemes
        else:
            return []
    
    def calculate_total_income(self): # Convert all income to yearly
        # First person's income
        if self.details.incomeFrequency == "weekly":
            self.yearly_income = self.details.grossIncome * 52
            self.yearly_other_income = self.details.otherIncome * 52
        elif self.details.incomeFrequency == "monthly":
            self.yearly_income = self.details.grossIncome * 12
            self.yearly_other_income = self.details.otherIncome * 12
        else:
            self.yearly_income = self.details.grossIncome
            self.yearly_other_income = self.details.otherIncome

        # Second person's income
        if self.details.borrowingType == "Individual":
            self.yearly_secondPersonIncome = 0
            self.yearly_secondPersonOtherIncome = 0
        else:
            if self.details.secondPersonIncomeFrequency == "weekly":
                self.yearly_secondPersonIncome = self.details.secondPersonIncome * 52
                self.yearly_secondPersonOtherIncome = self.details.secondPersonOtherIncome * 52
            elif self.details.secondPersonIncomeFrequency == "monthly":
                self.yearly_secondPersonIncome = self.details.secondPersonIncome * 12
                self.yearly_secondPersonOtherIncome = self.details.secondPersonOtherIncome * 12
            else:
                self.yearly_secondPersonIncome = self.details.secondPersonIncome
                self.yearly_secondPersonOtherIncome = self.details.secondPersonOtherIncome

        # Rental income
        if self.details.loanPurpose == "Investor":
            self.yearly_rentalIncome = self.details.rentalIncome * 52 * 0.85 # Take a haircut for maintenance and repairs
        else:
            self.yearly_rentalIncome = 0

        # Add rental income to other income, split into equal parts for couples
        if self.details.borrowingType == "Individual":
            self.yearly_other_income += self.yearly_rentalIncome
        else:
            self.yearly_other_income += self.yearly_rentalIncome / 2
            self.yearly_secondPersonOtherIncome += self.yearly_rentalIncome / 2

        # Need to apply taxes to income
        self.household_income = self.yearly_income + self.yearly_other_income + self.yearly_secondPersonIncome + self.yearly_secondPersonOtherIncome
        self.yearly_income_after_tax = self.yearly_income + self.yearly_other_income - calculate_tax(self.yearly_income+self.yearly_other_income)
        self.yearly_secondPersonIncome_after_tax = self.yearly_secondPersonIncome + self.yearly_secondPersonOtherIncome - calculate_tax(self.yearly_secondPersonIncome+self.yearly_secondPersonOtherIncome)
        
        # Total income
        self.yearly_income_after_tax += self.yearly_secondPersonIncome_after_tax

    def calculate_total_expenses(self): # Convert all expenses to yearly
        # Rent/Board expenses
        self.yearly_rentBoard = self.details.rentBoard*12

        self.calculate_living_expenses()
        self.calculate_loan_repayment()
        self.total_expense = self.yearly_rentBoard + self.yearly_livingExpenses + self.yearly_total_loan_repayment

    def calculate_loan_repayment(self):
        if self.details.hasHecs == True:
            self.yearly_hecs_repayment = calculate_hecs_repayment(self.yearly_income_after_tax)
        else:
            self.yearly_hecs_repayment = 0

        self.yearly_credit_card_limits = self.details.creditCardLimits
        self.yearly_loan_repayment = self.details.loanRepayment * 12
        self.yearly_total_loan_repayment = self.yearly_loan_repayment + self.yearly_credit_card_limits * 0.04 + self.yearly_hecs_repayment

    def calculate_living_expenses(self): # Convert all living expenses to yearly
        self.yearly_livingExpenses = self.details.livingExpenses*12
        self.yearly_stated_livingExpenses = self.yearly_livingExpenses # Stated expenses
        # Living expenses cannot be below the HEM benchmark
        if self.details.dependents > 3:
            dependents = 3
        else:
            dependents = self.details.dependents
        hem_benchmark = self.assumptions['hem_benchmark']['simple'][self.details.borrowingType][str(dependents)]
        self.hem_benchmark = hem_benchmark * 12
        if self.yearly_livingExpenses < self.hem_benchmark:
            self.yearly_livingExpenses = self.hem_benchmark

    def calculate_borrowing_power(self):
        self.yearly_income_after_expenses = self.yearly_income_after_tax - self.total_expense
        if self.yearly_income_after_expenses < 0:
            self.borrowing_power = 0
            self.expected_loan_repayment = 0
        else:
            # PV = P * (1 - (1 + r)^-n) / r 
            buffer_rate = 0.03
            pre_buffer_rate = self.details.interestRate/100
            rate = self.details.interestRate/100 + buffer_rate
            self.borrowing_power = round(self.yearly_income_after_expenses * (1 - (1 + rate)**-self.details.loanTerm) / rate, 0)
            # calculate loan repayment on a monthly basis
            self.expected_loan_repayment = self.borrowing_power * pre_buffer_rate/12 * (1 + pre_buffer_rate/12)**(self.details.loanTerm*12) / ((1 + pre_buffer_rate/12)**(self.details.loanTerm*12) - 1)

    def check_government_schemes(self, state):
        schemes = []
        for scheme_name, scheme in self.government_schemes[state]['first_home_schemes'].items():
            new_scheme = GovernmentScheme(
                name=scheme['name'],
                eligibilityDescription=scheme['eligibility'],
                offer=scheme['offer'],
                eligibilityRequirements=[]
            )
            for requirement in scheme['eligibilityRequirements']:
                if requirement == "isFirstTimeBuyer":
                    if self.details.isFirstTimeBuyer:
                        new_scheme.eligibilityRequirements.append(("First time buyer", True))
                    else:
                        new_scheme.eligibilityRequirements.append(("First time buyer", False))
                elif requirement == "borrowingType":
                    if self.details.borrowingType is not None and self.details.borrowingType == "Individual":
                        if self.household_income <= scheme['eligibilityRequirements']['borrowingType']['Individual']['householdIncome']:
                            new_scheme.eligibilityRequirements.append(("Household income below $125,000", True))
                        else:
                            new_scheme.eligibilityRequirements.append(("Household income below $125,000", False))
                    else:
                        if self.household_income <= scheme['eligibilityRequirements']['borrowingType']['Couple']['householdIncome']:
                            new_scheme.eligibilityRequirements.append(("Household income below $200,000", True))
                        else:
                            new_scheme.eligibilityRequirements.append(("Household income below $200,000", False))
                elif requirement == "loanPurpose":
                    if self.details.loanPurpose is not None and self.details.loanPurpose == "Owner-occupied":
                        new_scheme.eligibilityRequirements.append(("Owner-occupied", True))
                    else:
                        new_scheme.eligibilityRequirements.append(("Owner-occupied", False))

            schemes.append(new_scheme)

        self.eligible_government_schemes = schemes
        return schemes