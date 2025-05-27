import pytest
from datetime import datetime
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the project root directory to the Python path
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)
from backend.models.chat_model import ChatModel

# Load environment variables
load_dotenv(project_root + '/config/.env')
api_key = os.getenv("GEMINI_API_KEY")
print(api_key)

def test_chat_functionality():
    """Test the basic chat functionality."""
    logger.info("Starting chat functionality test...")
    
    logger.info("Initializing ChatModel...")
    chat_model = ChatModel(api_key=api_key)
    logger.info("ChatModel initialized successfully")
    
    # Print initial system messages
    logger.info("\nInitial System Messages:")
    for msg in chat_model.message_history:
        logger.info(f"Role: {msg['role']}")
        logger.info(f"Content: {msg['content']}")
        logger.info(f"Timestamp: {msg['timestamp']}\n")
    
    # Send a test question
    question = "What is a fixed-rate mortgage?"
    logger.info(f"\nSending question: {question}")
    response = chat_model.chat(question)
    logger.info(f"Received response: {response}\n")

    # Send a second test question
    question = "can you explain that again but in simpler terms"
    logger.info(f"\nSending question: {question}")
    response = chat_model.chat(question)
    logger.info(f"Received response: {response}\n")
    
    # Verify that the response is a string
    assert isinstance(response, str)
    logger.info("Response type verification passed")
    
    # Verify that the message history has been updated correctly
    assert len(chat_model.message_history) == 7  # 3 system messages + 1 user message + 1 assistant response
    logger.info(f"Message history length verification passed: {len(chat_model.message_history)} messages")
    
    # Verify the last two messages (user question and assistant response)
    user_message = chat_model.message_history[-2]
    assistant_message = chat_model.message_history[-1]
    
    logger.info("\nVerifying message history:")
    logger.info(f"User message - Role: {user_message['role']}")
    logger.info(f"User message - Content: {user_message['content']}")
    logger.info(f"User message - Timestamp: {user_message['timestamp']}")
    logger.info(f"Assistant message - Role: {assistant_message['role']}")
    logger.info(f"Assistant message - Content: {assistant_message['content']}")
    logger.info(f"Assistant message - Timestamp: {assistant_message['timestamp']}\n")
    
    assert user_message["role"] == "user"
    assert user_message["content"] == question
    assert assistant_message["role"] == "assistant"
    assert isinstance(assistant_message["content"], str)
    logger.info("Message role and content verification passed")
    
    # Verify timestamps are present and valid
    for message in [user_message, assistant_message]:
        timestamp = datetime.fromisoformat(message["timestamp"])
        assert isinstance(timestamp, datetime)
    logger.info("Timestamp verification passed")
    
    logger.info("All test assertions passed successfully!")
    return response

if __name__ == "__main__":
    logger.info("Running chat functionality test...")
    response = test_chat_functionality()
    logger.info("\nTest completed successfully!")
    logger.info(f"Final response from the model: {response}")