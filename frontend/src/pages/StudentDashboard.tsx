import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { BookOpen, Clock, Award, Plus, X, Loader2, ChevronRight, AlertTriangle, Monitor, Mic, Sun } from 'lucide-react';
import Navbar from '../components/Navbar';

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
  };
}

interface Exam {
  id: string;
  title: string;
  courseId: string;
  durationMinutes: number;
  startAt: string;
  endAt: string;
  course: {
    name: string;
    code: string;
  };
  _count: {
    examQuestions: number;
  };
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/student/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      const courses = response.data.courses;
      setEnrolledCourses(courses);

      const examPromises = courses.map((course: Course) =>
        api.get(`/exams?courseId=${course.id}`).catch(() => ({ data: { exams: [] } }))
      );

      const examResponses = await Promise.all(examPromises);
      const allExams = examResponses.flatMap((res, idx) =>
        res.data.exams.map((exam: any) => ({
          ...exam,
          course: {
            name: courses[idx].name,
            code: courses[idx].code,
          },
        }))
      );

      const now = new Date();
      const upcoming = allExams.filter((exam: Exam) => new Date(exam.endAt) > now);
      setUpcomingExams(upcoming);
    } catch (error) {
      console.error('Fetch courses error:', error);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/courses/enroll', { courseCode });
      setShowEnrollModal(false);
      setCourseCode('');
      fetchCourses();
    } catch (error: any) {
      console.error('Enrollment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const start = new Date(exam.startAt);
    const end = new Date(exam.endAt);

    if (now < start) return { status: 'UPCOMING', badge: 'badge-blue', canTake: false };
    if (now >= start && now <= end) return { status: 'ACTIVE', badge: 'badge-green', canTake: true };
    return { status: 'ENDED', badge: 'badge-slate', canTake: false };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Student Portal
            </span>
          </h1>
          <p className="text-slate-500">Manage your assessments and track performance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enrolled Courses</div>
                <div className="text-3xl font-black text-white">{enrolledCourses.length}</div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upcoming Exams</div>
                <div className="text-3xl font-black text-white">{upcomingExams.length}</div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <div className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed</div>
                <div className="text-3xl font-black text-white">0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Exams */}
        {upcomingExams.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="mono text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em]">Active & Upcoming Exams</span>
            </div>
            <div className="space-y-4">
              {upcomingExams.map((exam) => {
                const examStatus = getExamStatus(exam);
                return (
                  <div key={exam.id} className="glass-card rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-white">{exam.title}</h4>
                          <span className={examStatus.badge}>{examStatus.status}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">
                          {exam.course.name} ({exam.course.code})
                        </p>
                        <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{exam.durationMinutes} min</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Questions:</span> {exam._count.examQuestions}
                          </div>
                          <div>
                            <span className="text-slate-600">Start:</span> {new Date(exam.startAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {examStatus.canTake ? (
                        <button
                          onClick={() => navigate(`/take-exam/${exam.id}`)}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
                        >
                          Start Exam <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-6 py-3 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed uppercase tracking-widest"
                        >
                          {examStatus.status === 'UPCOMING' ? 'Not Yet Available' : 'Exam Ended'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Exam Rules */}
        <div className="mb-10">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-white font-bold">Exam Rules</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: Monitor, text: 'Webcam and microphone must be enabled throughout the session.' },
                { icon: Mic, text: 'Full-screen mode is mandatory. Tab switching will flag a violation.' },
                { icon: Sun, text: 'Ensure a well-lit environment with no other persons present.' },
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-400">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-amber-500">{i + 1}</span>
                  </div>
                  <span>{rule.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="mono text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em]">My Courses</span>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Join Course
          </button>
        </div>

        {/* Courses Grid */}
        {enrolledCourses.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-6">Ask your instructor for a course code to join</p>
            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all"
            >
              Join Course
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="glass-card rounded-2xl p-6 group">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-white mb-2">{course.name}</h4>
                  <span className="mono text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {course.code}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-2">
                  {course.faculty.firstName} {course.faculty.lastName}
                </p>
                {course.description && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                )}
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs text-slate-500">{course._count.enrollments} students</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Join Course Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Join Course</h3>
              <button
                onClick={() => { setShowEnrollModal(false); setCourseCode(''); }}
                className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEnroll} className="space-y-5">
              <div>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Course Code
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  className="input-dark font-mono text-lg text-center tracking-wider"
                  placeholder="e.g., ABC-DEFG-HIJ"
                  maxLength={20}
                  required
                />
                <p className="text-xs text-slate-600 mt-2">Ask your instructor for the course code</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEnrollModal(false); setCourseCode(''); }}
                  className="flex-1 px-4 py-3 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !courseCode}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
