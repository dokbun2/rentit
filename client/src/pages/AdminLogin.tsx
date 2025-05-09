import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [envError, setEnvError] = useState(false);
  
  const [, setLocation] = useLocation();

  // 환경 변수 체크 및 다크모드 적용
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Supabase 환경 변수 체크
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setEnvError(true);
      setError('Supabase 환경 변수가 설정되지 않았습니다. 관리자에게 문의하세요.');
    }
    
    return () => {
      // 정리 작업: 페이지 나갈 때 다크모드 제거
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (envError) {
      return; // 환경 변수 오류가 있으면 로그인 시도하지 않음
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        setLocation('/admin/dashboard');
      } else {
        throw new Error('로그인에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
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
              disabled={envError}
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
              disabled={envError}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || envError}
            className="w-full rounded-md bg-purple-600 py-2 font-semibold text-white shadow-sm hover:bg-purple-500 transition disabled:opacity-70"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
} 