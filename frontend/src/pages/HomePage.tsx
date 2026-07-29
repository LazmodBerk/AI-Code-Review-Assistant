import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Code2, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function HomePage() {
  return (
    <motion.div 
      className="pb-12"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-glow"></div>
        
        <motion.div variants={item} className="hero-badge">
          <Sparkles size={16} />
          <span>AI-Powered Static Analysis</span>
        </motion.div>
        
        <motion.h1 variants={item} className="hero-title">
          Elevate Your Code Quality with <span className="hero-title-highlight">AI Review</span>
        </motion.h1>
        
        <motion.p variants={item} className="hero-subtitle">
          Automatically detect bugs, security vulnerabilities, performance issues, and maintainability concerns using a blend of traditional static analysis and cutting-edge Large Language Models.
        </motion.p>
        
        <motion.div variants={item} className="hero-cta-group">
          <Link to="/upload">
            <Button variant="primary">
              Start Review <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/upload">
            <Button variant="secondary">Upload File</Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section variants={container} className="features-grid">
        <motion.div variants={item} className="feature-card">
          <div className="feature-icon-wrapper blue">
            <Shield size={24} />
          </div>
          <h3 className="feature-title">Security Focus</h3>
          <p className="feature-desc">Detect vulnerabilities and security flaws before they make it to production.</p>
        </motion.div>
        <motion.div variants={item} className="feature-card">
          <div className="feature-icon-wrapper purple">
            <Sparkles size={24} />
          </div>
          <h3 className="feature-title">AI Suggestions</h3>
          <p className="feature-desc">Get intelligent code refactoring suggestions to improve readability and maintainability.</p>
        </motion.div>
        <motion.div variants={item} className="feature-card">
          <div className="feature-icon-wrapper green">
            <Code2 size={24} />
          </div>
          <h3 className="feature-title">Multi-Language</h3>
          <p className="feature-desc">Comprehensive support for JavaScript, TypeScript, Python, Go, Rust and more.</p>
        </motion.div>
        <motion.div variants={item} className="feature-card">
          <div className="feature-icon-wrapper orange">
            <FileText size={24} />
          </div>
          <h3 className="feature-title">Detailed Reports</h3>
          <p className="feature-desc">Export detailed analysis reports in PDF, Markdown, or HTML formats.</p>
        </motion.div>
      </motion.section>

      {/* About Section */}
      <motion.section variants={item} className="mt-20 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-6 text-gradient">About This Project</h2>
        <div className="bg-surface-color/50 border border-border-color rounded-2xl p-8 shadow-sm">
          <p className="text-text-muted text-lg leading-relaxed mb-6">
            AI Code Review was built to empower developers by providing instant, actionable feedback on code quality. By combining traditional linting rules with advanced Large Language Models, we are able to not only identify bugs and security vulnerabilities, but also offer deep, contextual refactoring advice that actually improves your software architecture.
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex flex-col items-center p-4 bg-bg-color rounded-lg border border-border-color">
              <span className="text-2xl font-bold text-primary-color mb-1">10k+</span>
              <span className="text-xs text-text-muted uppercase tracking-wider">Analyses Run</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-bg-color rounded-lg border border-border-color">
              <span className="text-2xl font-bold text-success-color mb-1">15+</span>
              <span className="text-xs text-text-muted uppercase tracking-wider">Languages</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-bg-color rounded-lg border border-border-color">
              <span className="text-2xl font-bold text-warning-color mb-1">99%</span>
              <span className="text-xs text-text-muted uppercase tracking-wider">Uptime</span>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
