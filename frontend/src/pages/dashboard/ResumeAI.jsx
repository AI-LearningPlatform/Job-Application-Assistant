import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const ResumeAI = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://job-assistant-api-wkkn.onrender.com/api/v1';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleTailor = async () => {
    if (!file || !jobDescription) return;

    setIsProcessing(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    try {
      const response = await axios.post(`${apiBaseUrl}/resume/tailor-preview`, formData);
      setResult({
        matchScore: response.data.match_score,
        summary: response.data.tailored_summary,
        skills: (response.data.key_skills_to_highlight || []).join(', '),
        bullets: (response.data.suggested_bullet_points || []).join('\n'),
      });
    } catch (error) {
      console.error('Resume tailoring failed:', error);
      setError('Could not tailor this resume. Please confirm the PDF has selectable text and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;

    setIsDownloading(true);
    setError('');

    const formData = new FormData();
    formData.append('tailored_summary', result.summary);
    formData.append('skills', result.skills);
    formData.append('bullet_points', result.bullets);
    formData.append('job_description', jobDescription);

    try {
      const response = await axios.post(`${apiBaseUrl}/resume/download-pdf`, formData, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tailored-resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
      setError('Could not generate the PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const updateResult = (field, value) => {
    setResult((current) => ({ ...current, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Resume AI Tailoring</h1>
        <p className="text-gray-400 text-sm">
          Upload your base PDF resume, paste a company job description, edit the tailored content, and download a PDF version.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
            <h2 className="text-lg font-medium text-white mb-4">1. Upload Base Resume</h2>
            <div className="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center hover:bg-dark-700/50 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                <svg className="w-10 h-10 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-medium text-primary-500">Click to upload PDF</span>
                <span className="text-xs text-gray-500 mt-1">{file ? file.name : 'No file selected'}</span>
              </label>
            </div>
          </div>

          <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
            <h2 className="text-lg font-medium text-white mb-4">2. Company Job Description</h2>
            <textarea
              className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-primary-500 h-56 resize-none"
              placeholder="Paste the job description from the company career page..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button
            onClick={handleTailor}
            disabled={!file || !jobDescription || isProcessing}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              !file || !jobDescription || isProcessing
                ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
            }`}
          >
            {isProcessing ? 'Tailoring Resume...' : 'Tailor Resume'}
          </button>
        </div>

        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 h-full">
          <h2 className="text-lg font-medium text-white mb-4">Editable Tailored Resume</h2>

          {result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between p-4 bg-dark-900 rounded-lg border border-dark-600">
                <span className="text-sm text-gray-400">Match Score</span>
                <span className="text-2xl font-bold text-primary-500">{result.matchScore}%</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tailored Summary</label>
                <textarea
                  value={result.summary}
                  onChange={(e) => updateResult('summary', e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-primary-500 h-28 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Skills to Highlight</label>
                <textarea
                  value={result.skills}
                  onChange={(e) => updateResult('skills', e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-primary-500 h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Suggested Bullet Points</label>
                <textarea
                  value={result.bullets}
                  onChange={(e) => updateResult('bullets', e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-primary-500 h-36 resize-none"
                />
              </div>

              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="w-full border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white py-2 rounded-lg font-medium transition-colors text-sm mt-4 disabled:opacity-60"
              >
                {isDownloading ? 'Generating PDF...' : 'Download Tailored PDF'}
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-gray-500">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Upload a resume and job description to edit tailored content.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResumeAI;
