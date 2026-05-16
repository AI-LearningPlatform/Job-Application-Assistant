import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

const funnelData = [
  { stage: 'Saved Jobs', count: 45 },
  { stage: 'Applied', count: 28 },
  { stage: 'Interviews', count: 8 },
  { stage: 'Offers', count: 2 },
];

const StatCard = ({ title, value, change }) => (
  <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
    <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
    <div className="flex items-end justify-between">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className={`text-sm font-medium ${change >= 0 ? 'text-primary-500' : 'text-red-500'}`}>
        {change >= 0 ? '+' : ''}{change}%
      </div>
    </div>
  </div>
);

const Overview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
          Run Job Scraper
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Applications" value="124" change={12} />
        <StatCard title="Interview Rate" value="15%" change={3} />
        <StatCard title="New Matches Today" value="42" change={-5} />
      </div>

      <div className="bg-dark-800 p-6 rounded-xl border border-dark-700 h-96">
        <h3 className="text-white font-medium mb-6">Application Pipeline Funnel</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="stage" type="category" stroke="#94a3b8" width={80} />
            <Tooltip 
              cursor={{fill: '#1e293b'}}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              itemStyle={{ color: '#22c55e' }}
            />
            <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default Overview;
