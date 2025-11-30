'use client';

import { useState, useEffect } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useRouter } from "next/navigation";

interface Chat {
  id: number;
  title: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const [chats, setChats ] = useState<Chat[]>([ ]);
  const [ currentChat, setCurrentChat ] = useState(0);


  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("Token", token);
    if (!token) router.push("/login");

    const getChats = async () => {
        const get_chats = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/`, {
          method: "GET",
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            },
        });
        if (!get_chats.ok) {
          const errorData = await get_chats.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || "Request failed");
        }
        const chats = await get_chats.json();

        const results = chats.map((chat) => ({ id: chat.id, title: chat.title, timestamp: Date(chat.created_at) }));
        console.log("Results", results);
        setChats(results);
    }

    getChats();

  }, []);





  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={chats}
        setChats={setChats}
        currentChat={currentChat}
        setCurrentChat={setCurrentChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatInterface chat_name={''} chats={chats} setChats={setChats} currentChat={currentChat} setCurrentChat={setCurrentChat}/>
      </div>
    </div>
  );
}
