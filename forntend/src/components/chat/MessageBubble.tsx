import clsx from 'clsx';
import { Bot, User } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Citation, MessageRole } from '../../lib/types';
import { CitationList } from './CitationList';

export function MessageBubble({
  role,
  content,
  citations,
}: {
  role: MessageRole;
  content: string;
  citations?: Citation[] | null;
}) {
  const isUser = role === 'user';

  return (
    <div className={clsx('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={clsx(
          'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
          isUser ? 'bg-slate-700 text-slate-200' : 'bg-brand-600 text-white',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'rounded-tr-sm bg-slate-800 text-slate-100'
            : 'rounded-tl-sm border border-slate-800 bg-slate-900/70',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        ) : (
          <div className="prose-answer">
            <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
          </div>
        )}
        {!isUser && citations && <CitationList citations={citations} />}
      </div>
    </div>
  );
}
