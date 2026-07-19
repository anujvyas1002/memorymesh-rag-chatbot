import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { useToast } from '../context/ToastContext';
import { Modal } from './ui/Modal';

export function ApiKeyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { apiKey, setApiKey } = useApiKey();
  const { success } = useToast();
  const [value, setValue] = useState(apiKey);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(apiKey);
      setReveal(false);
    }
  }, [open, apiKey]);

  const save = () => {
    setApiKey(value.trim());
    success(value.trim().length > 0 ? 'API key saved' : 'API key cleared');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="API key"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save}>
            Save
          </button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-400">
        Sent as the <code className="rounded bg-slate-800 px-1 py-0.5 text-xs">x-api-key</code> header on
        every request. Leave empty if the backend has no key configured. Stored locally in your browser.
      </p>
      <label className="label">Key</label>
      <div className="relative">
        <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type={reveal ? 'text' : 'password'}
          className="input pl-9 pr-9"
          placeholder="paste your API key"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          autoFocus
        />
        <button
          type="button"
          onClick={() => setReveal((r) => !r)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
          aria-label={reveal ? 'Hide key' : 'Show key'}
        >
          {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Modal>
  );
}
