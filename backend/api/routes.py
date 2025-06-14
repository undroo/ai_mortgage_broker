from fastapi import FastAPI, HTTPException, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from .models import ChatRequest, ChatResponse, EstimateRequest, EstimateResponse, GovernmentSchemesRequest, GovernmentSchemesResponse
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from functools import lru_cache
from threading import Lock
import logging
from datetime import datetime
from typing import Dict

# Add the project root directory to the Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)
from backend.models.chat_model import ChatModel
from backend.models.borrowing_model import BorrowingModel
from backend.services.scraper import DomainScraper
from backend.services.map import DistanceCalculator
from backend.api.models import PropertyInitializationRequest, PropertyInitializationResponse

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Create routers
chat_router = APIRouter(prefix="/chat", tags=["chat"])
borrowing_router = APIRouter(prefix="/api", tags=["borrowing"])
property_router = APIRouter(prefix="/property", tags=["property"])

# Initialize models
load_dotenv(project_root + '/config/.env')
api_key = os.getenv("GEMINI_API_KEY")
chat_model = ChatModel(api_key=api_key)
borrowing_model = BorrowingModel()

# In-memory storage for analysis sessions (replace with database in production)
analysis_sessions: Dict[str, Dict] = {}

class ServiceManager:
    """
    Manages service instances for property analysis.
    This class ensures thread-safe service initialization and access.
    """
    def __init__(self):
        self._scraper = None
        self._distance_calculator = None
        self._lock = None  # Will be used for thread safety if needed

    @property
    def scraper(self) -> DomainScraper:
        """Lazy initialization of DomainScraper."""
        if self._scraper is None:
            logger.info("Initializing DomainScraper")
            self._scraper = DomainScraper()
        return self._scraper

    @property
    def distance_calculator(self) -> DistanceCalculator:
        """Lazy initialization of DistanceCalculator."""
        if self._distance_calculator is None:
            logger.info("Initializing DistanceCalculator")
            self._distance_calculator = DistanceCalculator(os.getenv("GOOGLE_MAP_API_KEY"))
        return self._distance_calculator

@lru_cache()
def get_service_manager() -> ServiceManager:
    """
    Dependency injection function for ServiceManager.
    Uses lru_cache to ensure we only create one instance per process.
    """
    return ServiceManager()

@chat_router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a chat message and return the AI's response.
    Accepts an optional context string.
    
    Args:
        request (ChatRequest): The chat request containing the user's message and context
        
    Returns:
        ChatResponse: The AI's response and any suggested actions
        
    Raises:
        HTTPException: If there's an error processing the request
    """
    try:    
        context = request.context
        if borrowing_model.details != None:
            borrowing_response = borrowing_model.get_borrowing_response()
        else:   
            borrowing_response = None
        response_text, actions = chat_model.chat(request.message, context=context, borrowing_response=borrowing_response)
        print(actions)
        return ChatResponse(response=response_text, actions=actions)    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@borrowing_router.post("/estimate", response_model=EstimateResponse)
async def estimate_borrowing_power(request: EstimateRequest) -> EstimateResponse:
    """
    Estimate borrowing power based on user details.
    
    Args:
        request (EstimateRequest): The user's financial details
        
    Returns:
        EstimateResponse: The estimated borrowing power and loan repayment
        
    Raises:
        HTTPException: If there's an error processing the request
    """
    try:
        borrowing_model.update_details(request)
        response = borrowing_model.get_borrowing_response()
        estimate = response.borrowing_power
        loan_repayment = response.loan_repayment
        return EstimateResponse(estimate=estimate, loan_repayment=loan_repayment, summary="Coming soon")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@property_router.post("/search", response_model=PropertyInitializationResponse)
async def search_property(
    request: PropertyInitializationRequest,
    service_manager: ServiceManager = Depends(get_service_manager)
) -> PropertyInitializationResponse:
    """
    Initialize property analysis for a given URL.
    
    This endpoint:
    1. Creates a new analysis session
    2. Scrapes property data
    3. Calculates distances to points of interest
    4. Returns the complete analysis data
    
    Args:
        request (PropertyInitializationRequest): The initialization request containing the property URL
        service_manager (ServiceManager): Service manager instance
    
    Returns:
        PropertyInitializationResponse: Response containing the session ID and analysis data
    
    Note:
        For invalid URLs, the endpoint will return a 200 status code with an error message
        in the response body rather than raising an HTTPException.
    """
    try:
        # Generate session ID (using timestamp for simplicity)
        session_id = str(datetime.now().timestamp())
        logger.info(f"Starting property analysis for URL: {request.url}")
        
        # Initialize session
        analysis_sessions[session_id] = {
            "status": "initializing",
            "created_at": datetime.now().isoformat(),
            "url": request.url
        }
        
        # Validate URL format
        if not request.url.startswith("https://www.domain.com.au/"):
            error_msg = "Invalid URL format. URL must be from domain.com.au"
            logger.warning(f"Invalid URL format for session {session_id}: {request.url}")
            analysis_sessions[session_id].update({
                "status": "error",
                "error": error_msg
            })
            return PropertyInitializationResponse(
                session_id=session_id,
                status="error",
                error=error_msg
            )
        
        # Scrape property data
        logger.info(f"Starting property data scraping for session {session_id}")
        property_data = service_manager.scraper.get_property_data(request.url)
        
        if not property_data:
            error_msg = "Failed to fetch property data. The URL may be invalid or the property listing may no longer exist."
            logger.warning(f"Failed to fetch property data for session {session_id}: {request.url}")
            analysis_sessions[session_id].update({
                "status": "error",
                "error": error_msg
            })
            return PropertyInitializationResponse(
                session_id=session_id,
                status="error",
                error=error_msg
            )
        
        logger.info(f"Successfully scraped property data for session {session_id}")
        
        # Calculate distances if address is available
        distance_info = None
        if "address" in property_data and "full_address" in property_data["address"]:
            logger.info(f"Calculating distances for session {session_id}")
            distance_info = service_manager.distance_calculator.calculate_distances(
                property_data["address"]["full_address"],
                request.categories
            )
            logger.info(f"Successfully calculated distances for session {session_id}")
        
        # Update session with results
        analysis_sessions[session_id].update({
            "status": "ready",
            "property_data": property_data,
            "distance_info": distance_info,
            "initialized_at": datetime.now().isoformat()
        })
        
        logger.info(f"Successfully initialized property analysis for session {session_id}")
        
        return PropertyInitializationResponse(
            session_id=session_id,
            status="ready",
            property_data=property_data,
            distance_info=distance_info
        )
        
    except Exception as e:
        error_msg = f"An unexpected error occurred: {str(e)}"
        logger.error(f"Error initializing property analysis for session {session_id}: {str(e)}", exc_info=True)
        if session_id in analysis_sessions:
            analysis_sessions[session_id].update({
                "status": "error",
                "error": error_msg
            })
        
        return PropertyInitializationResponse(
            session_id=session_id,
            status="error",
            error=error_msg
        )

@borrowing_router.post("/government-schemes", response_model=GovernmentSchemesResponse)
async def get_government_schemes(request: GovernmentSchemesRequest) -> GovernmentSchemesResponse:
    print(request)
    return GovernmentSchemesResponse(schemes=borrowing_model.check_government_schemes(request.state))

# Create FastAPI app
app = FastAPI(
    title="Mortgage Mate API",
    description="API for the Mortgage Mate application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's address
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(chat_router)
app.include_router(borrowing_router)
app.include_router(property_router)