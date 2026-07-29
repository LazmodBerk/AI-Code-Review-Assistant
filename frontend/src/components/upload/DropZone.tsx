import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Github, Folder } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface DropZoneProps {
  onAnalyze: (files: File[], repoName: string, githubUrl?: string) => void;
  isLoading: boolean;
}

export default function DropZone({ onAnalyze, isLoading }: DropZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [repoName, setRepoName] = useState('');
  const [mode, setMode] = useState<'files' | 'github'>('files');
  const [githubUrl, setGithubUrl] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.py', '.js', '.ts', '.tsx', '.jsx', '.go', '.rs', '.java', '.cpp', '.c', '.cs'],
      'application/zip': ['.zip'],
    },
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (!repoName.trim()) {
      toast.error('Please provide a repository name');
      return;
    }

    if (mode === 'files') {
      if (files.length === 0) {
        toast.error('Please upload at least one file or a zip archive');
        return;
      }
      onAnalyze(files, repoName);
    } else {
      if (!githubUrl.trim()) {
        toast.error('Please provide a GitHub URL');
        return;
      }
      onAnalyze([], repoName, githubUrl);
    }
  };

  return (
    <div className="card p-8 max-w-3xl mx-auto mt-10">
      <div className="flex mb-6 space-x-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <button
          className={clsx('flex items-center space-x-2 pb-2 border-b-2 transition-colors', 
            mode === 'files' ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}
          onClick={() => setMode('files')}
        >
          <Folder className="w-5 h-5" />
          <span>Local Files</span>
        </button>
        <button
          className={clsx('flex items-center space-x-2 pb-2 border-b-2 transition-colors', 
            mode === 'github' ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}
          onClick={() => setMode('github')}
        >
          <Github className="w-5 h-5" />
          <span>GitHub URL</span>
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project / Repository Name</label>
        <input
          type="text"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          placeholder="e.g., my-awesome-project"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
      </div>

      {mode === 'files' ? (
        <>
          <div
            {...getRootProps()}
            className={clsx(
              'border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200',
              isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
            )}
          >
            <input {...getInputProps()} />
            <Upload className={clsx('w-12 h-12 mb-4', isDragActive ? 'text-primary-500' : 'text-gray-400')} />
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 text-center">
              {isDragActive ? 'Drop files here...' : 'Drag & drop source files or a .zip archive'}
            </p>
            <p className="text-sm text-gray-400 text-center">
              Supported: .py, .js, .ts, .go, .rs, .java, .cpp, .c, .cs, .zip
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Selected Files ({files.length})</h4>
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                    <span className="text-gray-700 dark:text-gray-300 truncate mr-4">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GitHub Repository URL</label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="btn-primary w-full md:w-auto flex items-center justify-center space-x-2 py-3 px-8 text-lg"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Preparing...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Start Analysis</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SparklesIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}
