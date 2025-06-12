"""
This module contains the ChatModel class, which is used to interact with the chat model.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from google import genai
import logging
from pathlib import Path
import sys

project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)
from backend.api.models import ChatResponse, Action, ActionType, Field

logger = logging.getLogger(__name__)

class ChatModel:
    """
    A class for interacting with the chat model.
    """

    def __init__(self, api_key: str, system_messages: Optional[List[str]] = None):
        self.api_key = api_key
        self.logger = logger
        self.message_history: List[Dict[str, str]] = []
        
        # Initialize with default system messages if none provided
        self.system_messages = system_messages or [
            "You are a helpful mortgage AI assistant that provides accurate and professional guidance on mortgage-related questions.",
            "You should be knowledgeable about different types of mortgages, interest rates, and the mortgage application process.",
            "Always maintain a professional and helpful tone while providing clear and concise information.",
            "You are a mortgage assistant based in NSW Sydney, Australia. Do not provide any information that is not relevant to NSW",
            "You are not allowed to provide any information that is not related to mortgages or the mortgage application process.",
            "You are allowed to provide information about government schemes that are relevant to the user's situation.",
            "Be proactive in asking questions about the user's situation to provide the most accurate information.",
            "You are allowed to provide information about the borrowing power of the user based on their details.",
            "While you do not provide financial advice, you can provide information around how changes in their details affect their borrowing power.",
            "You should be succinct, imagine you are messaging and your audience is using a mobile phone. Remain professional.",
            "Use the information provided by the user actively rather than being generic, for example if a user has zero credit card limits, do not suggest on reducing it as they cannot",
            "Prompt to user to answer more questions if they are not providing enough information.",
            "When creating actions, do not create actions that are not relevant to the user's situation.",
            "When creating actions around income, make sure to match the income and frequency based on what the user said",
            "Try not to ask multiple questions at once, ask one question at a time",
            # Descriptions of fields
            "gross income is the income before tax received by the person during each of the income frequencies",
            "If there is action to update anything with frequency. If the frequency is not weekly, monthly or yearly, adjust the value to the annual amount and change the frequency to yearly",

        ]

        # Add government schemes to system messages
        with open('backend/utils/government_schemes.json', 'r') as f:
            self.government_schemes = json.load(f)
        self.system_messages.append(f"Government schemes in NSW: {self.government_schemes}")
        
        # Add system messages to history
        for message in self.system_messages:
            self.message_history.append({
                "role": "system",
                "content": message,
                "timestamp": datetime.now().isoformat()
            })
        
        self._setup_gemini()

    def _setup_gemini(self) -> None:
        """Set up the Gemini API with the provided key."""
        try:
            if self.api_key:
                # genai.configure(api_key=self.api_key)
                # self.model = genai.GenerativeModel('gemini-2.0-flash')
                self.client = genai.Client(api_key=self.api_key)
                
                self.logger.info("Gemini API configured successfully")
            else:
                self.logger.warning("API key not set, Gemini API will not be available")
        except Exception as e:
            self.logger.error(f"Failed to configure Gemini API: {str(e)}")
            raise

    def _format_conversation_history(self) -> str:
        """
        Format the conversation history into a string that can be used as context.
        
        Returns:
            str: Formatted conversation history
        """
        formatted_history = []
        for msg in self.message_history:
            role = msg["role"].capitalize()
            content = msg["content"]
            formatted_history.append(f"{role}: {content}")
        
        return "\n".join(formatted_history)

    def _generate_response(self, question: str, context: str = None) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Generate a response using the model, taking into account conversation history.
        
        Args:
            question (str): The user's question
            context (str): Optional context about the user's situation
            
        Returns:
            Tuple[str, List[Dict[str, Any]]]: The model's response text and list of actions
        """
        # Format the conversation history
        conversation_history = self._format_conversation_history()
        
        # Create the prompt with conversation history
        prompt = f"""Previous conversation:
            {conversation_history}

            Current question: {question}

            Valid field names and their allowed values:
            - isFirstTimeBuyer: "true", "false"
            - grossIncome: number
            - incomeFrequency: "weekly", "monthly", "yearly"
            - otherIncome: number
            - otherIncomeFrequency: "weekly", "monthly", "yearly"
            - secondPersonIncome: number
            - secondPersonIncomeFrequency: "weekly", "monthly", "yearly"
            - secondPersonOtherIncome: number
            - secondPersonOtherIncomeFrequency: "weekly", "monthly", "yearly"
            - rentalIncome: number
            - livingExpenses: number
            - rentBoard: number
            - dependents: number
            - creditCardLimits: number
            - loanRepayment: number
            - hasHecs: "true", "false"
            - age: number
            - employmentType: "Full-time", "Part-time", "Self-employed", "Unemployed"
            - loanPurpose: "Owner-occupied", "Investor"
            - loanTerm: number
            - interestRate: number
            - borrowingType: "Individual", "Couple"

            A few notes: 
            - rentalIncome is a weekly amount
            - livingExpenses is a monthly amount
            - rentBoard is a monthly amount
            - if someone provides information that is not in the right frequency, adjust it to the annual amount and change the relevant frequency to annual. Eg. if someone said they earn 1k a fortnight, convert that to be 26k a year and change the frequency to yearly.

            The response should be helpful and take into account the conversation history
            and the context of the user including their details. If there is a borrowing model, 
            please use refer to it if relevant. 
            context: {context}

            Actions:
            UPDATE_FIELD: Create when the user provides information that is not in the context. Or if the user is correcting information that is already in the context.
            SUGGESTED_ANSWERS: Create when you are asking a question to the user, an example is when asking if a user has HECs debt, you can suggest answers like "Yes" or "No".
            """
        
        self.logger.info("Generating response with conversation history...")
        self.logger.debug(f"Using prompt: {prompt}")
        
        # Generate response
        response = self.client.models.generate_content(
            contents=prompt,
            model="gemini-2.0-flash",   
            config={
                "response_mime_type": "application/json",
                "response_schema": ChatResponse
            }
        )
        
        try:
            # Log the raw response for debugging
            self.logger.info("Raw model response:")
            self.logger.info(response.text)
            
            # Parse the response as JSON
            response_data = json.loads(response.text)
            response_text = response_data.get("response", "")
            actions = response_data.get("actions", [])
            # If there are actions, we need to make sure they are valid

            
            self.logger.info("Response generated successfully")
            return response_text, actions
        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to parse model response as JSON: {str(e)}")
            self.logger.error("Raw response that failed to parse:")
            self.logger.error(response.text)
            return response.text, []  # Fallback to raw text if JSON parsing fails
        
    def _validate_actions(self, actions: List[Action]) -> List[Action]:
        """
        Validate the actions to make sure they are valid.
        """
        field_names = [field.value for field in Field]
        # Check if the actions are valid
        for action in actions:
            if action.type not in [ActionType.UPDATE_FIELD, ActionType.DO_NOTHING]:
                raise ValueError(f"Invalid action type: {action.type}")
            if action.field not in field_names:
                raise ValueError(f"Invalid field: {action.field}")
            if action.field == Field.INCOME_FREQUENCY:
                if action.value not in ["weekly", "monthly", "yearly"]:
                    raise ValueError(f"Invalid income frequency: {action.value}")
            if action.field == Field.OTHER_INCOME_FREQUENCY:
                if action.value not in ["weekly", "monthly", "yearly"]:
                    raise ValueError(f"Invalid other income frequency: {action.value}")
            if action.field == Field.SECOND_PERSON_INCOME_FREQUENCY:
                if action.value not in ["weekly", "monthly", "yearly"]:
                    raise ValueError(f"Invalid second person income frequency: {action.value}")
            if action.field == Field.SECOND_PERSON_OTHER_INCOME_FREQUENCY:
                if action.value not in ["weekly", "monthly", "yearly"]:
                    raise ValueError(f"Invalid second person other income frequency: {action.value}")
            # Make sure the value is a number
            if action.field == Field.IS_FIRST_TIME_BUYER:
                if action.value not in ["true", "false"]:
                    raise ValueError(f"Invalid is first time buyer: {action.value}")
                action.value = action.value == "true"
            if action.field in [Field.GROSS_INCOME, 
                                Field.OTHER_INCOME, 
                                Field.SECOND_PERSON_INCOME, 
                                Field.SECOND_PERSON_OTHER_INCOME, 
                                Field.RENTAL_INCOME, 
                                Field.RENT_BOARD, 
                                Field.LIVING_EXPENSES, 
                                Field.INTEREST_RATE, 
                                Field.CREDIT_CARD_LIMITS, 
                                Field.LOAN_REPAYMENT, 
                                Field.AGE, 
                                Field.DEPENDENTS,
                                Field.LOAN_TERM]:
                if float(action.value) < 0:
                    raise ValueError(f"{action.field} cannot be negative: {action.value}")
                if isinstance(action.value, str):
                    try:
                        action.value = float(action.value)
                    except ValueError:
                        raise ValueError(f"Invalid value for {action.field}: {action.value}")
            
        return actions

    def chat(self, question: str, context: str = None) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Process a user question and generate a response.
        
        Args:
            question (str): The user's question
            context (str): The context of the user including their details
            
        Returns:
            Tuple[str, List[Dict[str, Any]]]: The assistant's response text and list of actions
        """
        # Add user message to history
        self.message_history.append({
            "role": "user",
            "content": question,
            "timestamp": datetime.now().isoformat()
        })
        
        # Generate response
        response_text, actions = self._generate_response(question, context)
        
        # Add assistant response to history
        self.message_history.append({
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.now().isoformat()
        })
        
        return response_text, actions

        