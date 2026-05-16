import React from 'react';
import { motion } from 'framer-motion';

const Applications = () => {
  const applications = [
    { id: 1, job: 'Senior AI Engineer', company: 'TechCorp', status: 'INTERVIEWING', date: '2026-05-10' },
    { id: 2, job: 'Data Scientist', company: 'DataFlex', status: 'APPLIED', date: '2026-05-12' },
    { id: 3, job: 'Machine Learning Engineer', company: 'AI Solutions', status: 'SAVED', date: '2026-05-14' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'INTERVIEWING': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'APPLIED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'SAVED': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'OFFER': return 'text-primary-400 bg-primary-400/10 border-primary-400/20';
      case 'REJECTED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Application Tracking</h1>
        <button className="bg-dark-800 border border-dark-700 hover:border-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
          Export Data
        </button>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-900 border-b border-dark-700">
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">Job Title</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">Company</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">Date Applied</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-dark-700/50 transition-colors">
                <td className="px-6 py-4 text-sm text-white font-medium">{app.job}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{app.company}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{app.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-primary-500 hover:text-primary-400 font-medium">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Applications;
