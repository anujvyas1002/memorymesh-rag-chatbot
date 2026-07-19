import clsx from 'clsx';
import { FileUp, Type, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useIngestDocument, useUploadDocument } from '../../hooks/useDocuments';
import { ApiError } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

type Tab = 'text' | 'file';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = '.txt,.md,.json,text/plain,text/markdown,application/json';

export function AddDocumentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { success, error: toastError } = useToast();
  const ingest = useIngestDocument();
  const upload = useUploadDocument();

  const [tab, setTab] = useState<Tab>('text');

  // Text-ingest fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [metadataText, setMetadataText] = useState('');

  // File-upload fields
  const [file, setFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileSource, setFileSource] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pending = ingest.isPending || upload.isPending;

  const reset = () => {
    setTitle('');
    setContent('');
    setSource('');
    setMetadataText('');
    setFile(null);
    setFileTitle('');
    setFileSource('');
    setTab('text');
  };

  const close = () => {
    if (!pending) {
      reset();
      onClose();
    }
  };

  const pickFile = (f: File | null) => {
    if (!f) {
      return;
    }
    if (f.size > MAX_BYTES) {
      toastError('File exceeds the 5MB limit');
      return;
    }
    setFile(f);
    if (fileTitle.trim() === '') {
      setFileTitle(f.name);
    }
  };

  const submitText = async () => {
    if (title.trim().length === 0 || content.trim().length === 0) {
      toastError('Title and content are required');
      return;
    }
    let metadata: Record<string, unknown> | undefined;
    if (metadataText.trim().length > 0) {
      try {
        const parsed = JSON.parse(metadataText);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('not an object');
        }
        metadata = parsed as Record<string, unknown>;
      } catch {
        toastError('Metadata must be a valid JSON object');
        return;
      }
    }
    try {
      const doc = await ingest.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        source: source.trim() || undefined,
        metadata,
      });
      success(`Ingested “${doc.title}”`);
      reset();
      onClose();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to ingest document');
    }
  };

  const submitFile = async () => {
    if (!file) {
      toastError('Choose a file to upload');
      return;
    }
    try {
      const doc = await upload.mutateAsync({
        file,
        fields: { title: fileTitle.trim() || undefined, source: fileSource.trim() || undefined },
      });
      success(`Uploaded “${doc.title}”`);
      reset();
      onClose();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to upload file');
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add document"
      maxWidth="max-w-2xl"
      footer={
        <>
          <button className="btn-secondary" onClick={close} disabled={pending}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => void (tab === 'text' ? submitText() : submitFile())}
            disabled={pending}
          >
            {pending && <Spinner />}
            {tab === 'text' ? 'Ingest' : 'Upload'}
          </button>
        </>
      }
    >
      <div className="mb-4 flex gap-1 rounded-lg bg-slate-800/60 p-1">
        <TabButton active={tab === 'text'} onClick={() => setTab('text')} icon={<Type className="h-4 w-4" />}>
          Paste text
        </TabButton>
        <TabButton active={tab === 'file'} onClick={() => setTab('file')} icon={<FileUp className="h-4 w-4" />}>
          Upload file
        </TabButton>
      </div>

      {tab === 'text' ? (
        <div className="space-y-3">
          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              maxLength={512}
              placeholder="Company Leave Policy 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Content *</label>
            <textarea
              className="input min-h-[160px] resize-y font-mono text-xs"
              placeholder="Paste the raw text to chunk and embed…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Source</label>
              <input
                className="input"
                maxLength={1024}
                placeholder="https://intranet/hr/leave-policy"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Metadata (JSON)</label>
              <input
                className="input font-mono text-xs"
                placeholder='{"department":"HR"}'
                value={metadataText}
                onChange={(e) => setMetadataText(e.target.value)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pickFile(e.dataTransfer.files?.[0] ?? null);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition',
              dragging ? 'border-brand-500 bg-brand-500/5' : 'border-slate-700 hover:border-slate-600',
            )}
          >
            <Upload className="h-7 w-7 text-slate-500" />
            {file ? (
              <p className="text-sm text-slate-200">
                {file.name} <span className="text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
              </p>
            ) : (
              <>
                <p className="text-sm text-slate-300">Drop a file here, or click to browse</p>
                <p className="text-xs text-slate-500">.txt, .md, or .json — up to 5MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Title (optional)</label>
              <input
                className="input"
                placeholder="Defaults to filename"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Source (optional)</label>
              <input
                className="input"
                placeholder="Defaults to filename"
                value={fileSource}
                onChange={(e) => setFileSource(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition',
        active ? 'bg-slate-900 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200',
      )}
    >
      {icon}
      {children}
    </button>
  );
}
