import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

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

export default function PricingPage() {
  const handleSubscribe = (plan: string) => {
    toast.success(`Redirecting to ${plan} checkout...`);
  };

  return (
    <motion.div 
      className="py-12 max-w-5xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="text-center mb-20">
        <h1 className="text-4xl font-bold text-gradient mb-4">Simple, Transparent Pricing</h1>
        <p className="text-text-muted text-lg">Choose the perfect plan for your AI Code Review needs.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        <motion.div variants={item} className="h-full">
          <Card className="flex flex-col p-8 h-full bg-surface-color/50 hover:bg-surface-color transition-colors">
            <h3 className="text-xl font-bold text-text-primary mb-2">Basic</h3>
            <p className="text-text-muted mb-6">For individual developers.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-text-primary">$0</span>
              <span className="text-text-muted">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-text-primary"><CheckCircle2 className="text-success-color w-5 h-5" /> 50 Analyses / month</li>
              <li className="flex items-center gap-3 text-text-primary"><CheckCircle2 className="text-success-color w-5 h-5" /> Basic AI suggestions</li>
              <li className="flex items-center gap-3 text-text-primary"><CheckCircle2 className="text-success-color w-5 h-5" /> Community Support</li>
            </ul>
            <Button variant="outline" className="w-full" onClick={() => handleSubscribe('Basic')}>Get Started</Button>
          </Card>
        </motion.div>

        <motion.div variants={item} className="h-full">
          <Card className="flex flex-col p-8 border-2 border-primary-color relative shadow-glow h-full bg-surface-color/80">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-color text-white px-4 py-1 rounded-full text-sm font-bold shadow-glow" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2 text-gradient">Pro</h3>
            <p className="text-text-muted mb-6">For professional software engineers.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-text-primary">$19</span>
              <span className="text-text-muted">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-text-primary"><CheckCircle2 className="text-primary-color w-5 h-5" /> Unlimited Analyses</li>
              <li className="flex items-center gap-3 text-text-primary"><CheckCircle2 className="text-primary-color w-5 h-5" /> Advanced AI Refactoring</li>
              <li className="flex items-center gap-3 text-text-primary"><CheckCircle2 className="text-primary-color w-5 h-5" /> Priority Support</li>
              <li className="flex items-center gap-3 text-text-primary"><CheckCircle2 className="text-primary-color w-5 h-5" /> Custom Rulesets</li>
            </ul>
            <Button variant="primary" className="w-full" onClick={() => handleSubscribe('Pro')}>Upgrade to Pro</Button>
          </Card>
        </motion.div>

        <motion.div variants={item} className="h-full">
          <Card className="flex flex-col p-8 h-full bg-surface-color/50 hover:bg-surface-color transition-colors">
            <h3 className="text-xl font-bold text-text-primary mb-2">Enterprise</h3>
            <p className="text-text-muted mb-6">For large teams and organizations.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-text-primary">$99</span>
              <span className="text-text-muted">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-text-primary"><CheckCircle2 className="text-success-color w-5 h-5" /> Everything in Pro</li>
              <li className="flex items-center gap-3 text-text-primary"><CheckCircle2 className="text-success-color w-5 h-5" /> SSO Integration</li>
              <li className="flex items-center gap-3 text-text-primary"><CheckCircle2 className="text-success-color w-5 h-5" /> Dedicated Account Manager</li>
              <li className="flex items-center gap-3 text-text-primary"><CheckCircle2 className="text-success-color w-5 h-5" /> On-Premise Deployment</li>
            </ul>
            <Button variant="outline" className="w-full" onClick={() => toast.success("Opening contact form...")}>Contact Sales</Button>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
