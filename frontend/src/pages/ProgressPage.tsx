import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../api/client';

const STAGES = [
  'Pending',
  'Uploading',
  'Analyzing',
  'AI Review',
  'Scoring',
  'Complete'
];

export default function ProgressPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { messages, error, isConnected } = useWebSocket(id || '');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [localStage, setLocalStage] = useState<string>('pending');
  const [pollFailed, setPollFailed] = useState(false);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update localStage from messages
  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.status) setLocalStage(last.status);
    }
  }, [messages]);

  // Check if complete via polling as fallback or API confirmation
  useEffect(() => {
    if (!id) return;
    
    let interval: number;
    const checkStatus = async () => {
      try {
        const result = await api.getResults(id);
        if (result.status) setLocalStage(result.status);
        
        if (result.status === 'completed') {
          navigate(`/analysis/${id}/results`, { replace: true });
        } else if (result.status === 'failed') {
          setPollFailed(true);
          clearInterval(interval);
        }
      } catch (e) {
        // ignore
      }
    };

    interval = window.setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [id, navigate]);

  // Handle WS completion
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.status === 'completed') {
      setTimeout(() => {
        navigate(`/analysis/${id}/results`, { replace: true });
      }, 1000);
    }
  }, [messages, id, navigate]);

  const currentStage = localStage;
  const isFailed = currentStage === 'failed' || pollFailed;

  const getStageIndex = () => {
    if (isFailed) return -1;
    if (currentStage === 'completed') return STAGES.length - 1;
    if (currentStage === 'scoring') return 4;
    if (currentStage === 'ai_review') return 3;
    if (currentStage === 'analyzing' || currentStage === 'running') return 2;
    if (currentStage === 'uploading') return 1;
    return 0;
  };

  const stageIndex = getStageIndex();
  const progressPercent = Math.max(5, (stageIndex / (STAGES.length - 1)) * 100);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8 text-center">Analysis Progress</h2>
        
        {/* Progress Bar Container */}
        <div className="relative mb-12">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={clsx(
                "h-full transition-all duration-500 ease-out",
                isFailed ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
              )}
              style={{ width: `${isFailed ? 100 : progressPercent}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-4">
            {STAGES.map((stage, idx) => {
              const isPast = idx < stageIndex;
              const isCurrent = idx === stageIndex;
              
              return (
                <div key={stage} className="flex flex-col items-center">
                  <div className={clsx(
                    "flex items-center justify-center w-8 h-8 rounded-full mb-2 bg-white dark:bg-gray-900 border-2",
                    isPast ? "border-indigo-500 text-indigo-500" : 
                    isCurrent ? "border-indigo-500 text-indigo-500" : 
                    isFailed ? "border-red-500 text-red-500" :
                    "border-gray-300 dark:border-gray-600 text-gray-300 dark:text-gray-600"
                  )}>
                    {isFailed ? <XCircle className="w-5 h-5" /> : 
                     isPast || currentStage === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                     isCurrent ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                     <Circle className="w-4 h-4" />}
                  </div>
                  <span className={clsx(
                    "text-xs font-medium",
                    isCurrent || isPast ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-500"
                  )}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Terminal Output */}
        <div className="bg-gray-900 dark:bg-black rounded-xl p-4 h-64 overflow-y-auto font-mono text-sm border border-gray-800 shadow-inner">
          {messages.map((msg, i) => (
            <div key={i} className="mb-2">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>{' '}
              <span className={clsx(
                msg.type === 'error' || msg.status === 'failed' ? 'text-red-400' :
                msg.status === 'completed' ? 'text-green-400' :
                'text-indigo-300'
              )}>
                {msg.message || `Status changed to ${msg.status}`}
              </span>
            </div>
          ))}
          {!isConnected && !isFailed && currentStage !== 'completed' && (
            <div className="text-yellow-500">Connecting to server...</div>
          )}
          {isFailed && (
            <div className="text-red-500 font-bold mt-4">
              Analysis failed. Please check the logs above or try again.
            </div>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
