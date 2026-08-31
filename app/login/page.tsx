'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const message = searchParams.get('message');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during sign in');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-[#392431]/90 backdrop-blur-md p-8 rounded-3xl border border-[#5C354C] shadow-2xl"
    >
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-3xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-2 hover:text-[#E0B0FF] transition-colors">
          Brew-tiful <span className="text-[#E63E8C]">Coffee</span>
        </Link>
        <p className="text-[#FFF0F5]/70 font-['Inter'] text-sm">Sign in to your account</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-[#E63E8C]/20 border border-[#E63E8C]/60 rounded-2xl text-[#FFF0F5] text-xs font-['Inter'] text-center font-semibold flex items-center justify-center gap-2 shadow-lg">
          <span>ℹ️</span>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-['Inter'] text-center">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-2 font-['Inter']">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] focus:outline-none focus:border-[#E0B0FF] rounded-xl px-4 py-3 font-['Inter'] text-sm transition-colors"
            placeholder="customer@brewtiful.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-2 font-['Inter']">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] focus:outline-none focus:border-[#E0B0FF] rounded-xl px-4 py-3 font-['Inter'] text-sm transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold font-['Inter'] text-sm shadow-lg shadow-[#E63E8C]/20 hover:opacity-95 transition-all flex items-center justify-center disabled:opacity-50 mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Sign In →'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#5C354C] text-center font-['Inter'] text-xs text-[#FFF0F5]/70">
        Don't have an account yet?{' '}
        <Link href="/register" className="text-[#E63E8C] font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#2A1B24] pt-28 pb-20 flex items-center justify-center px-4 text-[#FFF0F5]">
      <Suspense fallback={<div className="text-[#FFF0F5] text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

