export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface ChatResponse {
    response: string;
} 