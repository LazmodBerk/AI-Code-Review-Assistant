import axios from 'axios';
import { AnalysisResult, HistoryItem } from '../types';

const apiClient = axios.create({
  baseURL: '/api',
});

export const api = {
  analyzeFiles: async (files: File[], repoName: string): Promise<{ id: string }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('repo_name', repoName);
    
    const response = await apiClient.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { id: response.data.analysis_id };
  },

  analyzeGitHub: async (url: string, repoName: string): Promise<{ id: string }> => {
    const formData = new FormData();
    formData.append('github_url', url);
    formData.append('repo_name', repoName);

    const response = await apiClient.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { id: response.data.analysis_id };
  },

  getResults: async (id: string): Promise<AnalysisResult> => {
    const response = await apiClient.get(`/results/${id}`);
    return response.data;
  },

  getMetrics: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/metrics/${id}`);
    return response.data;
  },

  getHistory: async (): Promise<HistoryItem[]> => {
    const response = await apiClient.get('/history');
    return response.data;
  },

  deleteAnalysis: async (id: string): Promise<void> => {
    await apiClient.delete(`/analysis/${id}`);
  },

  downloadReport: async (id: string, format: 'pdf' | 'html' | 'md'): Promise<Blob> => {
    const response = await apiClient.get(`/report/${id}?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
