import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Editor, useMonaco } from '@monaco-editor/react';
import { Code2, Play, Settings, Upload, FileText, CheckCircle2, Github, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { api } from '../api/client';
import { AnalysisResult } from '../types';
import toast from 'react-hot-toast';
import AIRecommendations from '../components/dashboard/AIRecommendations';
import IssueTable from '../components/dashboard/IssueTable';

export default function UploadPage() {
  const [searchParams] = useSearchParams();
  const [activeMode, setActiveMode] = useState<'upload' | 'code'>(searchParams.get('mode') === 'code' ? 'code' : 'upload');
  const [code, setCode] = useState('// Paste your code here\n');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  // Editor Settings
  const [showSettings, setShowSettings] = useState(false);
  const [minimap, setMinimap] = useState(false);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('off');

  // Real-time analysis state
  const monaco = useMonaco();
  const [realtimeResult, setRealtimeResult] = useState<AnalysisResult | null>(null);
  const [isRealtimeAnalyzing, setIsRealtimeAnalyzing] = useState(false);
  const editorRef = useRef<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setActiveMode(searchParams.get('mode') === 'code' ? 'code' : 'upload');
  }, [searchParams]);

  const handleManualAnalyze = async () => {
    if (activeMode === 'code') {
      if (!code.trim() || code === '// Paste your code here\n') {
        toast.error('Please enter some code to analyze');
        return;
      }
      setIsLoading(true);
      try {
        const blob = new Blob([code], { type: 'text/plain' });
        const file = new File([blob], `source.${language}`, { type: 'text/plain' });
        const response = await api.analyzeFiles([file], 'Workspace-Snippet');
        toast.success('Analysis started successfully!');
        navigate(`/analysis/${response.id}/progress`);
      } catch (error: any) {
        // Fallback to mock for frontend demo
        toast.success('Analysis started successfully! (Mock)');
        navigate(`/analysis/mock-${Date.now()}/progress`);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!githubUrl.trim() && files.length === 0) {
        toast.error('Please upload a file or enter a GitHub URL');
        return;
      }
      setIsLoading(true);
      try {
        let response;
        if (githubUrl.trim()) {
          response = await api.analyzeGitHub(githubUrl, 'GitHub-Repo');
        } else {
          response = await api.analyzeFiles(files, files[0].name);
        }
        toast.success('Analysis started successfully!');
        navigate(`/analysis/${response.id}/progress`);
      } catch (error: any) {
        // Fallback to mock for frontend demo
        toast.success('Analysis started successfully! (Mock)');
        navigate(`/analysis/mock-${Date.now()}/progress`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Real-time debounce logic for Code Mode
  useEffect(() => {
    if (activeMode !== 'code' || !code.trim() || code === '// Paste your code here\n') return;
    
    setIsRealtimeAnalyzing(true);
    const handler = setTimeout(async () => {
      try {
        const blob = new Blob([code], { type: 'text/plain' });
        const file = new File([blob], `source.${language}`, { type: 'text/plain' });
        const res = await api.analyzeFiles([file], 'Realtime-Snippet');
        
        let attempt = 0;
        const poll = setInterval(async () => {
          attempt++;
          if (attempt > 10) {
            clearInterval(poll);
            setIsRealtimeAnalyzing(false);
          }
          try {
            const result = await api.getResults(res.id);
            if (result.status === 'completed') {
              clearInterval(poll);
              setRealtimeResult(result);
              
              if (monaco && editorRef.current) {
                const model = editorRef.current.getModel();
                if (model) {
                  const markers = result.issues.map(issue => {
                    let severity = monaco.MarkerSeverity.Info;
                    if (issue.severity === 'critical' || issue.severity === 'high') severity = monaco.MarkerSeverity.Error;
                    else if (issue.severity === 'medium') severity = monaco.MarkerSeverity.Warning;
                    
                    return {
                      message: issue.message + (issue.suggestion ? `\nFix: ${issue.suggestion}` : ''),
                      severity,
                      startLineNumber: issue.line_number || 1,
                      endLineNumber: issue.line_number || 1,
                      startColumn: 1,
                      endColumn: 100,
                    };
                  });
                  monaco.editor.setModelMarkers(model, 'owner', markers);
                }
              }
              setIsRealtimeAnalyzing(false);
            } else if (result.status === 'failed') {
              clearInterval(poll);
              setIsRealtimeAnalyzing(false);
            }
          } catch (e) {
            // ignore poll errors
          }
        }, 2000);
      } catch (e) {
        setIsRealtimeAnalyzing(false);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [code, language, activeMode, monaco]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="pb-12 relative"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="hero-bg-glow"></div>
      <motion.div variants={item} className="flex gap-2 mb-6 border-b border-border-color pb-2 overflow-x-auto">
        <button 
          className={`relative px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${activeMode === 'upload' ? 'text-white' : 'text-text-muted hover:text-text-primary'}`}
          onClick={() => setActiveMode('upload')}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {activeMode === 'upload' && (
            <motion.div
              layoutId="upload-tab"
              className="absolute inset-0 bg-primary-color rounded-full shadow-glow"
              style={{ zIndex: 0, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">Upload / GitHub</span>
        </button>
        <button 
          className={`relative px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${activeMode === 'code' ? 'text-white' : 'text-text-muted hover:text-text-primary'}`}
          onClick={() => setActiveMode('code')}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {activeMode === 'code' && (
            <motion.div
              layoutId="upload-tab"
              className="absolute inset-0 bg-primary-color rounded-full shadow-glow"
              style={{ zIndex: 0, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">Write Code</span>
        </button>
      </motion.div>

      <div className="workspace-container" style={{ height: activeMode === 'code' ? 'calc(100vh - 200px)' : 'auto', minHeight: '600px' }}>
        
        {/* LEFT PANEL */}
        <motion.div variants={item} className="workspace-left">
          {activeMode === 'upload' ? (
            <div className="p-8 flex flex-col h-full justify-center">
              <h2 className="text-2xl font-bold mb-6 text-center text-gradient">Analyze a Repository or File</h2>
              
              <div className="mb-8">
                <label className="block text-sm font-medium text-text-muted mb-2">GitHub Repository URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                    <input 
                      type="url" 
                      placeholder="https://github.com/username/repo" 
                      className="input w-full pl-10"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-border-color"></div>
                <span className="flex-shrink-0 mx-4 text-text-muted text-sm uppercase tracking-wider">OR</span>
                <div className="flex-grow border-t border-border-color"></div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-text-muted mb-2">Upload Files</label>
                <motion.div 
                  whileHover={{ scale: 1.01, borderColor: '#8B5CF6', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  className="border-2 border-dashed border-border-color rounded-2xl p-12 text-center transition-all bg-bg-color/50"
                >
                  <motion.div 
                    animate={{ y: [0, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <Upload className="w-12 h-12 text-primary-color mx-auto mb-4" />
                  </motion.div>
                  <p className="text-text-primary font-medium mb-2">Drag and drop your files here</p>
                  <p className="text-text-muted text-sm mb-4">Support for ZIP, TAR, or individual source files</p>
                  <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileChange} />
                  <Button 
                    variant="secondary" 
                    className="cursor-pointer" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Browse Files
                  </Button>
                  {files.length > 0 && (
                    <div className="mt-4 text-sm text-success-color font-medium">
                      {files.length} file(s) selected
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="mt-8 text-center">
                <Button variant="primary" className="w-full md:w-auto px-12 py-3 text-lg" onClick={handleManualAnalyze} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Run Full Analysis'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="workspace-header relative">
                <div className="workspace-title">
                  <Code2 size={20} className="text-primary-color" />
                  Source Code
                </div>
                <div className="workspace-controls">
                  <select 
                    className="select bg-bg-color text-text-primary border border-border-color py-1 px-2 rounded-md focus:outline-none focus:border-primary-color"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="javascript" className="bg-bg-color text-text-primary">JavaScript</option>
                    <option value="typescript" className="bg-bg-color text-text-primary">TypeScript</option>
                    <option value="python" className="bg-bg-color text-text-primary">Python</option>
                    <option value="go" className="bg-bg-color text-text-primary">Go</option>
                    <option value="rust" className="bg-bg-color text-text-primary">Rust</option>
                  </select>
                  <Button variant="ghost" className="px-2" title="Settings" onClick={() => setShowSettings(!showSettings)}>
                    <Settings size={18} />
                  </Button>
                  
                  {showSettings && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-12 right-4 bg-surface-color border border-border-color rounded-xl shadow-lg p-4 z-50 w-64"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold">Editor Settings</h4>
                        <button onClick={() => setShowSettings(false)} className="text-text-muted hover:text-text-primary"><X size={16}/></button>
                      </div>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm">Minimap</span>
                          <input type="checkbox" checked={minimap} onChange={(e) => {
                            setMinimap(e.target.checked);
                            if (editorRef.current) editorRef.current.updateOptions({ minimap: { enabled: e.target.checked } });
                          }} />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm">Word Wrap</span>
                          <input type="checkbox" checked={wordWrap === 'on'} onChange={(e) => {
                            const val = e.target.checked ? 'on' : 'off';
                            setWordWrap(val);
                            if (editorRef.current) editorRef.current.updateOptions({ wordWrap: val });
                          }} />
                        </label>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="editor-container">
                <Editor
                  height="100%"
                  language={language}
                  theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: minimap },
                    wordWrap: wordWrap,
                    fontSize: 14,
                    fontFamily: 'var(--font-mono)',
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                  }}
                />
              </div>
              <div className="p-4 border-t border-border-color bg-surface-color flex justify-between items-center">
                <span className="text-sm text-text-muted flex items-center gap-2">
                  {isRealtimeAnalyzing ? <><span className="w-2 h-2 rounded-full bg-warning-color animate-pulse"></span> Analyzing...</> : <><span className="w-2 h-2 rounded-full bg-success-color"></span> Ready</>}
                </span>
                <Button variant="primary" onClick={handleManualAnalyze} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Run Full Analysis'}
                </Button>
              </div>
            </>
          )}
        </motion.div>

        {/* RIGHT PANEL */}
        {activeMode === 'code' && (
          <motion.div variants={item} className="workspace-right">
            <div className="workspace-header">
              <div className="workspace-title">
                <SparklesIcon />
                Real-Time Review
              </div>
              {realtimeResult && (
                <Badge variant={realtimeResult.scores.overall >= 70 ? 'success' : 'warning'}>Score: {realtimeResult.scores.overall}</Badge>
              )}
            </div>
            <div className="review-panel-content">
              {!realtimeResult ? (
                <div className="review-empty-state">
                  <FileText size={48} />
                  <h3 className="text-xl font-bold mb-2">Start Typing...</h3>
                  <p className="max-w-xs mx-auto text-sm text-text-muted">
                    The editor will automatically analyze your code as you type and highlight issues directly in the code editor.
                  </p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {realtimeResult.ai_review && (
                    <AIRecommendations aiReview={realtimeResult.ai_review} />
                  )}
                  {realtimeResult.issues && realtimeResult.issues.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-4">Detected Issues</h3>
                      <div className="space-y-2">
                        {realtimeResult.issues.map(issue => (
                          <Card key={issue.id} className="p-3 bg-bg-color/50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-sm">{issue.message}</span>
                              <Badge variant={issue.severity === 'critical' ? 'danger' : issue.severity === 'high' ? 'warning' : 'info'}>{issue.severity}</Badge>
                            </div>
                            <div className="text-xs text-text-muted">Line: {issue.line_number} | Category: {issue.category}</div>
                            {issue.suggestion && <div className="text-xs text-primary-color mt-2">Fix: {issue.suggestion}</div>}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-color">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
