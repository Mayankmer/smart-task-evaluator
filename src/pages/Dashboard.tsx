import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Code, CheckCircle, Lock, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type {Task}  from '../types/index';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, created_at, is_paid, ai_feedback')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsedData = (data as any[])?.map(d => ({
        ...d,
        score: d.ai_feedback?.score || 0
      }));

      setTasks(parsedData || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Evaluations</h1>
          <p className="text-slate-500">View past code reviews and scores.</p>
        </div>
        <Link 
          to="/evaluate"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          New Evaluation
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <Code className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No evaluations yet</h3>
          <p className="text-slate-500 mb-4">Upload your first code snippet to get AI feedback.</p>
          <Link to="/evaluate" className="text-indigo-600 hover:underline font-medium">Get Started &rarr;</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 border-b border-slate-100 bg-slate-50 p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-5">Project Name</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Score</div>
          </div>
          {tasks.map((task) => (
            <Link 
              key={task.id} 
              to={`/report/${task.id}`}
              className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors group"
            >
              <div className="col-span-5 font-medium text-slate-900 flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${task.is_paid ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  {task.is_paid ? <CheckCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </div>
                {task.title || 'Untitled Task'}
              </div>
              <div className="col-span-3 text-slate-500 text-sm">
                {new Date(task.created_at).toLocaleDateString()}
              </div>
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  task.is_paid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {task.is_paid ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <div className="col-span-2 text-right font-mono font-bold text-slate-700 group-hover:text-indigo-600">
                {task.is_paid ? `${task.score}/100` : '???'} <ChevronRight className="inline h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;