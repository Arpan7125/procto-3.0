import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setIsScrolled(scrollTop > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      />

      <nav className={`sticky top-0 z-50 glass border-b border-white/5 px-6 py-4 transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-black/20' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-white/10 group-hover:border-amber-500/50 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all duration-300 shadow-2xl">
                <Shield className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none rounded-xl" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  PROCTO
                </span>
                <span className="mono text-[8px] font-bold text-amber-500 uppercase tracking-[0.3em] leading-none">
                  Neural Systems
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link to="/" className="hover:text-amber-400 transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-500 group-hover:w-full transition-all duration-300" />
            </Link>
            {user && (
              <Link
                to={user.role === 'STUDENT' ? '/student' : user.role === 'FACULTY' ? '/faculty' : '/admin'}
                className="hover:text-amber-400 transition-colors relative group"
              >
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-500 group-hover:w-full transition-all duration-300" />
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-white">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="mono text-[8px] text-amber-500 font-bold uppercase tracking-tighter">
                    {user.role}
                  </span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <button
                  onClick={handleLogout}
                  className="p-2.5 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                    Access
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 glass rounded-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2">
                    <Link to="/student/login" className="block px-4 py-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-400 transition-colors">
                      Student Login
                    </Link>
                    <Link to="/faculty/login" className="block px-4 py-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-400 transition-colors">
                      Faculty Login
                    </Link>
                  </div>
                </div>
                <div className="relative group">
                  <button className="shimmer-btn cyber-button px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-white text-slate-950 hover:bg-amber-400 transition-all shadow-xl">
                    Join System
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 glass rounded-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2">
                    <Link to="/student/signup" className="block px-4 py-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-400 transition-colors">
                      Student Signup
                    </Link>
                    <Link to="/faculty/signup" className="block px-4 py-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-400 transition-colors">
                      Faculty Signup
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden mt-4 pt-4 border-t border-white/5 space-y-1 overflow-hidden"
            >
              <Link to="/" className="block px-4 py-3 text-sm text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-all">Home</Link>
              {user ? (
                <>
                  <Link
                    to={user.role === 'STUDENT' ? '/student' : user.role === 'FACULTY' ? '/faculty' : '/admin'}
                    className="block px-4 py-3 text-sm text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-all"
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/student/login" className="block px-4 py-3 text-sm text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-all">Student Login</Link>
                  <Link to="/faculty/login" className="block px-4 py-3 text-sm text-slate-400 hover:text-orange-400 hover:bg-white/5 rounded-xl transition-all">Faculty Login</Link>
                  <Link to="/student/signup" className="block px-4 py-3 text-sm text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all">Student Signup</Link>
                  <Link to="/faculty/signup" className="block px-4 py-3 text-sm text-orange-400 hover:bg-orange-500/10 rounded-xl transition-all">Faculty Signup</Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
