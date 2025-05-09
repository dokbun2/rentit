import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabaseClient';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [, setLocation] = useLocation();

  // 강제로 다크모드 적용 (테스트용)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setLocation('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 text-white">
      <div className="w-full max-w-md rounded-xl bg-zinc-800 border border-zinc-700 p-8 shadow-xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-purple-400">관리자 로그인</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-900/50 border border-red-600 p-3 text-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-600 bg-zinc-700/50 px-3 py-2 text-white shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-600 bg-zinc-700/50 px-3 py-2 text-white shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-purple-600 py-2 font-semibold text-white shadow-sm hover:bg-purple-500 transition disabled:opacity-70"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
} 