import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: {
    prompt: string;
    count: number;
    difficulty: string;
    type: string;
  }) => Promise<void>;
}

const AIGenerateModal: React.FC<AIGenerateModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(3);
  const [difficulty, setDifficulty] = useState('ANY');
  const [type, setType] = useState('ANY');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      await onGenerate({ prompt, count, difficulty, type });
      // Clear form on success
      setPrompt('');
      setCount(3);
      setDifficulty('ANY');
      setType('ANY');
      onClose();
    } catch (error) {
      console.error('Failed to generate:', error);
      // Let parent handle the error notification
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-violet-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-semibold text-white">Generate Questions with AI</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex flex-col items-center">
          
          <div className="space-y-2 w-full">
            <label className="text-sm font-medium text-slate-300">Topic or Content Prompt</label>
            <textarea
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Core concepts of React hooks, focusing on useEffect..."
              className="w-full h-32 px-4 py-3 bg-black/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Number of Questions</label>
              <input
                type="number"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Question Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none"
              >
                <option value="ANY">Mixed (Any)</option>
                <option value="MCQ">Multiple Choice</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="SUBJECTIVE">Subjective</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 w-full">
            <label className="text-sm font-medium text-slate-300">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none"
            >
              <option value="ANY">Any Difficulty</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 w-full border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-900/20 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AIGenerateModal;
