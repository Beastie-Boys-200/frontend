'use client';

import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';

interface FileAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'assistant';
  timestamp?: Date;
  files?: FileAttachment[];
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ chatName, setChatName ] = useState(chat.chat_name);
  const [ uploadedFiles, setUploadedFiles ] = useState<File[]>([]);



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

        const results = conv.messages.map((msg: any) => ({ id: msg.id, text: msg.content, sender: msg.role, timestamp: new Date(msg.timestamp) }));
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

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Filter only PDF and images
    const validFiles = files.filter(file => {
      const isPDF = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      return isPDF || isImage;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove file from upload list
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };


  const handleSendMessage = async () => {
    if (!inputText.trim() && uploadedFiles.length === 0) return;

    // Convert files to base64
    const filesData = await Promise.all(
      uploadedFiles.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        data: await fileToBase64(file)
      }))
    );

    // Add user message with files
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      files: filesData.length > 0 ? filesData : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setUploadedFiles([]); // Clear uploaded files
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
      body: JSON.stringify({
        query: inputText,
        files: filesData  // Send files data
      }),
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

        let chat_name_str = '';

        while (true) {
          const { value, done } = await reader_gen_chat_name.read();
          if (done) break;

          const chunk = decoder_chat_name.decode(value);
          chat_name_str += chunk;
          setChatName((prev) => prev + chunk);
        }

        setChatNameCreation(false);

        console.log("Messages length", messages);

        if (messages.length <= 1 ) {

            const save = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/`, {
              method: "POST",
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem("access_token")}`
                },
              body: JSON.stringify({ title: chat_name_str }),
            });

            if (!save.ok) {
              const errorData = await save.json().catch(() => ({}));
              throw new Error(errorData.detail || errorData.message || "Request failed");
            }

            const conversation_obj = await save.json();
            conv_id = conversation_obj.id;
            chat.setCurrentChat(conv_id);
            chat.setChats((prev) => [...prev, {id: conv_id, title: chat_name_str, timestamp: new Date()}]);


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
              {/* File attachments - shown first */}
              {message.files && message.files.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {message.files.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                        message.sender === 'user'
                          ? 'bg-white/20 backdrop-blur-sm'
                          : 'bg-gray-700/50'
                      }`}
                    >
                      {/* File preview/icon */}
                      {file.type.startsWith('image/') ? (
                        <img
                          src={file.data}
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className={message.sender === 'user' ? 'text-white' : 'text-pink-400'}>
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 18h12a2 2 0 002-2V8a2 2 0 00-2-2h-4L8 2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* File info */}
                      <div className="flex flex-col">
                        <span className={`text-xs truncate max-w-[120px] ${
                          message.sender === 'user' ? 'text-white' : 'text-gray-300'
                        }`}>
                          {file.name}
                        </span>
                        <span className={`text-xs ${
                          message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Message text */}
              { message.text.length != 0 ? <div className="text-sm leading-relaxed whitespace-pre-wrap"><Markdown>{message.text}</Markdown></div> : null}

              {/* Timestamp */}
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

            <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-pink-500/20 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-800 border border-pink-500/20 rounded-lg px-3 py-2 text-sm"
                >
                  {/* File icon */}
                  <div className="text-pink-400">
                    {file.type === 'application/pdf' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 18h12a2 2 0 002-2V8a2 2 0 00-2-2h-4L8 2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* File name */}
                  <span className="text-gray-300 truncate max-w-[150px]">{file.name}</span>

                  {/* File size */}
                  <span className="text-gray-500 text-xs">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-pink-400 transition-colors ml-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="relative flex items-stretch gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Paperclip button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 h-[52px] px-3 bg-gray-800 border border-pink-500/20 rounded-xl text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/40 transition-all flex items-center justify-center"
              title="Attach PDF or Image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

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
              disabled={isTyping || (!inputText.trim() && uploadedFiles.length === 0)}
              className="flex-shrink-0 h-[52px] px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-500/50 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Footer Info */}
          <p className="text-xs text-gray-500 text-center mt-3">
            Press Enter to send, Shift + Enter for new line • Attach PDF or images
          </p>
        </div>
      </div>
    </div>
  );
};