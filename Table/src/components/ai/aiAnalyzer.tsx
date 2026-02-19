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
import { ragAPI } from '@/api/rag';
import { SendIcon, Loader2Icon, Trash2Icon, SparklesIcon } from 'lucide-react';

type RagResult = {
  score: number;
  text: string;
  docId: string;
  page: number;
};

type Citation = {
  id: number;
  docId: string;
  page: number;
  content: string;
  score?: number;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: Date;
};

const exampleQuestions = [
  'What are the most common issues in HVAC systems?',
  'What are the most common issues in fuel gas compressors systems?',
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

  const formatResults = (results: RagResult[]): string => {
    if (results.length === 0) {
      return 'No relevant passages found. Try rephrasing your question or ensure PDFs have been processed.';
    }

    return results
      .map((r, i) => {
        const preview =
          r.text.length > 300 ? `${r.text.slice(0, 300)}...` : r.text;
        return `${i + 1}. (${r.docId} p.${r.page}) ${preview}`;
      })
      .join('\n\n');
  };

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
      const response = await ragAPI.analyzePdf(question);

      if (!response?.results) {
        throw new Error('Invalid response from server');
      }

      const results = response.results as RagResult[];
      const content = formatResults(results);

      const assistantMessage: Message = {
        role: 'assistant',
        content,
        citations: results.map((r, idx) => ({
          id: idx,
          docId: r.docId,
          page: r.page,
          content: r.text,
          score: r.score,
        })),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI query error:', error);

      let errorContent = 'Sorry, I encountered an error while processing your question.';
      
      if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
        errorContent = 'Cannot connect to RAG backend. Please ensure the backend is running on port 4000.';
      } else if (error?.response?.status === 404) {
        errorContent = 'RAG backend endpoint not found. Please check the backend configuration.';
      } else if (error?.response?.data?.message) {
        errorContent = error.response.data.message;
      } else if (error?.message) {
        errorContent = error.message;
      }

      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ ${errorContent}`,
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
    inputRef.current?.focus();
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
              aria-label="Clear conversation"
            >
              <Trash2Icon className="w-4 h-4" />
              Clear
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg bg-slate-50/50 min-h-[400px] max-h-[600px]"
            role="log"
            aria-live="polite"
            aria-label="Conversation messages"
          >
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
                      aria-label={`Use example question: ${q}`}
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
                      role={
                        message.role === 'assistant' ? 'article' : undefined
                      }
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
                            {message.citations.map((cite) => (
                              <div
                                key={cite.id}
                                className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded border-l-2 border-primary"
                              >
                                <p className="font-medium text-foreground">
                                  {cite.docId} (p. {cite.page})
                                </p>
                                {cite.content && (
                                  <p className="text-muted-foreground mt-1 line-clamp-2">
                                    {cite.content.slice(0, 120)}
                                    {cite.content.length > 120 ? '...' : ''}
                                  </p>
                                )}
                                {cite.score !== undefined && (
                                  <p className="text-muted-foreground text-[10px] mt-1">
                                    Relevance: {(cite.score * 100).toFixed(1)}%
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-muted-foreground mt-2 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
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
              placeholder="Ask a question about your TOD data..."
              disabled={isLoading}
              className="flex-1"
              aria-label="Question input"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="default"
              aria-label={isLoading ? 'Sending...' : 'Send message'}
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
