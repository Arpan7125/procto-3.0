import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Shield, Users, BookOpen, FileText, Loader2, AlertTriangle, Activity, Database } from 'lucide-react';
import Navbar from '../components/Navbar';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  faculty: {
    firstName: string;
    lastName: string;
  };
  _count: {
    enrollments: number;
    exams: number;
  };
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/student/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, coursesRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: { users: [] } })),
        api.get('/courses').catch(() => ({ data: { courses: [] } })),
      ]);
      setUsers(usersRes.data.users || []);
      setCourses(coursesRes.data.courses || []);
    } catch (error) {
      console.error('Admin fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const studentCount = users.filter((u) => u.role === 'STUDENT').length;
  const facultyCount = users.filter((u) => u.role === 'FACULTY').length;


  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl font-black tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Admin Panel
              </span>
            </h1>
          </div>
          <p className="text-slate-500">System-wide management and monitoring</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { icon: Users, label: 'Total Users', value: users.length, color: 'red' },
            { icon: BookOpen, label: 'Students', value: studentCount, color: 'amber' },
            { icon: Activity, label: 'Faculty', value: facultyCount, color: 'emerald' },
            { icon: Database, label: 'Courses', value: courses.length, color: 'violet' },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                </div>
                <div>
                  <div className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                  <div className="text-3xl font-black text-white">{loading ? '...' : stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Alerts */}
        <div className="mb-10">
          <div className="glass-card rounded-2xl p-6 border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-white font-bold">System Status</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="text-emerald-500 font-bold text-sm mb-1">Database</div>
                <div className="text-slate-400 text-xs">All systems operational</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="text-emerald-500 font-bold text-sm mb-1">API Server</div>
                <div className="text-slate-400 text-xs">Responding normally</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="text-emerald-500 font-bold text-sm mb-1">Proctoring</div>
                <div className="text-slate-400 text-xs">Active monitoring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="mb-10">
          <span className="mono text-[10px] font-bold text-red-500 uppercase tracking-[0.3em] mb-6 block">Recent Users</span>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-6 text-[10px] uppercase tracking-wider text-slate-500 font-bold mono">User</th>
                    <th className="text-left py-3 px-6 text-[10px] uppercase tracking-wider text-slate-500 font-bold mono">Email</th>
                    <th className="text-left py-3 px-6 text-[10px] uppercase tracking-wider text-slate-500 font-bold mono">Role</th>
                    <th className="text-left py-3 px-6 text-[10px] uppercase tracking-wider text-slate-500 font-bold mono">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500">No users found</td>
                    </tr>
                  ) : (
                    users.slice(0, 10).map((u) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                        <td className="py-3 px-6 text-sm font-medium text-white">{u.firstName} {u.lastName}</td>
                        <td className="py-3 px-6 text-sm text-slate-400">{u.email}</td>
                        <td className="py-3 px-6">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg ${
                            u.role === 'ADMIN'
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : u.role === 'FACULTY'
                              ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>{u.role}</span>
                        </td>
                        <td className="py-3 px-6 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Courses Overview */}
        <div>
          <span className="mono text-[10px] font-bold text-red-500 uppercase tracking-[0.3em] mb-6 block">All Courses</span>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <Loader2 className="w-6 h-6 text-slate-500 animate-spin mx-auto" />
              </div>
            ) : courses.length === 0 ? (
              <div className="col-span-full glass-card rounded-2xl p-8 text-center">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">No courses created yet</p>
              </div>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="glass-card rounded-2xl p-6">
                  <h4 className="text-base font-bold text-white mb-2">{course.name}</h4>
                  <span className="mono text-[10px] text-red-500 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                    {course.code}
                  </span>
                  <p className="text-sm text-slate-500 mt-3">
                    {course.faculty.firstName} {course.faculty.lastName}
                  </p>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-slate-400">
                    <span><strong className="text-white">{course._count.enrollments}</strong> students</span>
                    <span><strong className="text-white">{course._count.exams}</strong> exams</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
