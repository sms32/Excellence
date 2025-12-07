'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/utils/adminCheck';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Redirect when user is authenticated
  useEffect(() => {
    console.log('Login page - user:', user, 'loading:', loading);
    
    if (!loading && user) {
      // Check if user is admin
      if (isAdmin(user.email)) {
        console.log('Admin detected, redirecting to admin panel');
        router.push('/admin');
      } else {
        console.log('Regular user, redirecting to voting page');
        router.push('/voting');
      }
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    
    setError('');
    setIsSigningIn(true);

    try {
      await signInWithGoogle();
      console.log('Sign in initiated');
      // The useEffect will handle redirect when user state updates
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to sign in with Google. Please ensure you are using a @karunya.edu or @karunya.edu.in email.');
      setIsSigningIn(false);
    }
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
          fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
        }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: '#D4AF37' }}
          ></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if already logged in
  if (user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
          fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
        }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: '#D4AF37' }}
          ></div>
          <p className="mt-4 text-gray-300">
            {isAdmin(user.email) ? 'Redirecting to admin panel...' : 'Redirecting to voting page...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
        fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
      }}
    >
      {/* Subtle Overlays */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(6, 39, 36, 0.5) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(2, 18, 16, 0.6) 0%, transparent 50%)'
        }}
      />
      
      <div 
        className="max-w-md w-full space-y-8 p-10 rounded-2xl shadow-2xl relative z-10"
        style={{
          background: 'rgba(4, 29, 26, 0.9)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="text-center">
          <div 
            className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)'
            }}
          >
            <span className="text-[#021210] text-3xl font-bold">W</span>
          </div>
          <h2 
            className="text-3xl font-bold mb-2"
            style={{ color: '#D4AF37' }}
          >
            Women&apos;s Excellence Awards
          </h2>
          <p className="text-sm" style={{ color: '#E8E8E8' }}>
            Karunya University Polling Portal
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div 
            className="rounded-lg p-4"
            style={{
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              
              
            </div>
            <p className="text-xs text-center" style={{ color: '#B8956D' }}>
              Sign in with your @karunya.edu or @karunya.edu.in or kate email
            </p>
          </div>
          
          {error && (
            <div 
              className="p-4 rounded-lg text-sm flex items-start gap-2"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5'
              }}
            >
              <svg 
                className="w-5 h-5 flex-shrink-0 mt-0.5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                style={{ color: '#EF4444' }}
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              cursor: isSigningIn ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isSigningIn) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(212, 175, 55, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            }}
          >
            {isSigningIn ? (
              <>
                <div 
                  className="animate-spin rounded-full h-5 w-5 border-b-2"
                  style={{ borderColor: '#021210' }}
                ></div>
                <span 
                  className="font-medium"
                  style={{ color: '#021210' }}
                >
                  Signing in...
                </span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span 
                  className="font-medium"
                  style={{ color: '#021210' }}
                >
                  Sign in with Google
                </span>
              </>
            )}
          </button>

          <div className="text-xs text-center space-y-1" style={{ color: '#94A3B8' }}>
            <p>By signing in, you agree to use your Karunya University email</p>
            
          </div>
        </div>
      </div>
    </div>
  );
}
