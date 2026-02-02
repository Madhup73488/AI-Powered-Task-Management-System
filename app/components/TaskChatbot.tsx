"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";

interface TaskChatbotProps {
  userId: string;
  darkMode?: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function TaskChatbot({ userId, darkMode = false }: TaskChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      const assistantId = (Date.now() + 1).toString();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantMessage += chunk;

          setMessages((prev) => {
            const existing = prev.find((m) => m.id === assistantId);
            if (existing) {
              return prev.map((m) =>
                m.id === assistantId ? { ...m, content: assistantMessage } : m,
              );
            }
            return [
              ...prev,
              {
                id: assistantId,
                role: "assistant" as const,
                content: assistantMessage,
              },
            ];
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          } transition-all duration-200 hover:scale-110`}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={`fixed bottom-6 right-6 z-50 w-96 h-[500px] flex flex-col shadow-2xl ${
            darkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <CardHeader
            className={`flex flex-row items-center justify-between p-4 border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <CardTitle
              className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Task Assistant
            </CardTitle>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-full ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <X
                className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              />
            </button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div
                className={`text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                <p className="mb-2">👋 Hi! I can help you with your tasks.</p>
                <p className="text-xs">Try asking:</p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>&quot;What tasks are due this week?&quot;</li>
                  <li>&quot;Show my high priority tasks&quot;</li>
                  <li>&quot;What&apos;s my task status?&quot;</li>
                </ul>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? darkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                      : darkMode
                        ? "bg-gray-800 text-gray-100"
                        : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </CardContent>

          <form
            onSubmit={handleSubmit}
            className={`p-4 border-t ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your tasks..."
                disabled={isLoading}
                className={`flex-1 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !inputValue.trim()}
                className={
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                }
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}
