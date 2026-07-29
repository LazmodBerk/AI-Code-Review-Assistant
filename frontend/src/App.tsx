import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ProgressPage from './pages/ProgressPage';
import ResultsPage from './pages/ResultsPage';
import ReportsPage from './pages/ReportsPage';
import PricingPage from './pages/PricingPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import { Toaster } from 'react-hot-toast';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  useDarkMode(); // Initialize dark mode

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="analysis/:id/progress" element={<ProgressPage />} />
          <Route path="analysis/:id/results" element={<ResultsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
