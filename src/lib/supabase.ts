import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// Set to true to use real Supabase, false to use Mock data for UI testing
const USE_REAL_SUPABASE = false; 

// --- REAL SUPABASE CLIENT ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = USE_REAL_SUPABASE 
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient();

// --- MOCK CLIENT IMPLEMENTATION (For Preview/Testing) ---
function createMockClient() {
  console.log("⚠️ Using Mock Supabase Client");
  
  const MOCK_USER = { id: 'mock-user-123', email: 'demo@smarteval.ai' };
  
  // Sample data to populate the dashboard immediately
  let MOCK_TASKS = [
    {
      id: 'task-1',
      user_id: MOCK_USER.id,
      title: 'Buggy Auth Component',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      is_paid: true,
      code_content: `function Auth() { \n  useEffect(() => {\n    setUser(getUser()); // Infinite loop\n  });\n}`,
      ai_feedback: {
        score: 85,
        summary: "Critical infinite loop detected in useEffect.",
        strengths: ["Clean JSX"],
        weaknesses: ["Infinite render loop", "Missing dependency array"],
        refactored_code: `useEffect(() => { ... }, []);`
      }
    },
    {
      id: 'task-2',
      user_id: MOCK_USER.id,
      title: 'Slow API Helper',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      is_paid: false,
      code_content: `arr.map(item => arr.find(x => x.id === item.id)) // O(n^2)`,
      ai_feedback: null
    }
  ];

  return {
    auth: {
      getUser: async () => ({ data: { user: MOCK_USER } }),
      getSession: async () => ({ data: { session: { user: MOCK_USER } } }),
      signOut: async () => { window.location.href = '/login'; },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: (col: string, val: any) => ({
          order: () => ({ data: MOCK_TASKS, error: null }),
          single: () => {
            const task = MOCK_TASKS.find(t => t.id === val);
            return { data: task, error: task ? null : 'Not found' };
          }
        }),
        single: () => ({ data: null, error: 'Not implemented' })
      }),
      insert: (row: any) => ({
        select: () => ({
          single: () => {
            const newTask = { ...row, id: `new-${Date.now()}`, created_at: new Date().toISOString() };
            MOCK_TASKS.unshift(newTask);
            return { data: newTask, error: null };
          }
        })
      }),
      update: (updates: any) => ({
        eq: (col: string, val: any) => {
          const idx = MOCK_TASKS.findIndex(t => t.id === val);
          if (idx >= 0) MOCK_TASKS[idx] = { ...MOCK_TASKS[idx], ...updates };
          return { error: null };
        }
      })
    }),
    functions: {
      invoke: async (name: string, { body }: any) => {
        console.log(`[Mock Edge Function] ${name} called with`, body);
        await new Promise(r => setTimeout(r, 1500)); // Simulate delay
        return { data: { success: true }, error: null };
      }
    }
  } as any;
}