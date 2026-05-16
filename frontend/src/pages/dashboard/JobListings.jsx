import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null); // Track which job ID is applying

  const [roleFilter, setRoleFilter] = useState('Data Analyst');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/jobs/market?role=${encodeURIComponent(roleFilter)}`);
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [roleFilter]);

  const handleAutoApply = (jobId, jobUrl) => {
    setApplying(jobId);
    
    // Simulate hitting POST /api/v1/automate/apply
    setTimeout(() => {
      alert(`✅ Application automation successful for ${jobUrl}! \nPlaywright bot navigated the career page, filled the form, and submitted your resume.`);
      setApplying(null);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Recommended Jobs</h1>
        <div className="flex space-x-2">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-dark-800 border border-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
          >
            <option value="Data Analyst">Data Analyst</option>
            <option value="AI Engineer">AI Engineer</option>
            <option value="Machine Learning">Machine Learning</option>
          </select>
          <input 
            type="text" 
            placeholder="Search jobs..." 
            className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <motion.div 
              key={job.id}
              whileHover={{ scale: 1.01 }}
              className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-bold text-white">{job.title}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                  <span>{job.company}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span className="text-xs bg-dark-900 px-2 py-1 rounded border border-dark-700">{job.source}</span>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-500">{job.match_score}%</div>
                  <div className="text-xs text-gray-500">AI Match</div>
                </div>
                <div className="space-x-2">
                  <button className="bg-dark-900 border border-dark-700 hover:border-white text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                    Save
                  </button>
                  <button 
                    onClick={() => handleAutoApply(job.id, job.company)}
                    disabled={applying === job.id}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                      applying === job.id 
                        ? 'bg-primary-900/50 text-primary-500 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-500 text-white'
                    }`}
                  >
                    {applying === job.id ? 'Bot Applying...' : 'Auto-Apply'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default JobListings;
