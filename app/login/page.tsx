// 'use client';

// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useRouter } from 'next/navigation';
// import { isAdmin } from '@/lib/utils/adminCheck';

// export default function LoginPage() {
//   const [error, setError] = useState('');
//   const [isSigningIn, setIsSigningIn] = useState(false);
//   const { user, loading, signInWithGoogle } = useAuth();
//   const router = useRouter();

//   // Redirect when user is authenticated
//   useEffect(() => {
//     console.log('Login page - user:', user, 'loading:', loading);
    
//     if (!loading && user) {
//       // Check if user is admin
//       if (isAdmin(user.email)) {
//         console.log('Admin detected, redirecting to admin panel');
//         router.push('/admin');
//       } else {
//         console.log('Regular user, redirecting to voting page');
//         router.push('/voting');
//       }
//     }
//   }, [user, loading, router]);

//   const handleGoogleSignIn = async () => {
//     if (isSigningIn) return;
    
//     setError('');
//     setIsSigningIn(true);

//     try {
//       await signInWithGoogle();
//       console.log('Sign in initiated');
//       // The useEffect will handle redirect when user state updates
//     } catch (err: unknown) {
//       console.error('Sign in error:', err);
//       const message = err instanceof Error ? err.message : String(err);
//       setError(message || 'Failed to sign in with Google. Please ensure you are using a @karunya.edu or @karunya.edu.in email.');
//       setIsSigningIn(false);
//     }
//   };

//   // Show loading while checking auth state
//   if (loading) {
//     return (
//       <div 
//         className="min-h-screen flex items-center justify-center"
//         style={{ 
//           background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
//           fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
//         }}
//       >
//         <div className="text-center">
//           <div 
//             className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
//             style={{ borderColor: '#D4AF37' }}
//           ></div>
//           <p className="mt-4 text-gray-300">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Don't show login form if already logged in
//   if (user) {
//     return (
//       <div 
//         className="min-h-screen flex items-center justify-center"
//         style={{ 
//           background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
//           fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
//         }}
//       >
//         <div className="text-center">
//           <div 
//             className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
//             style={{ borderColor: '#D4AF37' }}
//           ></div>
//           <p className="mt-4 text-gray-300">
//             {isAdmin(user.email) ? 'Redirecting to admin panel...' : 'Redirecting to voting page...'}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div 
//       className="min-h-screen flex items-center justify-center p-4"
//       style={{ 
//         background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
//         fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
//       }}
//     >
//       {/* Subtle Overlays */}
//       <div 
//         className="absolute inset-0 opacity-40"
//         style={{
//           background: 'radial-gradient(ellipse at top right, rgba(6, 39, 36, 0.5) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(2, 18, 16, 0.6) 0%, transparent 50%)'
//         }}
//       />
      
//       <div 
//         className="max-w-md w-full space-y-8 p-10 rounded-2xl shadow-2xl relative z-10"
//         style={{
//           background: 'rgba(4, 29, 26, 0.9)',
//           border: '1px solid rgba(212, 175, 55, 0.2)',
//           backdropFilter: 'blur(10px)'
//         }}
//       >
//         <div className="text-center">
//           <div 
//             className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6"
//             style={{
//               background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
//               boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)'
//             }}
//           >
//             <span className="text-[#021210] text-3xl font-bold">W</span>
//           </div>
//           <h2 
//             className="text-3xl font-bold mb-2"
//             style={{ color: '#D4AF37' }}
//           >
//             Women&apos;s Excellence Awards
//           </h2>
//           <p className="text-sm" style={{ color: '#E8E8E8' }}>
//             Karunya University Polling Portal
//           </p>
//         </div>
        
//         <div className="mt-8 space-y-6">
//           <div 
//             className="rounded-lg p-4"
//             style={{
//               background: 'rgba(212, 175, 55, 0.1)',
//               border: '1px solid rgba(212, 175, 55, 0.3)'
//             }}
//           >
//             <div className="flex items-center justify-center gap-2 mb-2">
              
              
//             </div>
//             <p className="text-xs text-center" style={{ color: '#B8956D' }}>
//               Sign in with your @karunya.edu or @karunya.edu.in or kate email
//             </p>
//           </div>
          
//           {error && (
//             <div 
//               className="p-4 rounded-lg text-sm flex items-start gap-2"
//               style={{
//                 background: 'rgba(239, 68, 68, 0.1)',
//                 border: '1px solid rgba(239, 68, 68, 0.3)',
//                 color: '#FCA5A5'
//               }}
//             >
//               <svg 
//                 className="w-5 h-5 flex-shrink-0 mt-0.5" 
//                 fill="currentColor" 
//                 viewBox="0 0 20 20"
//                 style={{ color: '#EF4444' }}
//               >
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
//               </svg>
//               <span>{error}</span>
//             </div>
//           )}
          
//           <button
//             onClick={handleGoogleSignIn}
//             disabled={isSigningIn}
//             className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//             style={{
//               background: 'rgba(255, 255, 255, 0.95)',
//               border: '1px solid rgba(212, 175, 55, 0.3)',
//               cursor: isSigningIn ? 'not-allowed' : 'pointer',
//               boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
//               transition: 'all 0.3s ease'
//             }}
//             onMouseEnter={(e) => {
//               if (!isSigningIn) {
//                 e.currentTarget.style.transform = 'translateY(-2px)';
//                 e.currentTarget.style.boxShadow = '0 6px 25px rgba(212, 175, 55, 0.3)';
//               }
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.transform = 'translateY(0)';
//               e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
//             }}
//           >
//             {isSigningIn ? (
//               <>
//                 <div 
//                   className="animate-spin rounded-full h-5 w-5 border-b-2"
//                   style={{ borderColor: '#021210' }}
//                 ></div>
//                 <span 
//                   className="font-medium"
//                   style={{ color: '#021210' }}
//                 >
//                   Signing in...
//                 </span>
//               </>
//             ) : (
//               <>
//                 <svg className="w-5 h-5" viewBox="0 0 24 24">
//                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                 </svg>
//                 <span 
//                   className="font-medium"
//                   style={{ color: '#021210' }}
//                 >
//                   Sign in with Google
//                 </span>
//               </>
//             )}
//           </button>

//           <div className="text-xs text-center space-y-1" style={{ color: '#94A3B8' }}>
//             <p>By signing in, you agree to use your Karunya University email</p>
            
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// app/poll-closed/page.tsx
'use client';

import Link from "next/link";
import { Award, Sparkles } from "lucide-react";

export default function PollClosed() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        
        .bg-forest-gradient {
          background: linear-gradient(135deg, #010d0b 0%, #021410 20%, #031613 40%, #06221dff 60%, #062420ff 80%, #010d0b 100%);
        }
        .text-gradient-gold {
          background: linear-gradient(135deg, #D4AF37 0%, #e1c86fff 10%, #d4af37aa 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Montserrat', sans-serif; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes pulseSoft { 
          0%, 100% { opacity: 1; } 
          50% { opacity: 0.7; } 
        }
        .animate-fade-in-up { 
          animation: fadeInUp 0.8s ease-out forwards; 
        }
        .animate-fade-in { 
          animation: fadeIn 0.8s ease-out forwards; 
        }
        .animate-pulse-soft { 
          animation: pulseSoft 3s ease-in-out infinite; 
        }
      `}</style>
      
      <div className="min-h-screen bg-forest-gradient relative overflow-hidden">
        {/* Subtle Depth Overlay - Darker */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(4, 27, 24, 0.5) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(1, 13, 11, 0.6) 0%, transparent 50%)'
          }}
        />

        {/* Darker Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(1, 13, 11, 0.5) 100%)'
          }}
        />

        {/* Minimal Texture */}
        <div className="absolute inset-0 opacity-[0.01]">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulance type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.3"/%3E%3C/svg%3E")',
              backgroundRepeat: 'repeat'
            }}
          />
        </div>
        
        {/* Subtle glow overlay - REDUCED */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(212, 175, 55, 0.04) 0%, transparent 60%)'
          }}
        />
        
        {/* Decorative stars */}
        <div className="absolute top-20 left-[10%] animate-pulse-soft" style={{ color: 'rgba(212, 175, 55, 0.2)' }}>
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute top-40 right-[15%] animate-pulse-soft" style={{ animationDelay: '1s', color: 'rgba(212, 175, 55, 0.15)' }}>
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 left-[20%] animate-pulse-soft" style={{ animationDelay: '2s', color: 'rgba(212, 175, 55, 0.2)' }}>
          <Award className="w-10 h-10" />
        </div>
        
        <div className="container mx-auto px-6 lg:px-12 h-screen flex items-center justify-center py-8">
          <div className="max-w-4xl w-full text-center flex flex-col items-center justify-center gap-8">
            {/* Content */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Poll Closed Badge */}
              <div 
                className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full"
                style={{
                  border: '2px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 2px 12px rgba(212, 175, 55, 0.06)'
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: '#D4AF37' }}
                />
                <span 
                  className="font-sans text-xs tracking-[0.3em] uppercase"
                  style={{ color: '#D4AF37' }}
                >
                  Voting Closed
                </span>
              </div>
              
              {/* Main Heading */}
              <h1 
                className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-wide"
                style={{ 
                  textShadow: '0 1px 8px rgba(212, 175, 55, 0.08)',
                  letterSpacing: '0.02em'
                }}
              >
                <span className="text-gradient-gold">The Poll Has been</span>
                <br />
                <span className="text-gradient-gold">Closed</span>
              </h1>
              
              {/* Thank you message */}
              <div className="space-y-2 max-w-xl mx-auto">
                <p 
                  className="font-sans text-base sm:text-lg leading-relaxed"
                  style={{ 
                    color: '#E8E8E8',
                    textShadow: '0 1px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  Thank you for your incredible support and encouragement.
                </p>
                <p 
                  className="font-sans text-sm leading-relaxed"
                  style={{ 
                    color: 'rgba(232, 232, 232, 0.7)',
                    textShadow: '0 1px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  Your participation has made this celebration of women&apos;s excellence truly special.
                </p>
              </div>
              
              {/* Results Date */}
              <div className="flex justify-center pt-2">
                <div 
                  className="flex items-center gap-3 px-5 py-3 rounded-lg"
                  style={{
                    border: '2px solid rgba(212, 175, 55, 0.2)',
                    backgroundColor: 'rgba(212, 175, 55, 0.05)',
                    boxShadow: '0 2px 12px rgba(212, 175, 55, 0.06)'
                  }}
                >
                  <Award className="w-5 h-5" style={{ color: '#D4AF37' }} />
                  <span 
                    className="font-sans text-sm"
                    style={{ color: '#E8E8E8' }}
                  >
                    Results will be announced on <span className="font-semibold" style={{ color: '#D4AF37' }}>10th January</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Back button */}
            <div className="animate-fade-in pt-2" style={{ animationDelay: '0.5s' }}>
              <Link href="/">
                <button 
                  className="font-sans tracking-[0.2em] uppercase text-xs rounded-sm h-11 px-8 transition-all duration-500"
                  style={{
                    border: '2px solid rgba(212, 175, 55, 0.6)',
                    backgroundColor: 'transparent',
                    color: '#E8E8E8',
                    boxShadow: '0 2px 12px rgba(212, 175, 55, 0.06)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = '2px solid rgba(212, 175, 55, 1)';
                    e.currentTarget.style.color = '#D4AF37';
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.12)';
                    e.currentTarget.style.boxShadow = '0 6px 28px rgba(212, 175, 55, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '2px solid rgba(212, 175, 55, 0.6)';
                    e.currentTarget.style.color = '#E8E8E8';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(212, 175, 55, 0.06)';
                  }}
                >
                  Return to Home
                </button>
              </Link>
            </div>
            
            {/* Footer text */}
            <p 
              className="font-sans text-xs tracking-[0.2em] uppercase animate-fade-in font-medium" 
              style={{ 
                animationDelay: '0.7s',
                color: 'rgba(232, 232, 232, 0.6)'
              }}
            >
              Women&apos;s Excellence Awards
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
