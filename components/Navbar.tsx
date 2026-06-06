
import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface NavbarProps {
  onNavigate: (path: string) => void;
  onOpenAuth: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenAuth }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Product', path: '/product' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Support', path: '/support' },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-6xl rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border ring-1 ring-inset ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-white/60 ring-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-3'
          : 'bg-white/40 backdrop-blur-lg border-white/40 ring-white/10 shadow-none py-4'
      }`}
    >
      <div className="px-4 sm:px-6 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#/"
          onClick={(e) => handleNavClick(e, '/')}
          className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Shield className="w-6 sm:w-7 h-6 sm:h-7 text-yellow-600 fill-yellow-600/15 group-hover:fill-yellow-600/40 group-hover:scale-125 transition-all duration-300" />
          </div>
          <span className="text-base sm:text-lg md:text-[18px] font-extrabold tracking-tight text-slate-950 transition-all duration-300 group-hover:text-yellow-600 group-hover:scale-105">
            SunnSafe
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={`#${link.path}`}
              onClick={(e) => handleNavClick(e, link.path)}
              className="relative text-sm lg:text-[14px] font-bold text-slate-600 hover:text-slate-900 transition-all duration-300 group tracking-tight hover:scale-110"
            >
              {link.name}
              <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-yellow-600 transition-all duration-400 group-hover:w-full rounded-full" />
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {user ? (
            <>
              <button
                onClick={() => onNavigate('/dashboard')}
                className="rounded-lg bg-yellow-600 px-5 py-2.5 text-xs lg:text-[13px] font-bold text-white transition-all duration-300 hover:bg-yellow-700 hover:shadow-lg hover:-translate-y-0.5 hover:scale-110 active:scale-95 flex items-center gap-2 group"
              >
                <LayoutDashboard size={14} className="group-hover:scale-125 transition-transform" />
                <span className="hidden lg:inline">Dashboard</span>
              </button>
              <button
                onClick={handleSignOut}
                className="p-2.5 text-slate-500 hover:text-yellow-600 hover:bg-yellow-100 transition-all duration-300 rounded-lg hover:scale-110 active:scale-95"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="rounded-lg bg-yellow-600 px-6 py-2.5 text-xs lg:text-[13px] font-bold text-white transition-all duration-300 hover:bg-yellow-700 hover:shadow-lg hover:shadow-yellow-600/40 hover:-translate-y-0.5 hover:scale-110 active:scale-95 group"
            >
              <span className="group-hover:inline-block">Get Started</span>
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-500 hover:text-yellow-600 hover:bg-yellow-100 transition-all rounded-lg hover:scale-110 active:scale-95"
          >
            {isMobileMenuOpen ? <X size={24} className="animate-spin-slow" /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-white/97 backdrop-blur-2xl border-2 border-white/80 p-4 sm:p-6 md:hidden flex flex-col gap-4 shadow-2xl rounded-2xl animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-300">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={`#${link.path}`}
              className="text-slate-600 hover:text-yellow-600 hover:bg-yellow-100 font-bold py-3 px-3 text-base transition-all border-b border-slate-100 last:border-0 text-center rounded-lg hover:scale-105 active:scale-95"
              onClick={(e) => handleNavClick(e, link.path)}
            >
              {link.name}
            </a>
          ))}

          {user ? (
            <>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('/dashboard');
                }}
                className="w-full mt-2 rounded-lg bg-yellow-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-yellow-700 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                <LayoutDashboard size={16} className="group-hover:scale-125 transition-transform" />
                Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="w-full rounded-lg border-2 border-yellow-200 px-6 py-3.5 text-sm font-bold text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 hover:border-yellow-300 hover:-translate-y-0.5 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                <LogOut size={16} className="group-hover:scale-125 transition-transform" />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full mt-2 rounded-lg bg-yellow-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-yellow-700 hover:shadow-lg hover:shadow-yellow-600/40 hover:-translate-y-0.5 hover:scale-105 transition-all active:scale-95 shadow-md"
            >
              Get Started Free
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
