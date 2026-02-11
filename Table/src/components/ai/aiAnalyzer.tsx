import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { api } from '@/api/client';
import { SendIcon, Loader2Icon, Trash2Icon, SparklesIcon } from 'lucide-react';

//message type
type Message = {
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{
    id: number;
    source_table: string;
    source_pk: string;
    field: string;
    content: string;
    score?: number;
  }>;
  timestamp?: Date;
};

const exampleQuestions = [
  'What are the most common issues in HVAC systems?',
  'Which systems have the most open defects?',
  'Summarize all critical defects requiring immediate attention',
  'What patterns do you see in closed defects?',
];

export default function AiAnalyzer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const question = input.trim();
    const userMessage: Message = {
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.askAI(question);

      if (!response || !response.answer) {
        throw new Error('Invalid response from server');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        citations: response.citations || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI query error:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: error?.response?.data?.message
          ? `Error: ${error.response.data.message}`
          : error?.message
            ? `Error: ${error.message}`
            : 'Sorry, I encountered an error while processing your question. Please check your connection and try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput('');
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full mx-auto p-4 h-full flex flex-col max-w-5xl">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              AI TOD Analyzer
            </CardTitle>
            <CardDescription className="mt-1">
              Ask questions about your TOD data and get AI-powered insights
            </CardDescription>
          </div>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex items-center gap-2"
            >
              <Trash2Icon className="w-4 h-4" />
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-slate-50/50 min-h-[400px] max-h-[600px]">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                <p className="text-base font-medium mb-2">
                  Start a conversation by asking a question about your TOD data
                </p>
                <p className="text-sm mb-4">Try these example questions:</p>
                <div className="flex flex-col gap-2 max-w-md mx-auto">
                  {exampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExampleClick(q)}
                      className="text-left text-sm p-3 rounded-lg border hover:bg-accent hover:border-primary/50 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white border shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            📚 Sources ({message.citations.length}):
                          </p>
                          <div className="space-y-2">
                            {message.citations.map((cite, idx) => (
                              <div
                                key={cite.id || idx}
                                className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded border-l-2 border-primary"
                              >
                                <p className="font-medium text-foreground">
                                  {cite.source_table}:{cite.source_pk}
                                </p>
                                {cite.score && (
                                  <p className="text-muted-foreground text-[10px] mt-1">
                                    Relevance: {(cite.score * 100).toFixed(1)}%
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {message.timestamp && (
                        <p className="text-[10px] text-muted-foreground mt-2 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-lg p-3 flex items-center gap-2 shadow-sm">
                  <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Analyzing your question...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your TOD data... (Press Enter to send)"
              disabled={isLoading}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="default"
            >
              {isLoading ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                <SendIcon className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
