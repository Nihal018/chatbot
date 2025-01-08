import { Message } from "ai";
import { Bot, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

export function ChatMessages({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
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
  );
}
