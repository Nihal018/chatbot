"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, X, Trash2 } from "lucide-react";

interface Chat {
  id: string;
  name: string;
  createdAt: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchChats() {
      try {
        const response = await fetch("/api/chat/list");
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }

    if (isOpen) {
      fetchChats();
    }
  }, [isOpen]);

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
    onClose();
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setChats(chats.filter((chat) => chat.id !== chatId));
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <h2 className="text-lg font-semibold text-gray-800">
              Chat History
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No chat history yet
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b flex items-center justify-between group"
                >
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <MessageSquare className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {chat.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(chat.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-full transition-all"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={() => router.push("/")}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              New Chat
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
