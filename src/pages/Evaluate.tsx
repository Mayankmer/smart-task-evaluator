import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EvaluatePage: React.FC = () => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Create Task Record
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: title || 'Untitled Snippet',
          code_content: code,
          is_paid: false
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Trigger Edge Function for Analysis
      // This now hits your REAL Supabase Edge Function
      const { error: funcError } = await supabase.functions.invoke('evaluate-task', {
        body: { taskId: task.id, code }
      });

      if (funcError) throw funcError;

      navigate(`/report/${task.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze task. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">New Code Evaluation</h1>
        <p className="text-slate-500">Paste your code below. Our AI will analyze bugs, performance, and style.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Project Title</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="e.g. UserAuth Component"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Code Snippet</label>
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 font-mono text-sm bg-slate-900 text-slate-50 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="// Paste your React component, API route, or function here..."
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium
              ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'}
              transition-all
            `}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Run AI Analysis
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvaluatePage;