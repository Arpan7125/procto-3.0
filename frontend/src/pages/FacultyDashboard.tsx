import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { BookOpen, Users, FileText, Plus, X, Loader2, Copy, Check, ChevronRight, LayoutDashboard } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

interface Course {
  id: string;
  name: string;
  code: string;
  description: string | null;
  faculty: {
    firstName: string;
    lastName: string;
  };
  _count: {
    enrollments: number;
    exams: number;
  };
}

export default function FacultyDashboard() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/faculty/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Fetch courses error:', error);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/courses', formData);
      toast.success(`Course created! Code: ${response.data.course.code}`);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      fetchCourses();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create course';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Course code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
  const totalExams = courses.reduce((sum, c) => sum + c._count.exams, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' }
      }} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-black tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Command Center
              </span>
            </h1>
          </div>
          <p className="text-slate-500">Manage courses, exams, and question banks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Courses</div>
                <div className="text-3xl font-black text-white">{courses.length}</div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Students</div>
                <div className="text-3xl font-black text-white">{totalStudents}</div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <div className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Exams</div>
                <div className="text-3xl font-black text-white">{totalExams}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="mono text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em]">My Courses</span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Course
          </button>
        </div>

        {/* Courses */}
        {courses.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-6">Create your first course to get started with exams</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="glass-card rounded-2xl p-6 group hover:border-orange-500/30 transition-all">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-white mb-3">{course.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="mono text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                      {course.code}
                    </span>
                    <button
                      onClick={() => copyCode(course.code)}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-orange-500 transition-all"
                      title="Copy course code"
                    >
                      {copiedCode === course.code ?
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> :
                        <Copy className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>

                {course.description && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                )}

                <div className="flex justify-between items-center py-4 border-t border-b border-white/5 my-4">
                  <div className="text-sm">
                    <span className="font-bold text-orange-500">{course._count.enrollments}</span>
                    <span className="text-slate-500 ml-1">students</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-emerald-500">{course._count.exams}</span>
                    <span className="text-slate-500 ml-1">exams</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/questions?courseId=${course.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-orange-500/10 text-slate-300 hover:text-orange-500 rounded-xl transition-all text-xs font-bold border border-white/5 hover:border-orange-500/20"
                  >
                    Questions <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => navigate(`/exams?courseId=${course.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-500 rounded-xl transition-all text-xs font-bold border border-white/5 hover:border-emerald-500/20"
                  >
                    Exams <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Create New Course</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-5">
              <div>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-dark"
                  placeholder="e.g., Introduction to CS"
                  required
                />
              </div>

              <div>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-dark resize-none"
                  placeholder="Brief description of the course..."
                  rows={3}
                />
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <p className="text-sm text-orange-400">
                  A unique course code will be generated automatically for students to join.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
