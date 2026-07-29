import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Server, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

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

export default function SettingsPage() {
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  
  const [provider, setProvider] = useState('none');
  const [openaiKey, setOpenaiKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [lmStudioUrl, setLmStudioUrl] = useState('http://localhost:1234/v1');
  
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setProvider(localStorage.getItem('ai_provider') || 'none');
    setOpenaiKey(localStorage.getItem('openai_key') || '');
    setOllamaUrl(localStorage.getItem('ollama_url') || 'http://localhost:11434');
    setLmStudioUrl(localStorage.getItem('lmstudio_url') || 'http://localhost:1234/v1');
  }, []);

  const handleSave = () => {
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('openai_key', openaiKey);
    localStorage.setItem('ollama_url', ollamaUrl);
    localStorage.setItem('lmstudio_url', lmStudioUrl);
    toast.success('Settings saved successfully');
  };

  const handleTest = () => {
    toast.success(`Connection to ${provider.toUpperCase()} successful! (Mock)`);
  };

  return (
    <motion.div 
      className="max-w-3xl mx-auto py-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">Settings</h1>
        <p className="text-text-muted mt-1">Configure application preferences and AI integrations.</p>
      </motion.div>

      <div className="space-y-6">
        {/* Appearance */}
        <motion.div variants={item}>
          <Card className="p-6 bg-surface-color/50">
            <h2 className="text-lg font-bold text-text-primary mb-4 border-b border-border-color pb-2">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">Theme Preference</p>
                <p className="text-sm text-text-muted">Toggle between light and dark mode</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-3 bg-bg-color border border-border-color rounded-xl text-text-muted hover:text-primary-color transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
          </Card>
        </motion.div>

        {/* AI Provider */}
        <motion.div variants={item}>
          <Card className="p-6 bg-surface-color/50">
            <h2 className="text-lg font-bold text-text-primary mb-4 border-b border-border-color pb-2">AI Configuration</h2>
            
            <div className="space-y-4 mb-6">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="radio" name="provider" value="none" checked={provider === 'none'} onChange={(e) => setProvider(e.target.value)} className="w-4 h-4 text-primary-color bg-bg-color border-border-color" />
                <span className="text-text-primary font-medium group-hover:text-primary-color transition-colors">None (Static Analysis Only)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="radio" name="provider" value="openai" checked={provider === 'openai'} onChange={(e) => setProvider(e.target.value)} className="w-4 h-4 text-primary-color bg-bg-color border-border-color" />
                <span className="text-text-primary font-medium group-hover:text-primary-color transition-colors">OpenAI</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="radio" name="provider" value="ollama" checked={provider === 'ollama'} onChange={(e) => setProvider(e.target.value)} className="w-4 h-4 text-primary-color bg-bg-color border-border-color" />
                <span className="text-text-primary font-medium group-hover:text-primary-color transition-colors">Ollama (Local)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="radio" name="provider" value="lmstudio" checked={provider === 'lmstudio'} onChange={(e) => setProvider(e.target.value)} className="w-4 h-4 text-primary-color bg-bg-color border-border-color" />
                <span className="text-text-primary font-medium group-hover:text-primary-color transition-colors">LM Studio (Local)</span>
              </label>
            </div>

            <div className="bg-bg-color/50 p-6 rounded-2xl border border-border-color">
              {provider === 'none' && (
                <p className="text-text-muted text-sm">No AI features will be used. Analysis will rely entirely on static analysis tools like ESLint, Pylint, etc.</p>
              )}

              {provider === 'openai' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">OpenAI API Key</label>
                  <div className="relative flex items-center">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      className="input w-full pr-12"
                    />
                    <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-4 text-text-muted hover:text-text-primary transition-colors">
                      {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {provider === 'ollama' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Ollama Base URL</label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="input w-full"
                  />
                  <p className="text-xs text-text-muted mt-2">Ensure Ollama is running and accessible. Default: http://localhost:11434</p>
                </div>
              )}

              {provider === 'lmstudio' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">LM Studio Server URL</label>
                  <input
                    type="text"
                    value={lmStudioUrl}
                    onChange={(e) => setLmStudioUrl(e.target.value)}
                    className="input w-full"
                  />
                  <p className="text-xs text-text-muted mt-2">Start the Local Inference Server in LM Studio. Default: http://localhost:1234/v1</p>
                </div>
              )}
              
              {provider !== 'none' && (
                <div className="mt-6 flex justify-end">
                  <Button variant="secondary" onClick={handleTest}>
                    <Server className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="flex justify-end mt-8">
          <Button variant="primary" onClick={handleSave} className="px-8 py-3 text-lg">
            <Save className="w-5 h-5 mr-2" />
            Save Settings
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
