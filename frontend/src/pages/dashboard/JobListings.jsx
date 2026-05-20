import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('Data Analyst');
  const [locationFilter, setLocationFilter] = useState('Bangalore');
  const [workMode, setWorkMode] = useState('remote_hybrid');
  const [searchText, setSearchText] = useState('');

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://job-assistant-api-wkkn.onrender.com/api/v1';

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${apiBaseUrl}/jobs/market`, {
          params: {
            role: roleFilter,
            location: locationFilter,
            work_mode: workMode,
            limit: 20,
          },
        });
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Verified jobs are temporarily unavailable. Please try again shortly.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [apiBaseUrl, roleFilter, locationFilter, workMode]);

  const visibleJobs = jobs.filter((job) => {
    const query = searchText.trim().toLowerCase();
    if (!query) return true;
    return `${job.title} ${job.company} ${job.location} ${job.source}`.toLowerCase().includes(query);
  });

  const handleAutoApply = (jobId, jobUrl) => {
    setApplying(jobId);

    setTimeout(() => {
      alert(`Application automation started for ${jobUrl}. Review the verified posting before final submission.`);
      setApplying(null);
    }, 3000);
  };

  const formatPostingAge = (daysOld) => {
    if (daysOld === null || daysOld === undefined) return 'Active source';
    if (daysOld === 0) return 'Posted today';
    if (daysOld === 1) return 'Posted 1 day ago';
    return `Posted ${daysOld} days ago`;
  };

  const priorityText = (priority) => {
    if (priority === 0) return 'Bangalore first';
    if (priority === 1) return 'India remote';
    return 'Global remote';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 mb-8 xl:flex-row xl:justify-between xl:items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Verified Data Analyst Jobs</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Bangalore remote/hybrid roles appear first. Fully remote jobs are ranked India first, then global. Scam posts, paid training, signup courses, stale jobs, and duplicates are filtered out.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-dark-800 border border-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
          >
            <option value="Data Analyst">Data Analyst</option>
            <option value="Business Intelligence Analyst">BI Analyst</option>
            <option value="Product Analyst">Product Analyst</option>
          </select>
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Bangalore"
            className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
          />
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="bg-dark-800 border border-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
          >
            <option value="remote_hybrid">Remote + Hybrid</option>
            <option value="india_remote">India Remote Only</option>
            <option value="bangalore">Bangalore First Only</option>
          </select>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Filter visible jobs..."
            className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {error && (
            <div className="bg-red-950/40 border border-red-900 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {!error && visibleJobs.length === 0 && (
            <div className="bg-dark-800 border border-dark-700 text-gray-300 px-4 py-6 rounded-xl text-sm">
              No verified Bangalore, India-remote, or global-remote listings passed the safety filters right now.
            </div>
          )}
          {visibleJobs.map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ scale: 1.01 }}
              className="bg-dark-800 p-6 rounded-xl border border-dark-700 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{job.title}</h3>
                  <span className="text-xs bg-emerald-950/70 text-emerald-300 px-2 py-1 rounded border border-emerald-800">
                    Verified
                  </span>
                  <span className="text-xs bg-sky-950/70 text-sky-300 px-2 py-1 rounded border border-sky-800">
                    {priorityText(job.location_priority)}
                  </span>
                  {job.is_direct_employer && (
                    <span className="text-xs bg-primary-950/70 text-primary-300 px-2 py-1 rounded border border-primary-800">
                      Direct careers
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                  <span>{job.company}</span>
                  <span>|</span>
                  <span>{job.location}</span>
                  <span>|</span>
                  <span>{job.work_mode} - {job.region_scope}</span>
                  <span>|</span>
                  <span>{formatPostingAge(job.days_old)}</span>
                  <span>|</span>
                  <span className="text-xs bg-dark-900 px-2 py-1 rounded border border-dark-700">{job.source}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(job.verification_badges || []).slice(0, 5).map((badge) => (
                    <span key={badge} className="text-xs text-gray-300 bg-dark-900 px-2 py-1 rounded border border-dark-700">
                      {badge.replaceAll('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-500">{job.verification_score || job.match_score}%</div>
                  <div className="text-xs text-gray-500">Verified</div>
                </div>
                <div className="space-x-2">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-dark-900 border border-dark-700 hover:border-white text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleAutoApply(job.id, job.url)}
                    disabled={applying === job.id}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${applying === job.id
                      ? 'bg-primary-900/50 text-primary-500 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-500 text-white'
                    }`}
                  >
                    {applying === job.id ? 'Preparing...' : 'Auto-Apply'}
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
