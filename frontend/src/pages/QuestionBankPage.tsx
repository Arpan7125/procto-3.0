import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, X, Loader2, ArrowLeft, Tag, Zap, CheckCircle2, HelpCircle, FileText, Hash, Code2, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import AIGenerateModal from '../components/AIGenerateModal';

interface Question {
  id: string;
  type: string;
  content: any;
  points: number;
  difficulty?: string;
  topicTags: string[];
  createdAt: string;
}

export default function QuestionBankPage() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'MULTIPLE_CHOICE',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    correctAnswers: [] as string[],
    points: 1,
    difficulty: 'MEDIUM',
    topicTags: '',
    explanation: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!courseId) {
      toast.error('No course selected');
      navigate('/faculty');
      return;
    }
    fetchQuestions();
  }, [courseId, navigate]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/questions?courseId=${courseId}`);
      setQuestions(response.data.questions);
    } catch (error: any) {
      console.error('Fetch questions error:', error);
      toast.error('Failed to load questions');
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const content: any = {
        question: formData.question,
        explanation: formData.explanation || undefined,
      };
      if (formData.type === 'MULTIPLE_CHOICE') {
        content.options = formData.options.filter(o => o.trim());
        content.correctAnswer = formData.correctAnswer;
      } else if (formData.type === 'MULTIPLE_SELECT') {
        content.options = formData.options.filter(o => o.trim());
        content.correctAnswer = formData.correctAnswers;
      } else if (formData.type === 'TRUE_FALSE') {
        content.correctAnswer = formData.correctAnswer;
      } else if (formData.type === 'SHORT_ANSWER') {
        content.correctAnswer = formData.correctAnswer;
        content.caseInsensitive = true;
      }
      const payload = {
        courseId,
        type: formData.type,
        content,
        points: formData.points,
        difficulty: formData.difficulty,
        topicTags: formData.topicTags ? formData.topicTags.split(',').map(t => t.trim()) : [],
      };
      await api.post('/questions', payload);
      toast.success('Question created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchQuestions();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create question';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async (data: { prompt: string; count: number; difficulty: string; type: string }) => {
    try {
      const response = await api.post('/ai/generate', data);
      const generatedQuestions = response.data.questions;
      
      // Auto-save each generated question to the database
      let successCount = 0;
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

          // Map AI type to our DB type
          const dbType = gq.type === 'MCQ' ? 'MULTIPLE_CHOICE' 
                       : gq.type === 'TRUE_FALSE' ? 'TRUE_FALSE' 
                       : 'SHORT_ANSWER';

          await api.post('/questions', {
            courseId,
            type: dbType,
            content,
            points: gq.marks || 1,
            difficulty: gq.difficulty || 'MEDIUM',
            topicTags: ['AI-Generated']
          });
          successCount++;
        } catch (err) {
          console.error('Failed to save individual question:', err);
        }
      }
      
      toast.success(`Successfully generated and saved ${successCount} questions!`);
      fetchQuestions(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate questions. Try refining your prompt.');
      throw error; // Re-throw so modal doesn't close on error
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'MULTIPLE_CHOICE',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      correctAnswers: [],
      points: 1,
      difficulty: 'MEDIUM',
      topicTags: '',
      explanation: '',
    });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const toggleCorrectAnswer = (option: string) => {
    const newAnswers = formData.correctAnswers.includes(option)
      ? formData.correctAnswers.filter(a => a !== option)
      : [...formData.correctAnswers, option];
    setFormData({ ...formData, correctAnswers: newAnswers });
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return <CheckCircle2 className="w-4 h-4 text-orange-500" />;
      case 'MULTIPLE_SELECT': return <CheckCircle2 className="w-4 h-4 text-violet-500" />;
      case 'TRUE_FALSE': return <Zap className="w-4 h-4 text-emerald-500" />;
      case 'SHORT_ANSWER': return <FileText className="w-4 h-4 text-sky-500" />;
      case 'ESSAY': return <FileText className="w-4 h-4 text-amber-500" />;
      case 'NUMERICAL': return <Hash className="w-4 h-4 text-pink-500" />;
      case 'CODE': return <Code2 className="w-4 h-4 text-cyan-500" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getDifficultyColor = (d?: string) => {
    switch (d) {
      case 'EASY': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'HARD': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Question Bank</span>
          </h1>
        </div>
        <p className="text-slate-500 ml-12 mb-8">{questions.length} questions in this course</p>

        {/* Action Bar */}
        <div className="flex items-center justify-end mb-6 gap-3">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600/10 text-violet-400 border border-violet-500/20 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-violet-600/20 hover:text-white transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Generate with AI
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Question
          </button>
        </div>

        {/* Questions */}
        {questions.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No questions yet</h3>
            <p className="text-slate-500 mb-6">Create your first question to build your bank</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold rounded-xl"
            >
              Add Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="glass-card rounded-2xl p-6 hover:border-orange-500/20 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {getQuestionTypeIcon(question.type)}
                      <span className="mono text-[10px] font-bold uppercase px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/20">
                        {question.type.replace(/_/g, ' ')}
                      </span>
                      <span className="mono text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
                        {question.points} {question.points === 1 ? 'pt' : 'pts'}
                      </span>
                      {question.difficulty && (
                        <span className={`mono text-[10px] font-bold px-2 py-0.5 rounded-lg border ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium mb-3">
                      {index + 1}. {question.content.question}
                    </p>
                    {question.content.options && (
                      <div className="space-y-1.5 mb-3">
                        {question.content.options.map((option: string, i: number) => {
                          const isCorrect = Array.isArray(question.content.correctAnswer)
                            ? question.content.correctAnswer.includes(option)
                            : question.content.correctAnswer === option;
                          return (
                            <div key={i} className={`text-sm px-3 py-1.5 rounded-lg ${isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/[0.02] text-slate-400'}`}>
                              {String.fromCharCode(65 + i)}. {option}
                              {isCorrect && ' ✓'}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {question.topicTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {question.topicTags.map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 text-[10px] mono px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20">
                            <Tag className="w-2.5 h-2.5" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Question Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-card rounded-2xl w-full max-w-3xl p-8 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Create Question</h3>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-5">
              {/* Question Type */}
              <div>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Question Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-dark"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice (Single Answer)</option>
                  <option value="MULTIPLE_SELECT">Multiple Select (Multiple Answers)</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                  <option value="ESSAY">Essay (Manual Grading)</option>
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Question *</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="input-dark resize-none"
                  rows={3}
                  placeholder="Enter your question..."
                  required
                />
              </div>

              {/* Options for MCQ */}
              {(formData.type === 'MULTIPLE_CHOICE' || formData.type === 'MULTIPLE_SELECT') && (
                <div>
                  <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Options *</label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        {formData.type === 'MULTIPLE_CHOICE' ? (
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={formData.correctAnswer === option && option !== ''}
                            onChange={() => setFormData({ ...formData, correctAnswer: option })}
                            className="accent-orange-500"
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={formData.correctAnswers.includes(option) && option !== ''}
                            onChange={() => toggleCorrectAnswer(option)}
                            className="accent-orange-500"
                          />
                        )}
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="input-dark flex-1"
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          required
                        />
                        {formData.options.length > 2 && (
                          <button type="button" onClick={() => removeOption(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addOption} className="mt-2 text-xs text-orange-500 hover:text-orange-400 font-bold">
                    + Add Option
                  </button>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {formData.type === 'MULTIPLE_CHOICE' ? 'Select the radio for the correct answer' : 'Check all correct answers'}
                  </p>
                </div>
              )}

              {/* True/False */}
              {formData.type === 'TRUE_FALSE' && (
                <div>
                  <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Correct Answer *</label>
                  <div className="flex gap-4">
                    {['true', 'false'].map((opt) => (
                      <label key={opt} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${formData.correctAnswer === opt ? 'border-orange-500/40 bg-orange-500/10 text-orange-500' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>
                        <input type="radio" name="trueFalse" value={opt} checked={formData.correctAnswer === opt} onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })} className="accent-orange-500" required />
                        <span className="capitalize font-medium text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Short Answer */}
              {formData.type === 'SHORT_ANSWER' && (
                <div>
                  <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Expected Answer *</label>
                  <input
                    type="text"
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="input-dark"
                    placeholder="Enter the expected answer..."
                    required
                  />
                  <p className="text-[10px] text-slate-600 mt-1">Grading will be case-insensitive</p>
                </div>
              )}

              {/* Points and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Points *</label>
                  <input type="number" value={formData.points} onChange={(e) => setFormData({ ...formData, points: parseFloat(e.target.value) })} className="input-dark" min="0.5" step="0.5" required />
                </div>
                <div>
                  <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Difficulty</label>
                  <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="input-dark">
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Topic Tags (comma-separated)</label>
                <input type="text" value={formData.topicTags} onChange={(e) => setFormData({ ...formData, topicTags: e.target.value })} className="input-dark" placeholder="e.g., loops, arrays, algorithms" />
              </div>

              {/* Explanation */}
              <div>
                <label className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Explanation (Optional)</label>
                <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} className="input-dark resize-none" rows={2} placeholder="Explain the correct answer..." />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="flex-1 px-4 py-3 border border-white/10 text-slate-400 rounded-xl hover:bg-white/5 transition-all font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Creating...' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* AI Generate Modal */}
      <AIGenerateModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleAIGenerate}
      />
    </div>
  );
}
