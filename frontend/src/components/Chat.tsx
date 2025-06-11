import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { ChatMessage } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import './Chat.css';

interface ChatProps {
    context?: string;
    isExpanded: boolean;
    onToggle: () => void;
    onAction?: (action: any) => void;
}

interface Suggestion {
    label: string;
    value: string;
    field: string;
}

const INITIAL_MESSAGE: ChatMessage = {
    role: 'assistant',
    content: `👋 Hi! I'm your Mortgage Mate. I can help you calculate your borrowing power and guide you through the mortgage process.

What would you like to know about your borrowing capacity?`,
    timestamp: new Date().toISOString()
};

const INITIAL_SUGGESTIONS: Suggestion[] = [
    {
        label: "Calculate my borrowing power",
        value: "calculate",
        field: "action"
    },
    {
        label: "Explain the mortgage process",
        value: "explain",
        field: "action"
    },
    {
        label: "What documents do I need?",
        value: "documents",
        field: "action"
    }
];

const Chat: React.FC<ChatProps> = ({ context = '', isExpanded, onToggle, onAction }) => {
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
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
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
                    if (action.type === 'suggest_answers') {
                        setCurrentSuggestions(action.payload.suggestions);
                    } else {
                        onAction(action);
                    }
                });
            }

        } catch (error) {
            console.error('Error:', error);
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
        // Create and add user message
        const userMessage: ChatMessage = {
            role: 'user',
            content: suggestion.label,
            timestamp: new Date().toISOString()
        };
        setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
        
        await sendMessage(suggestion.label);
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
        <div className={`chat-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {!isExpanded && (
                <button 
                    className="chat-bubble"
                    onClick={onToggle}
                    aria-label="Open chat"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            )}
            
            <div className={`chat-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
                <div className="chat-header" onClick={onToggle}>
                    <h3>Mortgage Mate</h3>
                    <button 
                        className="minimize-button"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent header click from triggering
                            onToggle();
                        }}
                        aria-label="Minimize chat"
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
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
                            {message.role === 'assistant' && index === messages.length - 1 && currentSuggestions.length > 0 && (
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
                        </React.Fragment>
                    ))}
                    {isStreaming && (
                        <div className="message assistant-message">
                            <div className="message-content">
                                <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                    {isLoading && !isStreaming && (
                        <div className="message assistant-message">
                            <div className="message-content">
                                <div className="loading-dots">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSubmit} className="chat-input-form">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        disabled={isLoading || isStreaming}
                        className="chat-input"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || isStreaming || !inputValue.trim()}
                        className="send-button"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat; 