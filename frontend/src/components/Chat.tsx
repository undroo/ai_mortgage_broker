import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { ChatMessage } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import './Chat.css';

interface ChatProps {
    context?: string;
    onAction?: (action: any) => void;
}

interface Suggestion {
    field: string;
    label: string;
}

const INITIAL_MESSAGE: ChatMessage = {
    role: 'assistant',
    content: `👋 Hi! I'm your Mortgage Mate. I can help you calculate your borrowing power and guide you through the mortgage process.

What would you like to know about your borrowing capacity?`,
    timestamp: new Date().toISOString()
};

const INITIAL_SUGGESTIONS: Suggestion[] = [
    {
        field: "n/a",
        label: "Calculate my borrowing power",
    },
    {
        field: "n/a",
        label: "Guide me through the borrowing calculator",
    }
];

const Chat: React.FC<ChatProps> = ({ context = '', onAction }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentSuggestions, setCurrentSuggestions] = useState<Suggestion[]>(INITIAL_SUGGESTIONS);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingMessage]);

    const streamText = (text: string): Promise<void> => {
        return new Promise((resolve) => {
            setIsStreaming(true);
            let currentIndex = 0;
            const words = text.split(' ');

            const streamNextWord = () => {
                if (currentIndex < words.length) {
                    setStreamingMessage(prev => prev + (currentIndex === 0 ? '' : ' ') + words[currentIndex]);
                    currentIndex++;
                    streamingTimeoutRef.current = setTimeout(streamNextWord, 60);
                } else {
                    setIsStreaming(false);
                    setStreamingMessage('');
                    resolve();
                }
            };

            streamNextWord();
        });
    };

    const sendMessage = async (message: string) => {
        setIsLoading(true);
        setCurrentSuggestions([]);

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, context }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Received response:', data); // Log the response data
            
            // Create the assistant message
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toISOString()
            };

            // Stream the response and wait for it to complete
            await streamText(data.response);
            
            // Add the message to history after streaming is complete
            setMessages((prev: ChatMessage[]) => [...prev, assistantMessage]);

            // Handle any actions
            if (data.actions && data.actions.length > 0 && onAction) {
                data.actions.forEach((action: any) => {
                    if (action.type === 'suggested_answers') {
                        console.log('Received action:', action); // Debug log
                        if (!action.payload?.values) {
                            console.error('Missing value in suggested_answers payload:', action);
                            return;
                        }
                        // Convert the backend suggestions to our frontend format
                        const suggestions: Suggestion[] = action.payload.values.map((value: string) => ({
                            label: value,
                            field: action.payload.field
                        }));
                        setCurrentSuggestions(suggestions);
                    } else {
                        onAction(action);
                    }
                });
            }

        } catch (error) {
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                error
            });
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Sorry, there was an error processing your request.',
                timestamp: new Date().toISOString()
            };
            setMessages((prev: ChatMessage[]) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: inputValue,
            timestamp: new Date().toISOString()
        };

        setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
        setInputValue('');
        
        await sendMessage(inputValue);
    };

    const handleSuggestionClick = async (suggestion: Suggestion) => {
        // Create and add user message with just the label
        const userMessage: ChatMessage = {
            role: 'user',
            content: suggestion.label,
            timestamp: new Date().toISOString()
        };
        setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
        
        // Send the full format to the backend
        await sendMessage(`${suggestion.field}: ${suggestion.label}`);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    // Cleanup streaming timeout on unmount
    useEffect(() => {
        return () => {
            if (streamingTimeoutRef.current) {
                clearTimeout(streamingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="chat-sidebar">
            <div className="chat-header">
                <h3>Mortgage Mate</h3>
            </div>
            
            <div className="chat-messages">
                {messages.map((message: ChatMessage, index: number) => (
                    <React.Fragment key={index}>
                        <div
                            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                        >
                            <div className="message-content">
                                {message.role === 'assistant' || message.role === 'system' ? (
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                ) : (
                                    message.content
                                )}
                            </div>
                            <div className="message-timestamp">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    </React.Fragment>
                ))}
                {isStreaming && (
                    <div className="message assistant-message">
                        <div className="message-content">
                            <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {currentSuggestions.length > 0 && (
                <div className="suggestions-container">
                    {currentSuggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            className="suggestion-button"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion.label}
                        </button>
                    ))}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="chat-input-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="chat-input"
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !inputValue.trim()}
                    className="send-button"
                >
                    {isLoading ? (
                        <div className="loading-dots">
                            <span>•</span>
                            <span>•</span>
                            <span>•</span>
                        </div>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Chat; 