from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add the project root directory to the Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)
from backend.chat_model import ChatModel

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's address
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load environment variables
load_dotenv(project_root + '/config/.env')
api_key = os.getenv("GEMINI_API_KEY")
# Initialize chat model
chat_model = ChatModel(api_key=api_key)

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str

class EstimateRequest(BaseModel):
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

class EstimateResponse(BaseModel):
    estimate: float
    summary: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a chat message and return the AI's response.
    Accepts an optional context string.
    
    Args:
        request (ChatRequest): The chat request containing the user's message and context
        
    Returns:
        ChatResponse: The AI's response
        
    Raises:
        HTTPException: If there's an error processing the request
    """
    try:
        print(f"Received message: {request.message}")
        print(f"Received context: {request.context}")
        response = chat_model.chat(request.message, context=request.context)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/estimate", response_model=EstimateResponse)
async def estimate_borrowing_power(request: EstimateRequest) -> EstimateResponse:
    """
    Estimate borrowing power based on user details. Placeholder logic.
    """
    # Convert all income to monthly
    def to_monthly(amount, freq):
        if freq == 'weekly':
            return amount * 52 / 12
        if freq == 'annual':
            return amount / 12
        return amount
    monthly_income = to_monthly(request.grossIncome, request.incomeFrequency) + to_monthly(request.otherIncome, request.otherIncomeFrequency)
    monthly_expenses = request.livingExpenses + request.rentBoard + request.loanRepayment + (request.hecsRepayment if request.hasHecs else 0)
    # Placeholder: 30% of net income, minus debts, times a factor
    net_monthly = monthly_income - monthly_expenses
    estimate = max(0, net_monthly * 12 * 5 - request.creditCardLimits)  # 5x annual net, minus credit card limits
    summary = (
        f"User earns ${monthly_income*12:,.0f}/year, has ${request.creditCardLimits:,.0f} in credit card limits, "
        f"${request.loanRepayment:,.0f}/mo in loan repayments, {('has' if request.hasHecs else 'no')} HECS/HELP debt, "
        f"and may borrow approximately ${estimate:,.0f}."
    )
    return EstimateResponse(estimate=estimate, summary=summary)
