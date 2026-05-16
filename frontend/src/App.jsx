import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import JobListings from './pages/dashboard/JobListings';
import Applications from './pages/dashboard/Applications';
import ResumeAI from './pages/dashboard/ResumeAI';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900 text-white font-sans selection:bg-primary-500/30 selection:text-primary-100">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="jobs" element={<JobListings />} />
              <Route path="applications" element={<Applications />} />
              <Route path="resume" element={<ResumeAI />} />
              <Route path="settings" element={<div className="text-white">Settings</div>} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
