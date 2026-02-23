import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Question {
  id: string;
  orderIndex: number;
  question: {
    id: string;
    type: string;
    content: any;
    points: number;
  };
}

interface Exam {
  id: string;
  title: string;
  instructions: string | null;
  durationMinutes: number;
  startAt: string;
  endAt: string;
  course: { name: string };
  examQuestions: Question[];
}

export default function TakeExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!examId) return;
    loadExamAndStartSession();
  }, [examId]);

  useEffect(() => {
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) { handleAutoSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  useEffect(() => {
    if (!sessionId) return;
    const autoSave = setInterval(() => { saveAnswers(); }, 30000);
    return () => clearInterval(autoSave);
  }, [sessionId, answers]);

  const loadExamAndStartSession = async () => {
    try {
      const examResponse = await api.get(`/exams/${examId}`);
      const examData = examResponse.data.exam;
      setExam(examData);
      const sessionResponse = await api.post(`/exam-sessions`, { examId });
      setSessionId(sessionResponse.data.session.id);
      setTimeRemaining(examData.durationMinutes * 60);
      toast.success('Exam started! Good luck!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to load exam';
      toast.error(message);
      setTimeout(() => navigate('/student'), 2000);
    }
  };

  const saveAnswers = async () => {
    if (!sessionId) return;
    try {
      await api.post(`/exam-sessions/${sessionId}/answers`, {
        answers: Object.entries(answers).map(([questionId, response]) => ({ questionId, response })),
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAutoSubmit = async () => {
    toast.error('Time is up! Submitting exam...');
    await submitExam();
  };

  const submitExam = async () => {
    if (!sessionId) return;
    setSubmitting(true);
    try {
      await saveAnswers();
      await api.post(`/exam-sessions/${sessionId}/submit`);
      toast.success('Exam submitted successfully!');
      setTimeout(() => navigate('/student'), 2000);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to submit exam';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!exam) return 'text-emerald-500';
    const pct = (timeRemaining / (exam.durationMinutes * 60)) * 100;
    if (pct > 50) return 'text-emerald-500';
    if (pct > 25) return 'text-amber-500';
    return 'text-red-500 animate-pulse';
  };

  const renderQuestion = (question: Question) => {
    const q = question.question;
    const currentAnswer = answers[q.id];

    switch (q.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-3">
            {q.content.options.map((option: string, index: number) => (
              <label
                key={index}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${currentAnswer === option ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'}`}
              >
                <input type="radio" name={q.id} value={option} checked={currentAnswer === option} onChange={(e) => handleAnswerChange(q.id, e.target.value)} className="mt-1 accent-amber-500" />
                <span className="flex-1 text-slate-300">
                  <span className="text-amber-500 font-bold mr-2">{String.fromCharCode(65 + index)}.</span>{option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'MULTIPLE_SELECT':
        return (
          <div className="space-y-3">
            {q.content.options.map((option: string, index: number) => {
              const selected = currentAnswer || [];
              return (
                <label
                  key={index}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selected.includes(option) ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={(e) => {
                      const newSelection = e.target.checked ? [...selected, option] : selected.filter((o: string) => o !== option);
                      handleAnswerChange(q.id, newSelection);
                    }}
                    className="mt-1 accent-amber-500"
                  />
                  <span className="flex-1 text-slate-300">
                    <span className="text-amber-500 font-bold mr-2">{String.fromCharCode(65 + index)}.</span>{option}
                  </span>
                </label>
              );
            })}
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="space-y-3">
            {['true', 'false'].map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${currentAnswer === option ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'}`}
              >
                <input type="radio" name={q.id} value={option} checked={currentAnswer === option} onChange={(e) => handleAnswerChange(q.id, e.target.value)} className="accent-amber-500" />
                <span className="flex-1 capitalize font-medium text-slate-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'SHORT_ANSWER':
        return (
          <input
            type="text"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            className="input-dark"
            placeholder="Type your answer..."
          />
        );

      case 'ESSAY':
        return (
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            className="input-dark resize-none"
            rows={8}
            placeholder="Write your answer here..."
          />
        );

      default:
        return <p className="text-slate-500">Question type not supported</p>;
    }
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.examQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.examQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' }
      }} />

      {/* Top Bar */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-white">{exam.title}</h1>
            <p className="text-xs text-slate-500">{exam.course.name}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time Left</div>
              <div className={`text-2xl font-black mono ${getTimeColor()}`}>
                <Clock className="w-4 h-4 inline mr-1" />
                {formatTime(timeRemaining)}
              </div>
            </div>
            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Submit
            </button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-0.5">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-0.5 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Question Navigator */}
          <div className="col-span-1">
            <div className="glass-card rounded-2xl p-4 sticky top-24">
              <h3 className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Questions</h3>
              <div className="text-xs text-slate-500 mb-4">
                Answered: <span className="font-bold text-amber-500">{answeredCount}</span> / {exam.examQuestions.length}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {exam.examQuestions.map((q, index) => {
                  const isAnswered = !!answers[q.question.id];
                  const isCurrent = index === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`aspect-square rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950'
                          : isAnswered
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question Display */}
          <div className="col-span-3">
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="mono text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
                  Question {currentQuestionIndex + 1} of {exam.examQuestions.length}
                </span>
                <span className="mono text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
                  {currentQuestion.question.points} {currentQuestion.question.points === 1 ? 'point' : 'points'}
                </span>
                <span className="mono text-[10px] font-bold px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20">
                  {currentQuestion.question.type.replace(/_/g, ' ')}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-8">
                {currentQuestion.question.content.question}
              </h2>

              <div className="mb-8">
                {renderQuestion(currentQuestion)}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="text-xs">
                  {answers[currentQuestion.question.id] ? (
                    <span className="flex items-center gap-1 text-emerald-500 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Answered</span>
                  ) : (
                    <span className="text-slate-600">Not answered</span>
                  )}
                </div>

                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(exam.examQuestions.length - 1, prev + 1))}
                  disabled={currentQuestionIndex === exam.examQuestions.length - 1}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl w-full max-w-md p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold text-white">Submit Exam?</h3>
            </div>
            <p className="text-slate-400 mb-4">
              You have answered <span className="font-bold text-amber-500">{answeredCount}</span> out of <span className="font-bold text-white">{exam.examQuestions.length}</span> questions.
            </p>
            {answeredCount < exam.examQuestions.length && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
                <p className="text-sm text-amber-400">
                  ⚠️ You have {exam.examQuestions.length - answeredCount} unanswered question(s).
                </p>
              </div>
            )}
            <p className="text-slate-500 text-sm mb-6">
              Are you sure? You cannot change answers after submission.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 px-4 py-3 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 transition-all font-semibold">Cancel</button>
              <button
                onClick={() => { setShowSubmitConfirm(false); submitExam(); }}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-black rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
