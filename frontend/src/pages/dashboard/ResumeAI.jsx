import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ResumeAI = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTailor = () => {
    if (!file || !jobDescription) return;
    
    setIsProcessing(true);
    
    // Simulate API call to /api/v1/resume/tailor
    setTimeout(() => {
      setResult({
        matchScore: 85,
        summary: "Highly motivated professional with skills perfectly matching the job description.",
        skills: ["Mock Skill 1", "Mock Skill 2", "Python", "React"],
        bullets: [
          "Engineered a scalable solution resulting in 20% performance increase.",
          "Led cross-functional teams to deliver mock projects."
        ]
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Resume AI Tailoring</h1>
        <p className="text-gray-400 text-sm">Upload your base resume and paste a job description. The AI will analyze the match and generate tailored bullet points.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <h2 className="text-lg font-medium text-white mb-4">2. Job Description</h2>
            <textarea 
              className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-primary-500 h-40 resize-none"
              placeholder="Paste the job description here..."
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
                : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
            }`}
          >
            {isProcessing ? 'AI Analyzing...' : 'Tailor Resume'}
          </button>
        </div>

        <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 h-full">
          <h2 className="text-lg font-medium text-white mb-4">AI Results</h2>
          
          {result ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between p-4 bg-dark-900 rounded-lg border border-dark-600">
                <span className="text-sm text-gray-400">Match Score</span>
                <span className="text-2xl font-bold text-primary-500">{result.matchScore}%</span>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Tailored Summary</h3>
                <p className="text-sm text-gray-400 bg-dark-900 p-3 rounded border border-dark-600">{result.summary}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Missing/Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-primary-900/20 border border-primary-900 text-primary-400 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Suggested Bullet Points</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
                  {result.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
              
              <button className="w-full border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white py-2 rounded-lg font-medium transition-colors text-sm mt-4">
                Download Tailored PDF
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Upload a resume and job description to see AI suggestions.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResumeAI;
