import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, Key, CheckCircle2, AlertCircle, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { DEFAULT_API_KEY, setStoredApiKey, resetApiKey } from '../services/youtubeApi';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onApiKeyUpdated: (newKey: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ApiKeyModal = ({
  isOpen,
  onClose,
  currentApiKey,
  onApiKeyUpdated,
  onShowToast,
}: ApiKeyModalProps) => {
  const [apiKeyInput, setApiKeyInput] = useState(currentApiKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) {
      setTestResult({
        success: false,
        message: 'Please enter an API key first.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    const startTime = performance.now();

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=1&key=${keyToTest}`
      );
      const elapsed = Math.round(performance.now() - startTime);

      if (res.ok) {
        setTestResult({
          success: true,
          message: `API Key is valid and responding! (Response time: ${elapsed}ms)`,
          latency: elapsed,
        });
      } else {
        const errorJson = await res.json().catch(() => ({}));
        const errorMsg = errorJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        setTestResult({
          success: false,
          message: `API Error: ${errorMsg}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Network error: ${err.message || 'Could not connect to Google API'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKeyInput.trim();
    if (!cleanKey) {
      onShowToast('API Key cannot be empty', 'error');
      return;
    }
    setStoredApiKey(cleanKey);
    onApiKeyUpdated(cleanKey);
    onShowToast('API Key saved successfully!', 'success');
    onClose();
  };

  const handleReset = () => {
    resetApiKey();
    setApiKeyInput(DEFAULT_API_KEY);
    onApiKeyUpdated(DEFAULT_API_KEY);
    setTestResult(null);
    onShowToast('Reset to default provided API Key', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-lg text-zinc-100">YouTube Data API V3 Key</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Active Google API Key
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {apiKeyInput === DEFAULT_API_KEY ? 'Provided Key Active' : 'Custom Key Active'}
                </span>
              </div>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full font-mono text-xs bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
              />
            </div>

            {/* Test Key Status */}
            {testResult && (
              <div
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testing}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {testing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{testing ? 'Verifying with Google...' : 'Test Connection'}</span>
              </button>

              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-red-600/20"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Save Key</span>
              </button>
            </div>
          </form>

          {/* Bottom Info & Reset */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Quota: 10,000 units/day default</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-red-400 hover:text-red-300 underline underline-offset-2 cursor-pointer"
            >
              Reset to Original Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
