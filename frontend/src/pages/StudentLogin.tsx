import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2, Zap, Brain, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import OAuthButtons from '../components/OAuthButtons';
import ParticleField from '../components/ParticleField';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const floatingBadges = [
  { icon: Zap, text: 'AI Proctoring', delay: 0 },
  { icon: Brain, text: 'Neural Sync', delay: 0.5 },
  { icon: Lock, text: 'Secure Exam', delay: 1 },
];

export default function StudentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'STUDENT') {
        navigate('/student');
      } else if (data.user.role === 'FACULTY') {
        navigate('/faculty');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-screen bg-slate-950 relative overflow-hidden">
      {/* Left – Visual Panel */}
      <div className="split-visual relative bg-slate-950">
        <ParticleField />
        <img
          src="/images/student-access.png"
          alt="Student with AI holographic interface"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        {/* Overlay content */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/40 to-amber-900/20 z-10" />
        <div className="relative z-20 p-12 flex flex-col justify-end h-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl font-black tracking-tighter text-white mb-4">
              Neural<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                Access Point
              </span>
            </h2>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
              Initialize your secure proctoring session with AI-powered identity verification and real-time monitoring.
            </p>
          </motion.div>

          {/* Floating badges */}
          <div className="flex flex-wrap gap-3">
            {floatingBadges.map((badge, i) => (
              <motion.div
                key={badge.text}
                className="glass px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-amber-400"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.4 }}
              >
                <badge.icon className="w-3 h-3" />
                {badge.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right – Form Panel */}
      <div className="flex items-center justify-center px-6 py-12 relative">
        {/* Background orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[150px]" />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.div variants={fadeUp} custom={0} className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center glow-amber">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                PROCTO
              </span>
            </Link>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Student Access</h2>
            <p className="text-sm text-slate-500">Initialize your neural integrity session</p>
          </motion.div>

          {/* Form Card */}
          <motion.div variants={fadeUp} custom={1} className="glass-card rounded-2xl p-8">
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={fadeUp} custom={2}>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Neural ID (Email)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark"
                  placeholder="student@university.edu"
                  required
                />
              </motion.div>

              <motion.div variants={fadeUp} custom={3}>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Access Key
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-dark pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} custom={4}>
                <button
                  type="submit"
                  disabled={loading}
                  className="shimmer-btn w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black uppercase tracking-widest text-sm rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Authenticating...' : 'Initialize Session'}
                </button>
              </motion.div>
            </form>

            <motion.div variants={fadeUp} custom={5} className="mt-6">
              <OAuthButtons role="STUDENT" />
            </motion.div>

            <motion.div variants={fadeUp} custom={6} className="mt-6 pt-6 border-t border-white/5 text-center space-y-3">
              <p className="text-sm text-slate-500">
                New to the protocol?{' '}
                <Link to="/student/signup" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                  Create Neural ID
                </Link>
              </p>
              <p className="text-sm text-slate-500">
                Faculty member?{' '}
                <Link to="/faculty/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                  Faculty Portal
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
