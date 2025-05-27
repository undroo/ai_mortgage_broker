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
from backend.models.chat_model import ChatModel
from backend.models.borrowing_model import BorrowingModel

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
borrowing_model = BorrowingModel()

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
    borrowingType: str

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
        # need to add to context if BorrowingModel is used
        if borrowing_model.details != None:
            context = request.context + f"\nBorrowing model: {borrowing_model.get_borrowing_response()}"
            print(f"Updated context: {context}")
        else:
            context = request.context
        response = chat_model.chat(request.message, context=context)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/estimate", response_model=EstimateResponse)
async def estimate_borrowing_power(request: EstimateRequest) -> EstimateResponse:
    """
    Estimate borrowing power based on user details. Placeholder logic.
    """
    borrowing_model.update_details(request)
    response = borrowing_model.get_borrowing_response()
    estimate = response.borrowing_power
    return EstimateResponse(estimate=estimate, summary="Coming soon")
