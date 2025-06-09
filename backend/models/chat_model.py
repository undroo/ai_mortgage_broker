"""
This module contains the ChatModel class, which is used to interact with the chat model.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, Optional, List
import google.generativeai as genai
import logging
from pathlib import Path

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
            "Feel free to use tables or lists to make your response more readable.",
            "Use the information provided by the user actively rather than being generic",
            "Prompt to user to answer more questions if they are not providing enough information."
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
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
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

    def _generate_response(self, question: str, context: str = None) -> str:
        """
        Generate a response using the model, taking into account conversation history.
        
        Args:
            question (str): The user's question
            
        Returns:
            str: The model's response
        """
        # Format the conversation history
        conversation_history = self._format_conversation_history()
        
        # Create the prompt with conversation history
        prompt = f"""Previous conversation:
            {conversation_history}

            Current question: {question}

            Please provide a helpful response that takes into account the conversation history
            and the context of the user including their details. If there is a borrowing model, 
            please use refer to it if relevant. 
            context: {context}
            """
        
        self.logger.info("Generating response with conversation history...")
        self.logger.debug(f"Using prompt: {prompt}")
        
        # Generate response
        response = self.model.generate_content(prompt)
        
        # Clean the response text
        cleaned_text = response.text.strip()
        
        self.logger.info("Response generated successfully")
        return cleaned_text

    def chat(self, question: str, context: str = None) -> str:
        """
        Process a user question and generate a response.
        
        Args:
            question (str): The user's question
            context (str): The context of the user including their details
            
        Returns:
            str: The assistant's response

        """
        # Add user message to history
        self.message_history.append({
            "role": "user",
            "content": question,
            "timestamp": datetime.now().isoformat()
        })
        
        # Generate response
        response = self._generate_response(question, context)
        
        # Add assistant response to history
        self.message_history.append({
            "role": "assistant",
            "content": response,
            "timestamp": datetime.now().isoformat()
        })
        
        return response

        