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

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a chat message and return the AI's response.
    
    Args:
        request (ChatRequest): The chat request containing the user's message
        
    Returns:
        ChatResponse: The AI's response
        
    Raises:
        HTTPException: If there's an error processing the request
    """
    try:
        print(f"Received message: {request.message}")
        response = chat_model.chat(request.message)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
