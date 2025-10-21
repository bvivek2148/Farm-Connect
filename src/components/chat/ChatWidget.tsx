import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: number;
  content: string;
  senderType: 'user' | 'ai';
  createdAt: string;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  category: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession();
      loadQuickActions();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createSession = async () => {
    try {
      console.log('Creating chat session...');
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log('Session response:', data);
      if (data.success) {
        setSessionId(data.sessionId);
        // Add welcome message
        setMessages([{
          id: 0,
          content: "Hello! I'm FarmBot, your AI assistant for Farm-Connect. I can help you with farming questions, order tracking, product information, and technical support. How can I assist you today? 🌱",
          senderType: 'ai',
          createdAt: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      // Fallback session ID
      setSessionId('fallback-' + Date.now());
      setMessages([{
        id: 0,
        content: "Hello! I'm FarmBot, your AI assistant. I'm ready to help you! 🌱",
        senderType: 'ai',
        createdAt: new Date().toISOString()
      }]);
    }
  };

  const loadQuickActions = async () => {
    try {
      const response = await fetch('/api/chat/quick-actions');
      const data = await response.json();
      if (data.success) {
        setQuickActions(data.quickActions);
      }
    } catch (error) {
      console.error('Failed to load quick actions:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !sessionId) return;

    const userMessage: Message = {
      id: Date.now(),
      content: message,
      senderType: 'user',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      console.log('Sending message:', { sessionId, message });
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message,
          userId: null // Will be set from auth context later
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success && data.aiMessage) {
        const aiMessage: Message = {
          id: data.aiMessage.id,
          content: data.aiMessage.content,
          senderType: 'ai',
          createdAt: data.aiMessage.createdAt
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to contact our support team directly. 🔧",
        senderType: 'ai',
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (!sessionId) return;

    setIsLoading(true);
    setIsTyping(true);

    try {
      console.log('Sending quick action:', { actionId: action.id, sessionId });
      const response = await fetch('/api/chat/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: action.id,
          sessionId,
          userId: null // Will be set from auth context later
        }),
      });

      console.log('Quick action response status:', response.status);
      const data = await response.json();
      console.log('Quick action response data:', data);

      if (data.success && data.aiMessage) {
        const aiMessage: Message = {
          id: data.aiMessage.id,
          content: data.aiMessage.content,
          senderType: 'ai',
          createdAt: data.aiMessage.createdAt
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to process quick action');
      }
    } catch (error) {
      console.error('Failed to process quick action:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment. 🔧",
        senderType: 'ai',
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-110 border-2 border-white"
            size="icon"
          >
            <MessageCircle className="h-7 w-7 text-white" />
          </Button>
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          {/* Floating tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Need help? Chat with FarmBot! 🌱
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 ${isMinimized ? 'h-16' : 'h-[500px]'} flex flex-col shadow-2xl border-0 bg-white rounded-2xl overflow-hidden transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarFallback className="bg-green-700 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold text-sm">FarmBot Assistant</span>
              <div className="text-xs opacity-90">🌱 Always here to help</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
          <>
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.senderType === 'ai' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-green-100 text-green-600">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                        message.senderType === 'user'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${message.senderType === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {message.senderType === 'user' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Quick Actions */}
                {messages.length === 1 && quickActions.length > 0 && (
                  <div className="space-y-3 p-3 bg-white rounded-xl border border-gray-200">
                    <p className="text-xs font-medium text-gray-600">💡 Quick suggestions:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {quickActions.slice(0, 6).map((action) => (
                        <div
                          key={action.id}
                          className="cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                          onClick={() => handleQuickAction(action)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800 group-hover:text-green-700">
                                {action.label}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {action.description}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs bg-gray-50 group-hover:bg-green-100 group-hover:text-green-700 group-hover:border-green-300"
                            >
                              {action.category}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-green-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white p-3 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(inputMessage)}
                    disabled={isLoading}
                    className="border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
                <Button
                  onClick={() => sendMessage(inputMessage)}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                  className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Powered by AI • Press Enter to send
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
