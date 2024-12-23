"use client";

import { useChat } from "ai/react";
import { useRef, useEffect, useState, FormEvent } from "react";
import { SendIcon, User, Bot } from "lucide-react";
import { VscStopCircle } from "react-icons/vsc";
import Image from "next/image";
import { MdAttachFile } from "react-icons/md";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      maxSteps: 5,
    });

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    handleSubmit(event, {
      experimental_attachments: files,
      allowEmptySubmit: true,
    });

    setFiles(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-black">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-semibold text-gray-700">
                Welcome to AI Chat
              </h1>
              <p className="text-gray-500">
                Start a conversation by typing a message below
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${
                m.role === "user" ? "justify-end" : ""
              }`}
            >
              {m.role !== "user" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
              <div
                className={`flex flex-col space-y-2 max-w-3xl ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 ${
                    m.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white shadow-sm border border-gray-200"
                  }`}
                >
                  {m.toolInvocations ? (
                    <pre className="whitespace-pre-wrap text-sm text-black">
                      {JSON.stringify(m.toolInvocations, null, 2)}
                    </pre>
                  ) : (
                    <div>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <div>
                        {m.experimental_attachments
                          ?.filter((attachment) =>
                            (attachment.contentType ?? "").startsWith("image/")
                          )
                          .map((attachment, index) => (
                            <Image
                              key={`${m.id}-${index}`}
                              src={attachment.url}
                              alt={attachment.name || ""}
                              width={300}
                              height={300}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {m.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-center">
            <input
              className="w-full p-3 pr-20 border border-gray-200 rounded-lg 
              text-black
                   focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={input}
              placeholder="Type your message..."
              onChange={handleInputChange}
            />

            <div className="absolute right-12 ">
              <div className="relative ">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 "
                  onChange={(event) => {
                    if (event.target.files) {
                      setFiles(event.target.files);
                    }
                  }}
                  multiple
                  ref={fileInputRef}
                  aria-label="Attach files"
                />
                <div className="p-2 text-gray-400 hover:text-gray-600 transition-colors ">
                  <MdAttachFile className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="absolute right-2">
              {isLoading ? (
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => stop()}
                >
                  <VscStopCircle className="w-6 h-6" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
