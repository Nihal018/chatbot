import { Message } from "ai";
import { Bot } from "lucide-react";
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
    <div className="flex-1 overflow-y-auto">
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
        <div className="flex flex-col">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`group w-full text-black ${
                m.role === "assistant" ? "bg-white" : ""
              }`}
            >
              <div className="max-w-4xl mx-auto px-3 py-3">
                {m.role === "assistant" ? (
                  <div className="flex space-x-4 px-2">
                    <div className="flex-shrink-0 w-8">
                      {!m.toolInvocations && (
                        <div className="w-8 h-8 bg-teal-500 rounded-sm flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="whitespace-pre-wrap leading-6">
                        {m.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end px-2">
                    <div className="max-w-[90%]">
                      <div className="inline-block rounded-2xl bg-gray-100 px-4 py-2">
                        <p className="whitespace-pre-wrap leading-6">
                          {m.content}
                        </p>
                      </div>
                      {m.experimental_attachments &&
                        m.experimental_attachments?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-4 justify-end">
                            {m.experimental_attachments
                              .filter((attachment) =>
                                (attachment.contentType ?? "").startsWith(
                                  "image/"
                                )
                              )
                              .map((attachment, index) => (
                                <Image
                                  key={`${m.id}-${index}`}
                                  src={attachment.url}
                                  alt={attachment.name || ""}
                                  width={300}
                                  height={300}
                                  className="rounded-lg"
                                />
                              ))}
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
