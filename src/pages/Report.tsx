import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, Terminal, ShieldAlert, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { TaskDetail } from '../types';

const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (id) {
      initPage();
    }
  }, [id]);

  const initPage = async () => {
    // 1. Check if we are returning from Stripe with success
    const success = searchParams.get('success');
    
    if (success === 'true') {
      await handlePaymentSuccess();
    } else {
      // Normal load
      await getReport();
    }
  };

  const handlePaymentSuccess = async () => {
    setProcessingPayment(true);
    try {
      // A. Update Database First
      const { error } = await supabase
        .from('tasks')
        .update({ is_paid: true })
        .eq('id', id);

      if (error) console.error("DB Update Failed:", error);

      // B. Clean URL (remove ?success=true) without reloading
      setSearchParams({});

      // C. Now Fetch the freshest data (guaranteed to be paid)
      await getReport();

    } catch (err) {
      console.error("Payment Success Logic Error:", err);
    } finally {
      setProcessingPayment(false);
    }
  };

  const getReport = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setTask(data as any);
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!task) return;
    
    setProcessingPayment(true);
    try {
      // 1. Call Edge Function to get Stripe URL
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          taskId: task.id,
          returnUrl: window.location.href // Send current URL so Stripe knows where to return
        }
      });

      if (error) throw error;
      if (data?.url) {
        // 2. Redirect User to Stripe
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Failed to initialize payment. Check console.");
      setProcessingPayment(false);
    }
  };

  if (loading || processingPayment) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
        <p>{processingPayment ? "Finalizing Payment..." : "Retrieving Analysis..."}</p>
    </div>
  );

  if (!task) return <div className="text-center py-20">Report not found.</div>;

  const isLocked = !task.is_paid;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{task.title}</h1>
            {isLocked ? (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <Lock className="h-3 w-3" /> Report Locked
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Premium Unlocked
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">Analyzed on {new Date(task.created_at).toLocaleString()}</p>
        </div>
        {!isLocked && (
          <div className="text-right">
            <div className="text-sm text-slate-500 mb-1">Overall Score</div>
            <div className={`text-4xl font-bold ${
              (task.ai_feedback?.score || 0) > 80 ? 'text-green-600' : 'text-indigo-600'
            }`}>
              {task.ai_feedback?.score || 0}<span className="text-lg text-slate-400">/100</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Original Code */}
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg h-fit">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
            <span className="text-slate-300 text-xs font-mono">Original Source</span>
          </div>
          <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-[600px]">
            {task.code_content}
          </pre>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="relative">
          {/* Locked State Overlay */}
          {isLocked && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-md rounded-xl flex flex-col items-center justify-center text-center p-8 border border-white/50">
              <div className="bg-white p-4 rounded-full shadow-xl mb-6">
                <CreditCard className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Unlock Full Analysis</h2>
              <p className="text-slate-600 max-w-md mb-8">
                Get detailed bug reports, security vulnerabilities, performance improvements, and a complete refactored solution.
              </p>
              <button 
                onClick={handleUnlock}
                disabled={processingPayment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1 flex items-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Pay $5.00 to Unlock"
                )}
              </button>
              <p className="text-xs text-slate-400 mt-4">Secured by Stripe</p>
            </div>
          )}

          {/* Analysis Content (Blurred if locked) */}
          <div className={`space-y-6 ${isLocked ? 'blur-sm select-none opacity-50' : ''}`}>
            
            {/* Summary Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-indigo-500" />
                Executive Summary
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {task.ai_feedback?.summary || "Analysis pending or unavailable."}
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                <h4 className="font-semibold text-green-800 mb-3">Strengths</h4>
                <ul className="space-y-2">
                  {(task.ai_feedback?.strengths || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                <h4 className="font-semibold text-red-800 mb-3">Issues Detected</h4>
                <ul className="space-y-2">
                  {(task.ai_feedback?.weaknesses || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                      <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Refactored Code */}
            <div className="bg-indigo-900 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-indigo-950/50 px-4 py-2 border-b border-indigo-800 flex justify-between items-center">
                <span className="text-indigo-200 text-xs font-mono">Suggested Solution</span>
              </div>
              <pre className="p-4 text-sm font-mono text-indigo-100 overflow-x-auto">
                {task.ai_feedback?.refactored_code || "// Unlock to see the fixed code..."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;