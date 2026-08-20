import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, BadgeCheck, Braces, Check, CheckCircle2, ChevronRight,
  CircleDot, Clock3, Code2, FileCode2, FileOutput, Gauge, Github,
  GitPullRequestArrow, Layers3, LockKeyhole, ScanSearch, ShieldCheck, Sparkles,
  TerminalSquare, WandSparkles, Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const previewIssues = {
  security: {
    score: 92, label: 'Security', color: '#22c55e', issues: [
      { severity: 'High', file: 'auth/session.py', line: 42, title: 'Unvalidated redirect target', status: 'Fix ready' },
      { severity: 'Medium', file: 'api/users.ts', line: 118, title: 'Missing rate limit guard', status: 'Review' },
      { severity: 'Low', file: 'config/env.py', line: 17, title: 'Permissive development fallback', status: 'Open' },
    ],
  },
  quality: {
    score: 86, label: 'Maintainability', color: '#8b5cf6', issues: [
      { severity: 'Medium', file: 'services/analyzer.py', line: 204, title: 'Function exceeds complexity threshold', status: 'Fix ready' },
      { severity: 'Medium', file: 'components/Report.tsx', line: 76, title: 'Repeated rendering branch', status: 'Review' },
      { severity: 'Low', file: 'utils/format.ts', line: 31, title: 'Magic value should be named', status: 'Open' },
    ],
  },
  performance: {
    score: 89, label: 'Performance', color: '#38bdf8', issues: [
      { severity: 'High', file: 'db/repository.py', line: 93, title: 'N+1 query inside result loop', status: 'Fix ready' },
      { severity: 'Medium', file: 'hooks/useReport.ts', line: 51, title: 'Unnecessary request on every render', status: 'Review' },
      { severity: 'Low', file: 'charts/Trend.tsx', line: 64, title: 'Large data transform on main thread', status: 'Open' },
    ],
  },
};

type PreviewTab = keyof typeof previewIssues;

export default function HomePage() {
  const [previewTab, setPreviewTab] = useState<PreviewTab>('security');
  const preview = previewIssues[previewTab];

  return (
    <motion.div className="home-page" variants={container} initial="hidden" animate="show">
      <section className="home-hero">
        <div className="home-hero-grid" aria-hidden="true" />
        <div className="home-hero-orb home-hero-orb-one" aria-hidden="true" />
        <div className="home-hero-orb home-hero-orb-two" aria-hidden="true" />

        <motion.div variants={item} className="home-hero-copy">
          <div className="hero-badge"><Sparkles size={15} /><span>Static analysis meets contextual AI</span></div>
          <h1>Ship code you can <span>stand behind.</span></h1>
          <p>Review repositories, catch security risks and turn complex findings into clear fixes—before they reach production.</p>
          <div className="hero-cta-group">
            <Link to="/upload"><Button variant="primary">Analyze your code <ArrowRight size={18} /></Button></Link>
            <Link to="/reports"><Button variant="secondary"><Activity size={17} /> Explore reports</Button></Link>
          </div>
          <div className="hero-trust-row">
            <span><Check size={15} /> No credit card</span><span><Check size={15} /> Local AI supported</span><span><Check size={15} /> Export anytime</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="hero-product-card">
          <div className="product-card-topbar">
            <span className="window-dots"><i /><i /><i /></span>
            <span className="product-repo"><Github size={14} /> acme/checkout-api</span>
            <span className="scan-live"><i /> Analysis complete</span>
          </div>
          <div className="product-score-row">
            <div className="product-score-ring"><span>91</span><small>Overall</small></div>
            <div className="product-score-copy">
              <span className="result-label"><BadgeCheck size={15} /> Production ready</span>
              <h3>Strong foundation, three fixes recommended.</h3>
              <p>128 files · 24,806 lines · 6 languages</p>
            </div>
          </div>
          <div className="product-metrics">
            <div><span><ShieldCheck size={16} /> Security</span><strong>92</strong><i><b style={{ width: '92%' }} /></i></div>
            <div><span><Gauge size={16} /> Performance</span><strong>89</strong><i><b style={{ width: '89%' }} /></i></div>
            <div><span><Layers3 size={16} /> Architecture</span><strong>94</strong><i><b style={{ width: '94%' }} /></i></div>
          </div>
          <div className="product-finding">
            <span className="finding-icon"><LockKeyhole size={17} /></span>
            <span><strong>Potential open redirect</strong><small>auth/session.py · line 42</small></span>
            <span className="finding-fix"><WandSparkles size={14} /> Fix ready</span>
          </div>
          <div className="product-terminal"><span><TerminalSquare size={15} /> AI reviewer</span><p>Validate <code>next_url</code> against an allowlist before redirecting the user.</p></div>
        </motion.div>
      </section>

      <motion.section variants={item} className="signal-strip" aria-label="Platform capabilities">
        <span>BUILT FOR MODERN TEAMS</span><div><ShieldCheck size={18} /> Security-first</div><div><Braces size={18} /> 15+ languages</div><div><Zap size={18} /> Real-time feedback</div><div><FileOutput size={18} /> PDF · MD · HTML</div>
      </motion.section>

      <section className="home-section" id="capabilities">
        <motion.div variants={item} className="section-heading">
          <span className="eyebrow">ONE REVIEW, THE COMPLETE PICTURE</span>
          <h2>See what linters miss.<br />Understand what matters.</h2>
          <p>Combine deterministic analysis with AI context so every finding arrives ranked, explained and ready to act on.</p>
        </motion.div>
        <motion.div variants={container} className="capability-grid">
          <motion.article variants={item} className="capability-card capability-card-featured">
            <span className="capability-icon"><ScanSearch size={22} /></span>
            <div><span className="card-kicker">DEEP ANALYSIS</span><h3>One scan across seven quality dimensions.</h3></div>
            <p>Measure security, performance, maintainability, readability, architecture, complexity and overall health together.</p>
            <div className="dimension-cloud">
              {['Security', 'Performance', 'Maintainability', 'Readability', 'Architecture', 'Complexity'].map((label, index) => (
                <span key={label} style={{ '--score': `${96 - index * 3}%` } as React.CSSProperties}><i />{label}<b>{96 - index * 3}</b></span>
              ))}
            </div>
          </motion.article>
          <motion.article variants={item} className="capability-card">
            <span className="capability-icon violet"><WandSparkles size={22} /></span><span className="card-kicker">AI REMEDIATION</span>
            <h3>Go from warning to working fix.</h3><p>Receive contextual refactoring guidance with the file, line and reason attached.</p>
            <div className="mini-code-block"><span>- return redirect(next_url)</span><strong>+ return redirect(safe_url)</strong></div>
          </motion.article>
          <motion.article variants={item} className="capability-card">
            <span className="capability-icon cyan"><GitPullRequestArrow size={22} /></span><span className="card-kicker">FLEXIBLE INPUT</span>
            <h3>Review however you work.</h3><p>Paste a GitHub URL, upload a project or write directly inside the Monaco-powered editor.</p>
            <div className="input-methods"><span><Github size={17} /> Repository</span><span><FileCode2 size={17} /> Files</span><span><Code2 size={17} /> Editor</span></div>
          </motion.article>
        </motion.div>
      </section>

      <section className="home-section product-preview-section">
        <motion.div variants={item} className="section-heading section-heading-split">
          <div><span className="eyebrow">ACTIONABLE BY DESIGN</span><h2>Priorities your team<br />can agree on.</h2></div>
          <p>Filter findings by the outcome you care about. Every issue includes severity, location and a concrete next step.</p>
        </motion.div>
        <motion.div variants={item} className="analysis-preview">
          <div className="preview-sidebar">
            <div className="preview-sidebar-title"><CircleDot size={17} /><span>Analysis overview<small>checkout-api / main</small></span></div>
            {(Object.keys(previewIssues) as PreviewTab[]).map((tab) => {
              const data = previewIssues[tab];
              return <button key={tab} className={previewTab === tab ? 'active' : ''} onClick={() => setPreviewTab(tab)} type="button"><span>{tab === 'security' ? <ShieldCheck size={17} /> : tab === 'quality' ? <Layers3 size={17} /> : <Gauge size={17} />}{data.label}</span><b>{data.score}</b></button>;
            })}
            <div className="preview-sidebar-note"><Sparkles size={16} /><span><strong>AI summary ready</strong><small>3 prioritized recommendations</small></span></div>
          </div>
          <div className="preview-content">
            <div className="preview-content-header">
              <div><span className="preview-score-dot" style={{ background: preview.color }} /> <strong>{preview.label}</strong><small>3 findings require attention</small></div>
              <span className="preview-score" style={{ color: preview.color }}>{preview.score}<small>/100</small></span>
            </div>
            <div className="preview-table-head"><span>Finding</span><span>Severity</span><span>Status</span></div>
            {preview.issues.map((issue) => (
              <div className="preview-table-row" key={issue.file}><span><strong>{issue.title}</strong><small>{issue.file} · line {issue.line}</small></span><span className={`severity-pill ${issue.severity.toLowerCase()}`}>{issue.severity}</span><span className="issue-status">{issue.status}<ChevronRight size={15} /></span></div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="home-section workflow-section">
        <motion.div variants={item} className="section-heading centered"><span className="eyebrow">FROM REPOSITORY TO ROADMAP</span><h2>A review flow that stays out of your way.</h2></motion.div>
        <motion.div variants={container} className="workflow-grid">
          {[
            { step: '01', icon: Github, title: 'Connect or upload', copy: 'Add a GitHub repository, project archive or a focused code snippet.' },
            { step: '02', icon: ScanSearch, title: 'Analyze in depth', copy: 'Static analyzers and your selected AI provider inspect the code together.' },
            { step: '03', icon: CheckCircle2, title: 'Fix with confidence', copy: 'Prioritize findings, apply suggestions and export a shareable report.' },
          ].map(({ step, icon: Icon, title, copy }) => <motion.article variants={item} key={step}><span className="workflow-step">{step}</span><span className="workflow-icon"><Icon size={22} /></span><h3>{title}</h3><p>{copy}</p></motion.article>)}
        </motion.div>
      </section>

      <motion.section variants={item} className="home-cta">
        <div className="cta-grid" aria-hidden="true" />
        <div><span className="eyebrow">YOUR NEXT REVIEW STARTS HERE</span><h2>Turn code quality into<br />a repeatable advantage.</h2><p>Run your first repository analysis and get a prioritized engineering roadmap in minutes.</p></div>
        <div className="cta-actions"><Link to="/upload"><Button variant="primary">Start analyzing <ArrowRight size={18} /></Button></Link><span><Clock3 size={15} /> Setup takes less than a minute</span></div>
      </motion.section>

      <footer className="home-footer">
        <div><span className="footer-mark"><img src="/logo.jpg" alt="" /></span><span><strong>CodeLens</strong><small>AI Code Review Assistant</small></span></div>
        <p>Static analysis clarity. AI-powered context.</p>
        <nav aria-label="Footer navigation"><Link to="/upload">New analysis</Link><Link to="/reports">Reports</Link><Link to="/pricing">Pricing</Link><Link to="/settings">Settings</Link></nav>
      </footer>
    </motion.div>
  );
}
