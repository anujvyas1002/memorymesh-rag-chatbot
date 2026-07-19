import { Bot, SendHorizonal, Sparkles } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ConversationList } from '../components/chat/ConversationList';
import { MessageBubble } from '../components/chat/MessageBubble';
import { RetrievalSettings, type RetrievalOptions } from '../components/RetrievalSettings';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/States';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../lib/api';
import type { MessageResponse } from '../lib/types';
import {
  useAsk,
  useConversation,
  useConversations,
  useDeleteConversation,
} from '../hooks/useChat';

const SUGGESTIONS = [
  'Summarize the key points across my documents.',
  'What are the main topics covered?',
  'List any policies or rules mentioned.',
];

export function ChatPage() {
  const { error: toastError, success } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<RetrievalOptions>({});
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const conversationsQuery = useConversations({ skip: 0, take: 100 });
  const conversationQuery = useConversation(activeId ?? undefined);
  const ask = useAsk();
  const deleteConversation = useDeleteConversation();

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages: MessageResponse[] = conversationQuery.data?.messages ?? [];

  // Auto-scroll to the newest message / pending state.
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, pendingQuestion, ask.isPending]);

  // Auto-grow the textarea.
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [question]);

  const submit = async () => {
    const trimmed = question.trim();
    if (trimmed.length === 0 || ask.isPending) {
      return;
    }
    setQuestion('');
    setPendingQuestion(trimmed);
    try {
      const answer = await ask.mutateAsync({
        question: trimmed,
        conversationId: activeId ?? undefined,
        topK: options.topK,
        minScore: options.minScore,
      });
      setActiveId(answer.conversationId);
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to get an answer');
      setQuestion(trimmed); // restore so the user can retry
    } finally {
      setPendingQuestion(null);
    }
  };

  const startNewChat = () => {
    setActiveId(null);
    setQuestion('');
    setPendingQuestion(null);
    textareaRef.current?.focus();
  };

  const confirmDelete = async () => {
    if (!deleteId) {
      return;
    }
    try {
      await deleteConversation.mutateAsync(deleteId);
      success('Conversation deleted');
      if (deleteId === activeId) {
        setActiveId(null);
      }
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to delete conversation');
    } finally {
      setDeleteId(null);
    }
  };

  const showEmpty = !activeId && messages.length === 0 && !pendingQuestion;

  return (
    <div className="flex h-full">
      <ConversationList
        conversations={conversationsQuery.data?.items ?? []}
        activeId={activeId}
        isLoading={conversationsQuery.isLoading}
        onSelect={setActiveId}
        onNew={startNewChat}
        onDelete={(id) => setDeleteId(id)}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <Bot className="h-5 w-5 shrink-0 text-brand-400" />
            <h1 className="truncate text-sm font-semibold text-slate-100">
              {conversationQuery.data?.title ?? 'New conversation'}
            </h1>
          </div>
          <RetrievalSettings value={options} onChange={setOptions} />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-6">
            {showEmpty ? (
              <div className="pt-10">
                <EmptyState
                  icon={<Sparkles className="h-6 w-6" />}
                  title="Ask anything about your knowledge base"
                  description="Questions are answered using your ingested documents, with inline [n] citations to the sources."
                />
                <div className="mx-auto mt-2 flex max-w-md flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuestion(s)}
                      className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-left text-sm text-slate-300 transition hover:border-brand-500/40 hover:bg-slate-800/60"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {conversationQuery.isLoading && activeId ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-5 w-5" />
                  </div>
                ) : (
                  messages.map((m) => (
                    <MessageBubble key={m.id} role={m.role} content={m.content} citations={m.sources} />
                  ))
                )}

                {pendingQuestion && (
                  <>
                    <MessageBubble role="user" content={pendingQuestion} citations={null} />
                    <div className="flex gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
                        <Spinner /> Retrieving context & generating…
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 px-6 py-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void submit();
                }
              }}
              rows={1}
              placeholder="Ask a question…  (Enter to send, Shift+Enter for newline)"
              className="input max-h-40 flex-1 resize-none py-2.5"
            />
            <button
              onClick={() => void submit()}
              disabled={ask.isPending || question.trim().length === 0}
              className="btn-primary h-[42px] px-3"
              aria-label="Send"
            >
              {ask.isPending ? <Spinner /> : <SendHorizonal className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete conversation"
        message="This permanently deletes the conversation and all of its messages. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleteConversation.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
