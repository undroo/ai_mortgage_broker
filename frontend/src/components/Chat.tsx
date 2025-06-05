import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { ChatMessage } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import './Chat.css';

interface ChatProps {
    context?: string;
    isExpanded: boolean;
    onToggle: () => void;
}

const Chat: React.FC<ChatProps> = ({ context = '', isExpanded, onToggle }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: inputValue, context }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toISOString()
            };

            setMessages((prev: ChatMessage[]) => [...prev, assistantMessage]);
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

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

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
                <div className="chat-header">
                    <h3>Mortgage Mate</h3>
                    <button 
                        className="minimize-button"
                        onClick={onToggle}
                        aria-label="Minimize chat"
                    >
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                </div>
                
                <div className="chat-messages">
                    {messages.map((message: ChatMessage, index: number) => (
                        <div
                            key={index}
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
                    ))}
                    {isLoading && (
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
                        disabled={isLoading}
                        className="chat-input"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
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