import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import OAuthButtons from '../components/OAuthButtons';

export default function StudentSignup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
      const { data } = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        role: 'STUDENT',
      });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/student');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[150px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              PROCTO
            </span>
          </Link>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Create Neural ID</h2>
          <p className="text-sm text-slate-500">Register as a student to access the exam system</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-dark"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-dark"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
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
            </div>

            <div>
              <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Access Key
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pr-12"
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black uppercase tracking-widest text-sm rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Neural ID'}
            </button>
          </form>

          <div className="mt-6">
            <OAuthButtons role="STUDENT" />
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 text-center space-y-3">
            <p className="text-sm text-slate-500">
              Already registered?{' '}
              <Link to="/student/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                Login
              </Link>
            </p>
            <p className="text-sm text-slate-500">
              Faculty member?{' '}
              <Link to="/faculty/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                Faculty Registration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
