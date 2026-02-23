import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

export interface AIExamData {
  title: string;
  instructions: string;
  durationMinutes: number;
  maxAttempts: number;
  passThreshold: number;
  startAt: string;
  endAt: string;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
  prompt: string;
  count: number;
  difficulty: string;
  type: string;
}

interface AIGenerateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: AIExamData) => Promise<void>;
}

const AIGenerateExamModal: React.FC<AIGenerateExamModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [formData, setFormData] = useState<AIExamData>({
    title: '',
    instructions: '',
    durationMinutes: 60,
    maxAttempts: 1,
    passThreshold: 60,
    startAt: '',
    endAt: '',
    shuffleQuestions: true,
    shuffleChoices: true,
    prompt: '',
    count: 10,
    difficulty: 'ANY',
    type: 'ANY',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.prompt.trim()) return;

    setIsGenerating(true);
    try {
      await onGenerate(formData);
      onClose();
    } catch (error) {
      console.error('Failed to generate exam:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (field: keyof AIExamData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-2 text-violet-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-semibold text-white">Generate Exam with AI</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 flex flex-col">
          
          {/* AI Settings Section */}
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Step 1: AI Prompt & Question Settings
              </h3>
              <p className="text-sm text-slate-500">Configure what kind of questions the AI should generate.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Topic or Content Prompt *</label>
              <textarea
                required
                value={formData.prompt}
                onChange={(e) => handleChange('prompt', e.target.value)}
                placeholder="E.g., Complete mid-term syllabus focusing on Javascript advanced features..."
                className="w-full h-24 px-4 py-3 bg-black/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Number of Questions *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={formData.count}
                  onChange={(e) => handleChange('count', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Question Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
                >
                  <option value="ANY">Mixed (Any)</option>
                  <option value="MCQ">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="SUBJECTIVE">Subjective</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
                >
                  <option value="ANY">Any Difficulty</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Exam Details Section */}
          <div className="space-y-6 pt-4">
            <div className="border-b border-white/5 pb-2">
              <h3 className="text-lg font-bold text-white">Step 2: Exam Configuration</h3>
              <p className="text-sm text-slate-500">Configure the parameters for the actual exam instance.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Exam Title *</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => handleChange('title', e.target.value)} 
                className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" 
                placeholder="e.g., AI Generated Final Exam" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Instructions (Optional)</label>
              <textarea 
                value={formData.instructions} 
                onChange={(e) => handleChange('instructions', e.target.value)} 
                className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" 
                rows={2} 
                placeholder="Special instructions for students..." 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Duration (min) *</label>
                <input type="number" value={formData.durationMinutes} onChange={(e) => handleChange('durationMinutes', parseInt(e.target.value))} className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" min="1" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Max Attempts *</label>
                <input type="number" value={formData.maxAttempts} onChange={(e) => handleChange('maxAttempts', parseInt(e.target.value))} className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" min="1" max="5" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Pass % *</label>
                <input type="number" value={formData.passThreshold} onChange={(e) => handleChange('passThreshold', parseInt(e.target.value))} className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" min="0" max="100" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Start Date & Time *</label>
                <input type="datetime-local" value={formData.startAt} onChange={(e) => handleChange('startAt', e.target.value)} className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">End Date & Time *</label>
                <input type="datetime-local" value={formData.endAt} onChange={(e) => handleChange('endAt', e.target.value)} className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" required />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.shuffleQuestions} onChange={(e) => handleChange('shuffleQuestions', e.target.checked)} className="accent-violet-500 w-4 h-4" />
                <span className="text-sm text-slate-300">Shuffle question order for each student</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.shuffleChoices} onChange={(e) => handleChange('shuffleChoices', e.target.checked)} className="accent-violet-500 w-4 h-4" />
                <span className="text-sm text-slate-300">Shuffle answer choices in MCQs</span>
              </label>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 w-full border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors border border-white/5 rounded-xl hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !formData.title.trim() || !formData.prompt.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-violet-900/40 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Exam...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Exam
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AIGenerateExamModal;
