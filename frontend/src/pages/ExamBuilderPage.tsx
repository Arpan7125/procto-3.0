import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, X, Loader2, ArrowLeft, Clock, FileText, CheckCircle2, Send, Calendar, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import AIGenerateExamModal from '../components/AIGenerateExamModal';

interface Exam {
  id: string;
  title: string;
  durationMinutes: number;
  startAt: string;
  endAt: string;
  status: string;
  isPublished: boolean;
  _count: {
    examQuestions: number;
    examSessions: number;
  };
}

interface Question {
  id: string;
  type: string;
  content: any;
  points: number;
  difficulty?: string;
  topicTags: string[];
}

export default function ExamBuilderPage() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIGenerateExamModal, setShowAIGenerateExamModal] = useState(false);
  const [showAddQuestionsModal, setShowAddQuestionsModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    durationMinutes: 60,
    startAt: '',
    endAt: '',
    shuffleQuestions: true,
    shuffleChoices: true,
    maxAttempts: 1,
    passThreshold: 60,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!courseId) {
      toast.error('No course selected');
      navigate('/faculty');
      return;
    }
    fetchExams();
    fetchQuestions();
  }, [courseId, navigate]);

  const fetchExams = async () => {
    try {
      const response = await api.get(`/exams?courseId=${courseId}`);
      setExams(response.data.exams);
    } catch (error: any) {
      console.error('Fetch exams error:', error);
      toast.error('Failed to load exams');
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/questions?courseId=${courseId}`);
      setQuestions(response.data.questions);
    } catch (error: any) {
      console.error('Fetch questions error:', error);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/exams', {
        courseId,
        title: formData.title,
        instructions: formData.instructions,
        durationMinutes: formData.durationMinutes,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        proctoringLevel: 'STANDARD',
        rules: {
          shuffleQuestions: formData.shuffleQuestions,
          shuffleChoices: formData.shuffleChoices,
          maxAttempts: formData.maxAttempts,
          negativeMarkingFactor: 0,
          passThreshold: formData.passThreshold,
          allowCalculator: false,
          allowFormulaSheet: false,
        },
      });
      toast.success('Exam created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchExams();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create exam';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/exams/${selectedExamId}/questions`, { questionIds: selectedQuestions });
      toast.success(`${selectedQuestions.length} question(s) added to exam!`);
      setShowAddQuestionsModal(false);
      setSelectedQuestions([]);
      fetchExams();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to add questions';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishExam = async (examId: string) => {
    if (!window.confirm('Publish this exam? Students will be able to see it.')) return;
    try {
      await api.post(`/exams/${examId}/publish`);
      toast.success('Exam published successfully!');
      fetchExams();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to publish exam';
      toast.error(message);
    }
  };

  const handleAIGenerateExam = async (data: any) => {
    setLoading(true);
    let successCount = 0;
    try {
      toast.loading('Prompting AI for questions...', { id: 'ai-exam' });
      // 1. Generate questions
      const aiRes = await api.post('/ai/generate', {
        prompt: data.prompt, count: data.count, difficulty: data.difficulty, type: data.type
      });
      const generatedQuestions = aiRes.data.questions;

      toast.loading('Creating exam instance...', { id: 'ai-exam' });
      // 2. Create the exam
      const examRes = await api.post('/exams', {
        courseId,
        title: data.title,
        instructions: data.instructions,
        durationMinutes: data.durationMinutes,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
        proctoringLevel: 'STANDARD',
        rules: {
          shuffleQuestions: data.shuffleQuestions,
          shuffleChoices: data.shuffleChoices,
          maxAttempts: data.maxAttempts,
          negativeMarkingFactor: 0,
          passThreshold: data.passThreshold,
          allowCalculator: false,
          allowFormulaSheet: false,
        }
      });
      const newExamId = examRes.data.exam.id;

      toast.loading(`Saving ${generatedQuestions.length} questions...`, { id: 'ai-exam' });
      // 3. Save questions to DB
      const savedQuestionIds: string[] = [];
      for (const gq of generatedQuestions) {
        try {
          const content: any = { question: gq.text };
          if (gq.type === 'MCQ') {
            content.options = gq.options || [];
            content.correctAnswer = gq.correctAnswer;
          } else if (gq.type === 'TRUE_FALSE') {
            content.correctAnswer = gq.correctAnswer.toLowerCase();
          } else {
            content.correctAnswer = gq.correctAnswer;
          }

          const dbType = gq.type === 'MCQ' ? 'MULTIPLE_CHOICE' 
                       : gq.type === 'TRUE_FALSE' ? 'TRUE_FALSE' 
                       : 'SHORT_ANSWER';

          const res = await api.post('/questions', {
            courseId,
            type: dbType,
            content,
            points: gq.marks || 1,
            difficulty: gq.difficulty || 'MEDIUM',
            topicTags: ['AI-Exam']
          });
          savedQuestionIds.push(res.data.question.id);
          successCount++;
        } catch (err) {
          console.error('Failed to save AI question:', err);
        }
      }

      toast.loading(`Linking ${savedQuestionIds.length} questions to exam...`, { id: 'ai-exam' });
      // 4. Link questions to exam
      if (savedQuestionIds.length > 0) {
        await api.post(`/exams/${newExamId}/questions`, { questionIds: savedQuestionIds });
      }

      toast.success(`Exam created with ${successCount} AI questions!`, { id: 'ai-exam' });
      setShowAIGenerateExamModal(false);
      fetchExams();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to generate exam with AI.', { id: 'ai-exam' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', instructions: '', durationMinutes: 60, startAt: '', endAt: '', shuffleQuestions: true, shuffleChoices: true, maxAttempts: 1, passThreshold: 60 });
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) => prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]);
  };

  const getStatusBadge = (exam: Exam) => {
    if (!exam.isPublished) return { label: 'DRAFT', cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    const now = new Date();
    const start = new Date(exam.startAt);
    const end = new Date(exam.endAt);
    if (now < start) return { label: 'SCHEDULED', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
    if (now >= start && now <= end) return { label: 'ACTIVE', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    return { label: 'COMPLETED', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' }
      }} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/faculty')} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-orange-500 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Exam Builder</span>
          </h1>
        </div>
        <p className="text-slate-500 ml-12 mb-8">{exams.length} exams in this course</p>

        <div className="flex items-center justify-end mb-6 gap-3">
          <button 
            onClick={() => setShowAIGenerateExamModal(true)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600/10 text-violet-400 border border-violet-500/20 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-violet-600/20 hover:text-white transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Generate Exam with AI
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all">
            <Plus className="w-3.5 h-3.5" /> Create Exam
          </button>
        </div>

        {/* Exams */}
        {exams.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No exams yet</h3>
            <p className="text-slate-500 mb-6">Create your first exam to test students</p>
            <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold rounded-xl">Create Exam</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const status = getStatusBadge(exam);
              return (
                <div key={exam.id} className="glass-card rounded-2xl p-6 hover:border-orange-500/20 transition-all">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-2">{exam.title}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${status.cls}`}>{status.label}</span>
                      <span className="mono text-[10px] font-bold px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20">
                        <Clock className="w-2.5 h-2.5 inline mr-1" />{exam.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>Start: {new Date(exam.startAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>End: {new Date(exam.endAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-t border-b border-white/5 mb-4 text-sm">
                    <span><strong className="text-orange-500">{exam._count.examQuestions}</strong> <span className="text-slate-500">questions</span></span>
                    <span><strong className="text-emerald-500">{exam._count.examSessions}</strong> <span className="text-slate-500">submissions</span></span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedExamId(exam.id); setShowAddQuestionsModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-orange-500/10 text-slate-300 hover:text-orange-500 rounded-xl transition-all text-xs font-bold border border-white/5 hover:border-orange-500/20"
                    >
                      <Plus className="w-3 h-3" /> Add Questions
                    </button>
                    {!exam.isPublished && exam._count.examQuestions > 0 && (
                      <button
                        onClick={() => handlePublishExam(exam.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all text-xs font-bold border border-emerald-500/20"
                      >
                        <Send className="w-3 h-3" /> Publish
                      </button>
                    )}
                    {exam.isPublished && (
                      <button disabled className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-500/5 text-emerald-500/50 rounded-xl text-xs font-bold border border-emerald-500/10 cursor-not-allowed">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-card rounded-2xl w-full max-w-2xl p-8 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Create New Exam</h3>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-5">
              <div>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Exam Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-dark" placeholder="e.g., Midterm Exam" required />
              </div>

              <div>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Instructions (Optional)</label>
                <textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} className="input-dark resize-none" rows={3} placeholder="Special instructions for students..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Duration (min) *</label>
                  <input type="number" value={formData.durationMinutes} onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })} className="input-dark" min="1" required />
                </div>
                <div>
                  <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Max Attempts *</label>
                  <input type="number" value={formData.maxAttempts} onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })} className="input-dark" min="1" max="5" required />
                </div>
                <div>
                  <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Pass % *</label>
                  <input type="number" value={formData.passThreshold} onChange={(e) => setFormData({ ...formData, passThreshold: parseInt(e.target.value) })} className="input-dark" min="0" max="100" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Start Date & Time *</label>
                  <input type="datetime-local" value={formData.startAt} onChange={(e) => setFormData({ ...formData, startAt: e.target.value })} className="input-dark" required />
                </div>
                <div>
                  <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">End Date & Time *</label>
                  <input type="datetime-local" value={formData.endAt} onChange={(e) => setFormData({ ...formData, endAt: e.target.value })} className="input-dark" required />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.shuffleQuestions} onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })} className="accent-orange-500" />
                  <span className="text-sm text-slate-400">Shuffle question order for each student</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.shuffleChoices} onChange={(e) => setFormData({ ...formData, shuffleChoices: e.target.checked })} className="accent-orange-500" />
                  <span className="text-sm text-slate-400">Shuffle answer choices in MCQs</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="flex-1 px-4 py-3 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 transition-all font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Questions Modal */}
      {showAddQuestionsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-card rounded-2xl w-full max-w-4xl p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/80 backdrop-blur-md pb-4 -mt-2 pt-2 z-10">
              <h3 className="text-xl font-bold text-white">Add Questions to Exam</h3>
              <button onClick={() => { setShowAddQuestionsModal(false); setSelectedQuestions([]); }} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">No questions available. Create questions first!</p>
                <button onClick={() => navigate(`/questions?courseId=${courseId}`)} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold rounded-xl">
                  Go to Question Bank
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-slate-500">
                  Selected: <span className="font-bold text-orange-500">{selectedQuestions.length}</span> questions
                </div>

                <div className="space-y-2 mb-6">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      onClick={() => toggleQuestionSelection(question.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedQuestions.includes(question.id) ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'}`}
                    >
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={selectedQuestions.includes(question.id)} onChange={() => toggleQuestionSelection(question.id)} className="mt-1 accent-orange-500" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="mono text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">{question.type.replace(/_/g, ' ')}</span>
                            <span className="mono text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{question.points} pts</span>
                            {question.difficulty && (
                              <span className="mono text-[10px] font-bold text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded border border-slate-500/20">{question.difficulty}</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-300">{question.content.question}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-slate-900/80 backdrop-blur-md border-t border-white/5 -mb-2 pb-2">
                  <button onClick={() => { setShowAddQuestionsModal(false); setSelectedQuestions([]); }} className="flex-1 px-4 py-3 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 transition-all font-semibold">Cancel</button>
                  <button
                    onClick={handleAddQuestions}
                    disabled={loading || selectedQuestions.length === 0}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Adding...' : `Add ${selectedQuestions.length} Question(s)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AI Generate Exam Modal */}
      <AIGenerateExamModal
        isOpen={showAIGenerateExamModal}
        onClose={() => setShowAIGenerateExamModal(false)}
        onGenerate={handleAIGenerateExam}
      />
    </div>
  );
}
