import { useState, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { api } from '../api/client';

export function useAnalysis(id: string) {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    let timeoutId: number;

    const fetchData = async () => {
      try {
        const result = await api.getResults(id);
        if (isMounted) {
          setData(result);
          if (result.status === 'completed' || result.status === 'failed') {
            setIsLoading(false);
          } else {
            timeoutId = window.setTimeout(fetchData, 3000);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An error occurred'));
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [id]);

  return { data, isLoading, error };
}
