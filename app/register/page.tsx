'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Automatically sign in after successful registration
      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push('/login?registered=true');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2A1B24] pt-28 pb-20 flex items-center justify-center px-4 text-[#FFF0F5]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#392431]/90 backdrop-blur-md p-8 rounded-3xl border border-[#5C354C] shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-2 hover:text-[#E0B0FF] transition-colors">
            Brew-tiful <span className="text-[#E63E8C]">Coffee</span>
          </Link>
          <p className="text-[#FFF0F5]/70 font-['Inter'] text-sm">Join our coffee experience community</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-['Inter'] text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-2 font-['Inter']">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] focus:outline-none focus:border-[#E0B0FF] rounded-xl px-4 py-3 font-['Inter'] text-sm transition-colors"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-2 font-['Inter']">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] focus:outline-none focus:border-[#E0B0FF] rounded-xl px-4 py-3 font-['Inter'] text-sm transition-colors"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-2 font-['Inter']">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] focus:outline-none focus:border-[#E0B0FF] rounded-xl px-4 py-3 font-['Inter'] text-sm transition-colors"
              placeholder="At least 6 characters"
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
              'Create Account →'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#5C354C] text-center font-['Inter'] text-xs text-[#FFF0F5]/70">
          Already have an account?{' '}
          <Link href="/login" className="text-[#E63E8C] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
