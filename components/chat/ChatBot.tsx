'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { AnimatedBot } from './AnimatedBot';
import Markdown from 'react-markdown';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp?: Date;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! I\'m TeleBot, your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [hasShownRedirect, setHasShownRedirect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    'How does it work?',
    'View pricing',
    'Contact support',
    'Tell me more',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    //setIsTyping(true);
    scrollToBottom();


    let botMessage: Message = {
      id: messages.length+1,
      text: '',
      sender: 'bot',
      timestamp: undefined,
    }
    setMessages((prev) => [ ...prev, botMessage]);
      
    const res = await fetch("/api/llm_providers/simple_get", {
      method: "POST",
      body: JSON.stringify({ prompt: inputText }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();


    //let full_text = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      botMessage = {...botMessage, text: botMessage.text+chunk};
      setMessages((prev) => [ ...prev.slice(0, -1), botMessage]);
    }

    
    botMessage = {...botMessage, timestamp: new Date()};
    setMessages((prev) => [ ...prev.slice(0, -1), botMessage ]);

    //setIsTyping(false);



    // Add user message
    //const userMessage: Message = {
    //  id: messages.length + 1,
    //  text: text,
    //  sender: 'user',
    //  timestamp: new Date(),
    //};

    //setMessages((prev) => [...prev, userMessage]);
    //setInputText('');
    //setMessageCount((prev) => prev + 1);

    //// Simulate bot response
    //setTimeout(() => {
    //  const botMessage: Message = {
    //    id: messages.length + 2,
    //    text: 'Thanks for your message! Our team will get back to you soon. In the meantime, feel free to explore our features.',
    //    sender: 'bot',
    //    timestamp: new Date(),
    //  };
    //  setMessages((prev) => [...prev, botMessage]);
    //  setMessageCount((prev) => prev + 1);

    //  // After 3 messages (total 6 including bot responses), show redirect message
    //  if (messageCount >= 2 && !hasShownRedirect) {
    //    setTimeout(() => {
    //      const redirectMessage: Message = {
    //        id: messages.length + 3,
    //        text: 'Would you like to continue this conversation in our full AI chat? You\'ll get more features and better responses! Click the plane icon above to switch.',
    //        sender: 'bot',
    //        timestamp: new Date(),
    //      };
    //      setMessages((prev) => [...prev, redirectMessage]);
    //      setHasShownRedirect(true);
    //    }, 1500);
    //  }
    //}, 1000);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 group"
        suppressHydrationWarning
      >
        <div className="relative">
          {/* Animated glow rings */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-xl opacity-60 group-hover:opacity-80 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-md opacity-40"></div>

          {/* Button */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-600 to-pink-600 rounded-full p-[2px] shadow-lg shadow-pink-500/50 transform group-hover:scale-110 transition-all">
            <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
              {isOpen ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <div suppressHydrationWarning>
                  <AnimatedBot size={40} />
                </div>
              )}
            </div>
          </div>

          {/* Notification badge */}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-80 h-[500px] z-40 flex flex-col"
          suppressHydrationWarning
        >
          {/* Glow effect behind chat - only top and sides */}
          <div className="absolute -inset-x-4 -top-4 bottom-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-2xl blur-xl pointer-events-none"></div>

          {/* Chat container */}
          <div className="relative bg-gray-950/95 backdrop-blur-xl rounded-2xl border border-pink-500/30 shadow-2xl shadow-pink-500/20 overflow-hidden flex flex-col h-full">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-pink-500/50 rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-purple-500/50 rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-purple-500/50 rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-pink-500/50 rounded-br-2xl"></div>

            {/* Header */}
            <div className="relative bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 border-b border-pink-500/30 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative" suppressHydrationWarning>
                    <div className="absolute inset-0 bg-pink-500 rounded-full blur-sm opacity-50"></div>
                    <div className="relative w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full p-[2px]">
                      <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                        <AnimatedBot size={20} />
                      </div>
                    </div>
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-900"></div>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">TeleBot</h3>
                    <p className="text-[10px] text-gray-400">AI Assistant • Online</p>
                  </div>
                </div>
                <Link
                  href="/ai-assistant"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                  title="Open full chat"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55l1.33.26zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83L11.17 17zm6.48-2.19c-2.29 2.04-5.58 3.44-5.89 3.57L13.31 22l4.05-4.05c.47-.47.68-1.15.55-1.81l-.26-1.33zM9 18c0 .83-.34 1.58-.88 2.12C6.94 21.3 2 22 2 22s.7-4.94 1.88-6.12C4.42 15.34 5.17 15 6 15c1.66 0 3 1.34 3 3zm4-9c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-2.5 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-800/50 border border-pink-500/20 text-gray-200'
                    }`}
                  >
                    <div className="text-xs leading-relaxed"><Markdown>{message.text}</Markdown></div>
                    <div className="text-[10px] opacity-60 mt-1">
                        {message.timestamp ? (message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })):(
                          <div className="flex gap-1 mt-0">
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        )}   {/*message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })*/}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-3 pb-3">
                <p className="text-xs text-gray-400 mb-2">Quick replies:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs px-3 py-2 bg-gray-800/50 border border-pink-500/30 rounded-full text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/50 transition-all whitespace-nowrap"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="relative border-t border-pink-500/30 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800/50 border border-pink-500/30 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
                />
                <button
                  onClick={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim()}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 rounded-lg px-4 py-2 text-white font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
