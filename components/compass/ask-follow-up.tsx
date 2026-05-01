'use client';

import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ChatMessage } from '@/lib/types';

interface AskFollowUpProps {
  chatHistory: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
}

export function AskFollowUp({ chatHistory, isTyping, onSendMessage }: AskFollowUpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="mt-4">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(175,169,236,0.3)] text-[#CECBF6] text-sm hover:bg-[rgba(175,169,236,0.1)] transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Ask a follow up
        </button>
      ) : (
        <div className="space-y-4">
          {chatHistory.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[#1F1B3D] text-[#E8E6F0] ml-8'
                      : 'bg-[rgba(255,255,255,0.03)] text-[#B4B2A9] mr-8'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              ))}
              {isTyping && (
                <div className="bg-[rgba(255,255,255,0.03)] text-[#5F5E5A] p-3 rounded-lg mr-8">
                  <p className="text-sm">Thinking...</p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about the results..."
              className="flex-1 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[#E8E6F0] placeholder:text-[#5F5E5A] focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD]"
              disabled={isTyping}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-[#7F77DD] hover:bg-[#6B63C7] text-[#0F0F12] disabled:bg-[#2A2A30] disabled:text-[#5F5E5A]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
