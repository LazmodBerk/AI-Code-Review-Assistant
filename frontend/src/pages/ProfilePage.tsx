import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { User, Mail, Shield, Key, Save, Camera } from 'lucide-react';
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

export default function ProfilePage() {
  const [name, setName] = useState('Developer');
  const [email, setEmail] = useState('dev@aicode.review');
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load from local storage
    const savedName = localStorage.getItem('profile_name');
    const savedEmail = localStorage.getItem('profile_email');
    const savedAvatar = localStorage.getItem('profile_avatar');
    
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
    if (savedAvatar) setAvatar(savedAvatar);
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem('profile_name', name);
    localStorage.setItem('profile_email', email);
    toast.success('Account details saved successfully!');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image is too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        localStorage.setItem('profile_avatar', base64String);
        toast.success('Avatar updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const showComingSoon = (feature: string) => {
    toast.success(`${feature} functionality coming soon!`);
  };

  return (
    <motion.div 
      className="py-8 max-w-4xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h1 variants={item} className="text-3xl font-bold text-gradient mb-8">User Profile</motion.h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* AVATAR SECTION */}
        <motion.div variants={item} className="md:col-span-1">
          <Card className="text-center p-6 flex flex-col items-center bg-surface-color/50">
            <div className="relative w-32 h-32 mb-4 group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-full h-full bg-surface-color border-2 border-border-color rounded-full flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-color">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-text-muted group-hover:text-primary-color transition-colors" />
                )}
              </div>
              {!avatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <h2 className="text-xl font-bold text-text-primary mb-1">{name}</h2>
            <p className="text-text-muted text-sm mb-4">Pro Plan</p>
            <Button variant="outline" className="w-full" onClick={handleAvatarClick}>Edit Avatar</Button>
          </Card>
        </motion.div>
        
        <div className="md:col-span-2 space-y-6">
          {/* ACCOUNT DETAILS */}
          <motion.div variants={item}>
            <Card className="p-6 bg-surface-color/50 hover:bg-surface-color transition-colors">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Mail size={20} className="text-primary-color" /> Account Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="input w-full" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="input w-full" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <Button variant="primary" onClick={handleSaveProfile}>
                    <Save className="w-4 h-4 mr-2" /> Save Profile
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="p-6 bg-surface-color/50 hover:bg-surface-color transition-colors">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Shield size={20} className="text-primary-color" /> Security
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border-color">
                  <div>
                    <h4 className="font-medium text-text-primary">Password</h4>
                    <p className="text-sm text-text-muted">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline" onClick={() => showComingSoon('Password update')}>Update</Button>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <h4 className="font-medium text-text-primary flex items-center gap-2">
                      Two-Factor Authentication <Badge variant="success">Enabled</Badge>
                    </h4>
                    <p className="text-sm text-text-muted">Protect your account with 2FA</p>
                  </div>
                  <Button variant="outline" onClick={() => showComingSoon('2FA configuration')}>Configure</Button>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="p-6 bg-surface-color/50 hover:bg-surface-color transition-colors">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Key size={20} className="text-primary-color" /> API Keys
              </h3>
              <p className="text-sm text-text-muted mb-4">Use API keys to authenticate requests from your CI/CD pipelines.</p>
              <Button variant="primary" onClick={() => toast.success('New API key generated: ak_test_12345')}>Generate New Key</Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
