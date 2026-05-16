import React from 'react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="pt-20">
      <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 -z-10" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            <span className="block text-white">Full-Stack AI Engineer</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              Data Analyst
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10"
          >
            Building intelligent, scalable applications and extracting actionable insights from complex data. 
            Empowered by AI to automate workflows and elevate career growth.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center space-x-4"
          >
            <a href="#projects" className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]">
              View Work
            </a>
            <a href="/dashboard" className="bg-dark-800 border border-dark-700 hover:border-primary-500 text-white px-8 py-3 rounded-full font-medium transition-colors">
              Access AI Assistant
            </a>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Featured Work</h2>
            <div className="w-20 h-1 bg-primary-500 mx-auto rounded-full"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project Card Stub */}
            {[1, 2, 3].map((item) => (
              <motion.div 
                key={item}
                whileHover={{ y: -10 }}
                className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700 hover:border-primary-500/50 transition-all shadow-lg"
              >
                <div className="h-48 bg-dark-700 flex items-center justify-center">
                  <span className="text-dark-400 font-medium">Project Image</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">AI Agent System {item}</h3>
                  <p className="text-gray-400 mb-4 text-sm">Automated workflow system using LLMs and vector databases for contextual decision making.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-dark-900 rounded-full text-xs text-primary-400 border border-primary-900">React</span>
                    <span className="px-3 py-1 bg-dark-900 rounded-full text-xs text-primary-400 border border-primary-900">Python</span>
                    <span className="px-3 py-1 bg-dark-900 rounded-full text-xs text-primary-400 border border-primary-900">FastAPI</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
