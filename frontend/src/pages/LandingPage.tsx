import { Link } from 'react-router-dom';
import { Shield, Eye, Brain, Lock, Zap, ChevronRight, Cpu, Fingerprint, Scan, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import ParticleField from '../components/ParticleField';
import AnimatedCounter from '../components/AnimatedCounter';
import GlitchText from '../components/GlitchText';

/* ── Data ────────────────────────────────────────────────────── */
const features = [
  { icon: Eye, title: 'Visual Intelligence', desc: 'Real-time gaze tracking and face detection powered by advanced neural networks.' },
  { icon: Brain, title: 'Behavioral Analysis', desc: 'AI monitors keystroke patterns, mouse behavior, and browsing anomalies.' },
  { icon: Lock, title: 'Secure Environment', desc: 'Locked-down browser with tab-switch detection and screen capture prevention.' },
  { icon: Fingerprint, title: 'Identity Verification', desc: 'Biometric authentication ensures the right person takes the exam.' },
  { icon: Cpu, title: 'Edge Processing', desc: 'On-device ML inference for real-time analysis with zero latency.' },
  { icon: Scan, title: 'Anomaly Detection', desc: 'Multi-signal fusion detects suspicious patterns across all monitored channels.' },
];

const capabilities = [
  { title: 'Neuro-Sync Protocol', desc: 'Synchronizes proctoring signals across audio, video, and behavioral channels for unified integrity scoring.' },
  { title: 'Visual-Lock Engine', desc: 'Computer vision pipeline that tracks eye movement, head pose, and environmental context in real-time.' },
  { title: 'Adaptive Threshold AI', desc: 'Machine learning models that adapt sensitivity based on exam difficulty and historical patterns.' },
];

const stats = [
  { value: '99.7%', label: 'Detection Accuracy' },
  { value: '50ms', label: 'Response Latency' },
  { value: '10000+', label: 'Exams Proctored' },
  { value: '24/7', label: 'System Uptime' },
];

const marqueeItems = [
  'Neural Integrity', 'AI Proctoring', 'Real-Time Detection', 'Edge Computing',
  'Behavioral Analysis', 'Visual Lock', 'Anomaly Detection', 'Biometric Auth',
];

/* ── Animations ──────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative">
      <ParticleField />
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-36">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left – Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="relative z-10"
            >
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 badge-amber mb-8">
                <Zap className="w-3 h-3" />
                <span>Neural Integrity Systems v3.0</span>
              </motion.div>

              <motion.div variants={fadeUp} custom={1}>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
                    THE FUTURE OF
                  </span>
                  <br />
                  <GlitchText as="span" className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
                    EXAM INTEGRITY
                  </GlitchText>
                </h1>
              </motion.div>

              <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
                AI-powered proctoring that ensures academic honesty through real-time behavioral analysis,
                computer vision, and neural pattern recognition. No manual oversight needed.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
                <Link
                  to="/student/signup"
                  className="shimmer-btn cyber-button px-8 py-4 bg-white text-slate-950 font-black uppercase tracking-widest text-sm hover:bg-amber-400 transition-all shadow-2xl"
                >
                  Get Started
                </Link>
                <Link
                  to="/faculty/login"
                  className="group px-8 py-4 border border-white/10 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white/5 hover:border-amber-500/30 transition-all flex items-center gap-2"
                >
                  Faculty Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right – Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative hidden lg:block"
            >
              <div className="relative animate-float">
                <div className="image-reveal glow-amber rounded-2xl">
                  <img
                    src="/images/hero-ai-brain.png"
                    alt="AI Neural Network Visualization"
                    className="w-full h-auto rounded-2xl"
                  />
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -left-4 badge-amber animate-pulse-slow px-4 py-2 rounded-full glass text-xs font-bold">
                  🧠 Neural Active
                </div>
                <div className="absolute -bottom-4 -right-4 badge-green px-4 py-2 rounded-full glass text-xs font-bold animate-float-reverse">
                  ● 99.7% Accuracy
                </div>
              </div>
              {/* Glow background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            </motion.div>
          </div>
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
      </section>

      {/* ─── MARQUEE ──────────────────────────────────────────── */}
      <section className="border-y border-white/5 overflow-hidden py-4">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-8 mono text-[11px] font-bold text-slate-600 uppercase tracking-[0.3em] whitespace-nowrap flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────── */}
      <section className="border-b border-white/5 aurora-bg">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            {stats.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i} className="text-center">
                <AnimatedCounter value={stat.value} />
                <div className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES GRID ────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mono text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em]">
              Advanced Neural Modules
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Powered by Intelligence
              </span>
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i}
                className="glass-card tilt-3d rounded-2xl p-8 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/10 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─────────────────────────────────────── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="mono text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em]">
                Core Architecture
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-4 mb-8">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Neural Protocols
                </span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Our multi-layered architecture combines real-time sensor fusion with adaptive machine learning
                to deliver unmatched integrity monitoring.
              </p>

              <div className="space-y-4">
                {capabilities.map((cap, i) => (
                  <motion.div
                    key={cap.title}
                    className="glass-card rounded-xl p-6 animate-border-glow"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                  >
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-amber-500" />
                      {cap.title}
                    </h4>
                    <p className="text-sm text-slate-400 pl-6">{cap.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="glass-card rounded-2xl p-8 relative overflow-hidden glow-pulse">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[60px]" />
                <div className="relative z-10">
                  <div className="mono text-[10px] text-amber-500 font-bold mb-4 animate-flicker">// SYSTEM STATUS</div>
                  <div className="space-y-3 font-mono text-sm">
                    {[
                      { name: 'neural_sync', status: 'ACTIVE', color: 'text-emerald-400' },
                      { name: 'visual_lock', status: 'ACTIVE', color: 'text-emerald-400' },
                      { name: 'audio_pulse', status: 'ACTIVE', color: 'text-emerald-400' },
                      { name: 'edge_compute', status: 'ACTIVE', color: 'text-emerald-400' },
                      { name: 'anomaly_detect', status: 'LEARNING', color: 'text-amber-400' },
                    ].map((sys) => (
                      <div key={sys.name} className="flex justify-between text-slate-400">
                        <span>{sys.name}</span>
                        <span className={sys.color}>● {sys.status}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="mono text-[10px] text-slate-500">INTEGRITY SCORE</span>
                      <span className="text-2xl font-black text-emerald-400">98.7%</span>
                    </div>
                    <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: '98.7%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 border-t border-white/5 aurora-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
              <GlitchText as="span" className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
                JOIN THE NEURAL NETWORK
              </GlitchText>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
              Whether you're a student, educator, or institution — there's a place for you in the PROCTO ecosystem.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/student/signup"
                className="shimmer-btn cyber-button px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black uppercase tracking-widest text-sm shadow-2xl hover:shadow-amber-500/20 transition-all"
              >
                Student Access
              </Link>
              <Link
                to="/faculty/signup"
                className="group px-10 py-4 border border-white/10 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white/5 hover:border-orange-500/30 transition-all flex items-center gap-2"
              >
                Faculty Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
        {/* BG Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[200px] pointer-events-none" />
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-amber-500" />
                <span className="text-lg font-black tracking-tighter">PROCTO</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Neural Integrity Systems v3.0<br />
                Advanced AI-powered exam proctoring.
              </p>
            </div>
            <div>
              <h5 className="mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Protocols</h5>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="hover:text-amber-400 transition-colors cursor-pointer">Neuro-Sync</div>
                <div className="hover:text-amber-400 transition-colors cursor-pointer">Visual-Lock</div>
                <div className="hover:text-amber-400 transition-colors cursor-pointer">Audio-Pulse</div>
                <div className="hover:text-amber-400 transition-colors cursor-pointer">Edge-Hash</div>
              </div>
            </div>
            <div>
              <h5 className="mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Support</h5>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="hover:text-amber-400 transition-colors cursor-pointer">Documentation</div>
                <div className="hover:text-amber-400 transition-colors cursor-pointer">System Status</div>
                <div className="hover:text-amber-400 transition-colors cursor-pointer">Privacy Policy</div>
                <div className="hover:text-amber-400 transition-colors cursor-pointer">Terms of Service</div>
              </div>
            </div>
            <div>
              <h5 className="mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Connect</h5>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="hover:text-amber-400 transition-colors cursor-pointer">GitHub</div>
                <div className="hover:text-amber-400 transition-colors cursor-pointer">Discord</div>
                <div className="hover:text-amber-400 transition-colors cursor-pointer">LinkedIn</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="mono text-[10px] text-slate-600">© 2026 PROCTO. All rights reserved.</span>
            <div className="flex gap-6 mono text-[10px] text-slate-600">
              <span className="hover:text-amber-400 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-amber-400 transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      <div className="scanline-overlay" />
    </div>
  );
}
