import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, Sparkles } from 'lucide-react';
import { signIn, signUp } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'signin' | 'signup';

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const switchRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial page load animation
    const tl = gsap.timeline();
    
    tl.set([titleRef.current, subtitleRef.current, fieldsRef.current, buttonRef.current, switchRef.current], {
      opacity: 0,
      y: 30
    })
    .set(cardRef.current, {
      scale: 0.9,
      opacity: 0
    })
    .to(backgroundRef.current, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    })
    .to(cardRef.current, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "-=0.4")
    .to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.3")
    .to(subtitleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.4")
    .to(fieldsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.3")
    .to(buttonRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.4")
    .to(switchRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.4");

    // Floating animation for background elements
    gsap.to(".floating-element", {
      y: "-=20",
      duration: 3,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.5
    });
  }, []);

  const handleModeSwitch = (newMode: AuthMode) => {
    if (newMode === authMode) return;
    
    setAuthError(null);
    
    // Animate mode switch
    const tl = gsap.timeline();
    
    tl.to([titleRef.current, fieldsRef.current, buttonRef.current], {
      opacity: 0,
      x: authMode === 'signin' ? -30 : 30,
      duration: 0.3,
      ease: "power2.in"
    })
    .call(() => {
      setAuthMode(newMode);
      if (newMode === 'signin') {
        setFormData({ email: formData.email, password: '', confirmPassword: '' });
      }
    })
    .to([titleRef.current, fieldsRef.current, buttonRef.current], {
      opacity: 1,
      x: 0,
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    
    if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    // Button loading animation
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    try {
      let result;
      if (authMode === 'signin') {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password);
      }

      if (result.error) {
        setAuthError(result.error.message);
        // Error shake animation
        gsap.to(formRef.current, {
          x: [-10, 10, -10, 10, 0],
          duration: 0.5,
          ease: "power2.out"
        });
      } else if (result.data.user) {
        // Success animation
        const tl = gsap.timeline();
        tl.to(cardRef.current, {
          scale: 1.05,
          duration: 0.2,
          ease: "power2.out"
        })
        .to(cardRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        })
        .to(containerRef.current, {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => onAuthSuccess(result.data.user!)
        });
      }
    } catch {
      setAuthError('An unexpected error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div 
      ref={backgroundRef}
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ opacity: 0 }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
        <div className="floating-element absolute top-40 right-32 w-24 h-24 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
        <div className="floating-element absolute bottom-32 left-32 w-40 h-40 bg-indigo-200 rounded-full opacity-20 blur-xl"></div>
        <div className="floating-element absolute bottom-20 right-20 w-28 h-28 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
      </div>

      {/* Main Container */}
      <div ref={containerRef} className="relative z-10 w-full max-w-xs">
        {/* Auth Card */}
        <div 
          ref={cardRef}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 
              ref={titleRef}
              className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
            >
              {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p 
              ref={subtitleRef}
              className="text-gray-600"
            >
              {authMode === 'signin' 
                ? 'Sign in to your professional quote management system' 
                : 'Join our professional quote management platform'
              }
            </p>
          </div>

          {/* Auth Form */}
          <form ref={formRef} onSubmit={handleAuth} className="space-y-6">
            <div ref={fieldsRef} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Signup only) */}
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword || ''}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm animate-pulse">
                {authError}
              </div>
            )}

            {/* Submit Button */}
            <button
              ref={buttonRef}
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              {authLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {authMode === 'signin' ? (
                    <LogIn className="h-5 w-5" />
                  ) : (
                    <UserPlus className="h-5 w-5" />
                  )}
                  <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Mode Switch */}
          <div ref={switchRef} className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMode === 'signin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  authMode === 'signup'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};