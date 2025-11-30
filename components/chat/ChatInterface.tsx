'use client';

import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
//import Answer from '@/app/api/llm_providers/defenitions';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'assistant';
  timestamp?: Date;
}

interface Chat {
  id: number;
  title: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  chat_name: string;
  chats: Chat[];
  setChats: (chats: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  currentChat: number;
  setCurrentChat: (id: number) => void;
}

export const ChatInterface = ( chat : ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([{
      id: '1',
      text: 'Hello! I\'m your AI Assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
  }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [ chatName, setChatName ] = useState(chat.chat_name);



  const [ chatNameCreation, setChatNameCreation ] = useState(false);


  useEffect(() => {
    const getConversation = async () => {
        const get_conv = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/${chat.currentChat}`, {
          method: "GET",
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
        });
        if (!get_conv.ok) {
          const errorData = await get_conv.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || "Request failed");
        }
        const conv = await get_conv.json();

        const results = conv.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.role === 'assistant' ? 'bot' : msg.role, // Map 'assistant' to 'bot' for UI consistency
          timestamp: new Date(msg.timestamp)
        }));
        console.log("Results", results);
        setMessages(results);
        setChatName(conv.title);
    }

    const load = async () => {
        if (chat.currentChat != 0) await getConversation();
        else {
            setMessages([{
              id: '1',
              text: 'Hello! I\'m your AI Assistant. How can I help you today?',
              sender: 'bot',
              timestamp: new Date(),
              }]);
            setChatName('');
        }
        
    }

    load();
    

  }, [chat.currentChat]);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();


    let botMessage: Message = {
      id: Date.now().toString()+1,
      text: '',
      sender: 'bot',
      timestamp: undefined,
    }
    setMessages((prev) => [ ...prev, botMessage]);
      
    const res = await fetch("/api/llm_providers/gen_answer", {
      method: "POST",
      body: JSON.stringify({ query: inputText }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();


    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      botMessage = {...botMessage, text: botMessage.text+chunk};
      setMessages((prev) => [ ...prev.slice(0, -1), botMessage]);
    }

    
    botMessage = {...botMessage, timestamp: new Date()};
    setMessages((prev) => [ ...prev.slice(0, -1), botMessage ]);

    setIsTyping(false);

    let conv_id = null;
    if ( chatName == '' ) {
        // Generate chat name
        setChatNameCreation(true);
        const res_gen_chat_name = await fetch("/api/llm_providers/gen_chat_name", {
          method: "POST",
          body: JSON.stringify({ context: [ userMessage, botMessage ] }),
        });
        const reader_gen_chat_name = res_gen_chat_name.body!.getReader();
        const decoder_chat_name = new TextDecoder();
    
        let chat_name = '';

        while (true) {
          const { value, done } = await reader_gen_chat_name.read();
          if (done) break;

          const chunk = decoder_chat_name.decode(value);
          chat_name += chunk;
          setChatName((prev) => prev + chunk);
        }

        //const new_chat_id = Date.now().toString()+3;
        setChatNameCreation(false);


        //chat.setCurrentChat(new_chat_id);

        console.log("Messages length", messages);
        
        if (messages.length <= 1 ) {

            const save = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/`, {
              method: "POST",
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem("access_token")}`
                },
              body: JSON.stringify({ title: chat_name }),
            });

            if (!save.ok) {
              const errorData = await save.json().catch(() => ({}));
              throw new Error(errorData.detail || errorData.message || "Request failed");
            }
        
            const conversation_obj = await save.json();
            conv_id = conversation_obj.id;
            chat.setCurrentChat(conv_id);
            chat.setChats((prev) => [...prev, {id: conv_id, title: chat_name, timestamp: new Date()}]);
            

            }
        }else{
          conv_id = chat.currentChat;
        }

        console.log("Conv id", conv_id);


        const save_messages = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/${conv_id}/messages/`, {
          method: "POST",
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
          body: JSON.stringify({
            role: 'user',
            content: userMessage.text
          }),
        });

        if (!save_messages.ok) {
          const errorData = await save_messages.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || "Request failed");
        }


        const save_messages_2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/${conv_id}/messages/`, {
          method: "POST",
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
          body: JSON.stringify({
            role: 'assistant',
            content: botMessage.text
          }),
        });

        if (!save_messages_2.ok) {
          const errorData = await save_messages_2.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || "Request failed");
        }
        
        
    //}

  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-pink-500/20 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            { chatNameCreation ? (
                <div role="status">
                    <svg aria-hidden="true" className="inline w-8 h-8 text-neutral-tertiary animate-spin fill-pink-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            ) : (
                <>
                    <h1 className="text-xl font-bold text-white">
                        { chatName ? chatName : 'Start new chat' } 
                    </h1>
                    { chatName ? (<></>) : (
                        <p className="text-sm text-gray-400">
                          Your intelligent chatbot companion
                        </p>
                    )} 
                </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-pink-500/20'
              }`}
            >
                { message.text.length != '' ? <div className="text-sm leading-relaxed whitespace-pre-wrap"><Markdown>{message.text}</Markdown></div> : null}
              <div
                className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-pink-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp ? (message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })):(
                  <div className="flex gap-1 mt-0">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {/*isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-pink-500/20 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )*/}

            <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-pink-500/20 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          {/* Input Box */}
          <div className="relative flex items-stretch gap-2">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 bg-gray-800 border border-pink-500/20 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/40 focus:ring-2 focus:ring-pink-500/20 resize-none transition-all"
              style={{ minHeight: '52px', maxHeight: '150px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping || !inputText.trim()}
              className="flex-shrink-0 h-[52px] px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-500/50 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Footer Info */}
          <p className="text-xs text-gray-500 text-center mt-3">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};
