'use client';

import { useState, useEffect } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useRouter } from "next/navigation";
import Link from 'next/link';

interface Chat {
  id: number;
  title: string;
  timestamp: Date;
}

export default function GuidePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const [chats, setChats ] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat ] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);


  useEffect(() => {
    const checkAuth = async () => {
      // Show loading spinner for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      const token = localStorage.getItem("access_token");
      console.log("Token", token);

      if (!token) {
        setIsLoading(false);
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);

      const getChats = async () => {
        try {
          // Get user info first to filter by user
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user/`, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
          });

          if (!userResponse.ok) {
            console.error("Failed to get user info");
            return;
          }

          const userData = await userResponse.json();
          const userId = userData.id;

          const get_chats = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/`, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
          });

          if (!get_chats.ok) {
            const errorData = await get_chats.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || "Request failed");
          }

          const chats_data = await get_chats.json();
          // Filter chats by current user
          const userChats = chats_data.filter((chat: any) => chat.user === userId);
          const results = userChats.map((chat: any) => ({
            id: chat.id,
            title: chat.title,
            timestamp: new Date(chat.created_at)
          }));

          console.log("Results", results);
          setChats(results);
        } catch (error) {
          console.error("Failed to load chats:", error);
        }
      }

      await getChats();
      setIsLoading(false);
    }

    checkAuth();
  }, []);


  // Loading spinner
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-950 items-center justify-center">
        <div className="text-center">
          {/* Spinning loader */}
          <div className="relative inline-block mb-6">
            <svg aria-hidden="true" className="inline w-20 h-20 text-gray-800 animate-spin fill-pink-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
          </div>
          <p className="text-xl text-gray-400 font-medium">Loading Chat...</p>
        </div>
      </div>
    );
  }

  // Unauthorized message
  if (!isAuthorized) {
    return (
      <div className="flex h-screen bg-gray-950 items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-8 text-center">
            {/* Icon */}
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-xl"></div>
                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-full p-[2px]">
                  <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <h2 className="text-2xl font-bold text-white mb-3">
              Account Required
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              You need to be logged in to use the AI Chat. Please sign in or create an account to continue.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/50 text-center"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex-1 px-6 py-3 border-2 border-pink-500 text-pink-400 rounded-lg font-semibold hover:bg-pink-500/10 transition-all text-center"
              >
                Create Account
              </Link>
            </div>

            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors mt-6 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        <ChatInterface
          chat_name={''}
          chats={chats}
          setChats={setChats}
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
        />
      </div>
    </div>
  );
}
