import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { 
  X, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Info
} from 'lucide-react';
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
  const [prevOpen, setPrevOpen] = useState(isOpen);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
  } | null>(null);

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setApiKeyInput(currentApiKey);
      setTestResult(null);
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
          message: `API Key validated successfully!`,
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-7.5 h-7.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-500 shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                Custom API Key
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Connect your credentials for unrestricted streaming
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Quick guide card */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-white/[0.06] text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
              <span>Get 10,000 free requests/day:</span>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed pl-1">
              <li>Open Google Cloud Console & create a project</li>
              <li>Enable "YouTube Data API"</li>
              <li>Create Credentials &rarr; API Key and paste it below</li>
            </ol>
            <a
              href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-0.5"
            >
              <span>Open Google Cloud API Library</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  Active API Key
                </label>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                  {apiKeyInput === DEFAULT_API_KEY ? 'Provided Key' : 'Custom Key'}
                </span>
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full font-mono text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700/80 rounded-xl pl-3.5 pr-9 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/40 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer"
                  title={showKey ? 'Hide Key' : 'Reveal Key'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Test Key Status */}
            {testResult && (
              <div
                className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p>{testResult.message}</p>
                  {testResult.latency !== undefined && (
                    <span className="inline-block mt-1 font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-700/40">
                      Response: {testResult.latency}ms
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testing}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 border border-zinc-200 dark:border-transparent"
              >
                {testing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>

              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/20"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Save Key</span>
              </button>
            </div>
          </form>

          {/* Bottom Info & Reset */}
          <div className="pt-2 border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Free Quota: 10,000/day</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
            >
              Reset to Default Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
