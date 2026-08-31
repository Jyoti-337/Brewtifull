'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'ADMIN';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#2A1B24]/90 backdrop-blur-md border-b border-[#5C354C]/60 shadow-lg shadow-[#E63E8C]/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          className="cursor-pointer flex items-center gap-2 group"
          onClick={() => router.push('/')}
        >
          <span className="text-2xl font-['Playfair_Display'] font-bold text-[#FFF0F5] group-hover:text-[#E0B0FF] transition-colors">
            Brew-tiful
          </span>
          <span className="text-[#E63E8C] text-2xl font-['Playfair_Display'] font-bold group-hover:text-[#E0B0FF] transition-colors">
            Coffee
          </span>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 font-['Inter'] font-medium text-sm">
          <button
            onClick={() => router.push('/')}
            className={`transition-colors ${
              pathname === '/' ? 'text-[#E0B0FF] font-semibold underline underline-offset-4 decoration-[#E63E8C]' : 'text-[#FFF0F5]/80 hover:text-[#E0B0FF]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => router.push('/menu')}
            className={`transition-colors ${
              pathname === '/menu' ? 'text-[#E0B0FF] font-semibold underline underline-offset-4 decoration-[#E63E8C]' : 'text-[#FFF0F5]/80 hover:text-[#E0B0FF]'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => router.push('/about')}
            className={`transition-colors ${
              pathname === '/about' ? 'text-[#E0B0FF] font-semibold underline underline-offset-4 decoration-[#E63E8C]' : 'text-[#FFF0F5]/80 hover:text-[#E0B0FF]'
            }`}
          >
            About
          </button>
          <button
            onClick={() => router.push('/reviews')}
            className={`transition-colors ${
              pathname === '/reviews' ? 'text-[#E0B0FF] font-semibold underline underline-offset-4 decoration-[#E63E8C]' : 'text-[#FFF0F5]/80 hover:text-[#E0B0FF]'
            }`}
          >
            Reviews
          </button>
          
          <button
            onClick={() => router.push('/wishlist')}
            className={`transition-colors ${
              pathname === '/wishlist' ? 'text-[#E0B0FF] font-semibold underline underline-offset-4 decoration-[#E63E8C]' : 'text-[#FFF0F5]/80 hover:text-[#E0B0FF]'
            }`}
          >
            Wishlist
          </button>

          {session && (
            <button
              onClick={() => router.push('/orders')}
              className={`transition-colors ${
                pathname === '/orders' ? 'text-[#E0B0FF] font-semibold underline underline-offset-4 decoration-[#E63E8C]' : 'text-[#FFF0F5]/80 hover:text-[#E0B0FF]'
              }`}
            >
              My Orders
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className={`px-3 py-1.5 rounded-full bg-[#E63E8C]/20 border border-[#E63E8C] text-[#E0B0FF] font-semibold transition-all hover:bg-[#E63E8C] hover:text-white ${
                pathname.startsWith('/admin') ? 'ring-2 ring-[#E63E8C]' : ''
              }`}
            >
              Admin Dashboard
            </button>
          )}
        </div>

        {/* Right Actions: Auth + Cart */}
        <div className="flex items-center gap-4">
          {/* User Auth Section */}
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-[#392431] animate-pulse" />
          ) : session ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-[#392431] hover:bg-[#4A2B3D] border border-[#5C354C] px-3.5 py-1.5 rounded-full text-sm font-['Inter'] text-[#FFF0F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E63E8C]"
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#E63E8C] to-[#E0B0FF] text-white flex items-center justify-center font-bold text-xs">
                  {session.user?.name ? session.user.name[0].toUpperCase() : 'U'}
                </span>
                <span className="max-w-[100px] truncate hidden sm:inline">{session.user?.name?.split(' ')[0] || 'Account'}</span>
                <svg className={`w-3.5 h-3.5 text-[#FFF0F5]/70 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-[#392431] border border-[#5C354C] rounded-xl shadow-2xl p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-[#5C354C]/50 mb-1">
                      <p className="text-xs text-[#FFF0F5]/60">Signed in as</p>
                      <p className="text-sm font-semibold text-[#FFF0F5] truncate">{session.user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push('/orders');
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-[#FFF0F5]/80 hover:text-[#E0B0FF] hover:bg-[#4A2B3D] rounded-lg transition-colors flex items-center gap-2"
                    >
                      <span>📦</span> My Orders
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          router.push('/admin');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-[#E0B0FF] font-medium hover:bg-[#4A2B3D] rounded-lg transition-colors flex items-center gap-2"
                      >
                        <span>⚙️</span> Admin Panel
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1 flex items-center gap-2"
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white hover:opacity-95 shadow-md shadow-[#E63E8C]/20 transition-all"
            >
              Sign In
            </button>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 text-[#FFF0F5] hover:text-[#E0B0FF] bg-[#392431] border border-[#5C354C] hover:border-[#E0B0FF] rounded-full transition-all"
            aria-label="Shopping Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.div
                  key={totalItems}
                  initial={{ scale: 0.5, y: 5 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-[#E63E8C] to-[#D94F7A] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-[#E63E8C]/50 border border-[#2A1B24]"
                >
                  {totalItems}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

