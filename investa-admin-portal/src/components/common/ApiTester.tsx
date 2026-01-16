
import React, { useState } from 'react';
import { Icon } from './Icons';

interface ApiResponse {
  status: number;
  statusText: string;
  data: any;
  time: number;
  headers: Record<string, string>;
}

export const ApiTester: React.FC = () => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendRequest = async () => {
    setIsLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const parsedHeaders = JSON.parse(headers);
      const options: RequestInit = {
        method,
        headers: parsedHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      const end = performance.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        time: Math.round(end - start),
        headers: responseHeaders,
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during the request.');
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">API Workbench</h2>
          <p className="text-slate-500 text-[13px] font-medium">Test and debug endpoints within the system infrastructure.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Request Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <Icon name="terminal" className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-tight">Request Configuration</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  try {
                    const stored = localStorage.getItem('token');
                    if (!stored) return alert('No token in localStorage');
                    const parsed = JSON.parse(headers || '{}');
                    parsed['Authorization'] = `Bearer ${stored}`;
                    setHeaders(JSON.stringify(parsed, null, 2));
                  } catch (e) { alert('Failed to apply token to headers'); }
                }}
                className="px-3 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-widest bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
              >
                Use Stored Token
              </button>

              <button
                type="button"
                onClick={() => {
                  const tok = prompt('Paste token here:');
                  if (!tok) return;
                  try { localStorage.setItem('token', tok); alert('Token saved to localStorage'); }
                  catch (e) { alert('Failed to save token'); }
                }}
                className="px-3 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-widest bg-slate-800 text-white shadow-md hover:bg-slate-900"
              >
                Save Token
              </button>

              <button 
                onClick={handleSendRequest}
                disabled={isLoading}
                className={`
                  px-5 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all
                  ${isLoading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95'}
                `}
              >
                {isLoading ? 'Executing...' : 'Send Request'}
              </button>
            </div>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-5">
            {/* URL & Method */}
            <div className="flex gap-2">
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="bg-slate-100 border-none rounded-xl px-3 py-2 text-[12px] font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
              >
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-[12px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                placeholder="https://api.example.com/endpoint"
              />
            </div>

            {/* Headers */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headers (JSON)</label>
              <textarea 
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                className="w-full h-24 bg-slate-900 text-indigo-300 font-mono text-[11px] p-4 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
              />
            </div>

            {/* Body */}
            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Body (JSON)</label>
              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={['GET', 'DELETE'].includes(method)}
                className={`w-full flex-1 bg-slate-900 text-emerald-300 font-mono text-[11px] p-4 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none ${['GET', 'DELETE'].includes(method) ? 'opacity-50 grayscale' : ''}`}
                placeholder="{}"
              />
            </div>
          </div>
        </div>

        {/* Response Panel */}
        <div className="bg-slate-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[700px] border border-slate-800">
          <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Icon name="code" className="w-4 h-4 opacity-50" />
              <h3 className="text-[13px] font-bold uppercase tracking-tight opacity-70">Console Output</h3>
            </div>
            {response && (
              <div className="flex items-center gap-4">
                <span className={`text-[11px] font-black px-2 py-0.5 rounded ${response.status >= 200 && response.status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {response.status} {response.statusText}
                </span>
                <span className="text-[11px] font-bold text-slate-500">{response.time}ms</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-5 font-mono text-[11px]">
            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Establishing secure connection...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                <p className="font-bold mb-1">Execution Error</p>
                <p className="opacity-80">{error}</p>
              </div>
            )}

            {!isLoading && response && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white/30 text-[9px] uppercase font-black tracking-[0.2em] mb-3">Response Body</h4>
                  <pre className="text-emerald-400/90 whitespace-pre-wrap">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="text-white/30 text-[9px] uppercase font-black tracking-[0.2em] mb-3">Response Headers</h4>
                  <div className="grid grid-cols-[150px_1fr] gap-x-4 gap-y-1">
                    {Object.entries(response.headers).map(([k, v]) => (
                      <React.Fragment key={k}>
                        <span className="text-slate-500 text-right">{k}:</span>
                        <span className="text-slate-300 truncate" title={v}>{v}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !response && !error && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center">
                <Icon name="terminal" className="w-12 h-12 opacity-10 mb-4" />
                <p className="text-[13px] font-medium">Ready for input.</p>
                <p className="text-[11px] opacity-40 mt-1 uppercase tracking-widest">Execute a request to see output</p>
              </div>
            )}
          </div>

          <div className="px-5 py-2 border-t border-white/5 bg-black/40 text-[9px] text-slate-600 flex justify-between uppercase tracking-widest font-black">
            <span>Runtime Environment: Sandbox</span>
            <span>HTTPS Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
