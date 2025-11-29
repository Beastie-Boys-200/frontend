'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatedBot } from './AnimatedBot';
import clsx from 'clsx';

interface Chat {
  id: number;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[];
  setChats: (chats: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  currentChat: number;
  setCurrentChat: (id: number) => void;
}

export const ChatSidebar = ({ isOpen, onToggle, chats, setChats, currentChat, setCurrentChat }: ChatSidebarProps) => {

    console.log("CurrentChat", currentChat);
    console.log("Chats", chats);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative z-50 h-full bg-gray-900 border-r border-pink-500/20
          transition-all duration-300 flex flex-col
          ${isOpen ? 'w-80' : 'w-0 lg:w-0'}
        `}
      >
        <div className={`${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'} transition-opacity duration-300 flex flex-col h-full`}>
          {/* Top Section - Robot & New Chat */}
          <div className="p-6 border-b border-pink-500/20">
            {/* Back Button */}
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors mb-6 group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back to Home</span>
            </Link>

            {/* 3D Robot */}
            <div className="flex justify-center mb-6">
              <div className="relative" suppressHydrationWarning>
                {/* Glow effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                <div className="relative">
                  <AnimatedBot size={120} />
                </div>
              </div>
            </div>

            {/* New Chat Button */}
            <button className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/50 flex items-center justify-center gap-2"
                onClick={() => setCurrentChat(0)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 px-2">
              Recent Chats
            </h3>
            {chats.map((chat) => (
              <button
                key={chat.id}
                className={clsx(
                    "w-full text-left px-3 py-2 rounded-lg  transition-all group",
                    currentChat == chat.id ? "bg-pink-500/10 text-pink-400" : "text-gray-300 hover:bg-pink-500/10 hover:text-pink-400"
                )}
                onClick={() => setCurrentChat(chat.id)}
              >
                <div className="flex items-center gap-2">
                  <svg className={clsx(
                    "w-4 h-4 ",
                    currentChat == chat.id ? "text-pink-400" : "text-gray-500 group-hover:text-pink-400"
                  )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm truncate">{chat.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Button (Mobile) */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 border border-pink-500/20 rounded-lg text-white hover:bg-pink-500/10 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </>
  );
};