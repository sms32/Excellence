'use client';

import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/utils/adminCheck';
import Image from 'next/image';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleCastVote = () => {
    if (loading) return;

    if (user) {
      if (isAdmin(user.email)) {
        router.push('/admin');
      } else {
        router.push('/voting');
      }
    } else {
      router.push('/login');
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
        fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
      }}
    >
      {/* Subtle Depth Overlay - Darker */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(6, 39, 36, 0.5) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(2, 18, 16, 0.6) 0%, transparent 50%)'
        }}
      />

      {/* Darker Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(2, 18, 16, 0.5) 100%)'
        }}
      />

      {/* Minimal Texture */}
      <div className="absolute inset-0 opacity-[0.01]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.3"/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat'
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen">
        {/* Desktop Layout (Side by Side) */}
        <div className="hidden lg:flex items-center justify-between px-12 xl:px-20 max-w-[1350px] mx-auto min-h-screen py-20">
          {/* Left Side - Text & Button */}
          <div className="flex-1 space-y-8 max-w-xl">
            {/* Title */}
            <div className="space-y-3">
              <h1 
                className="text-6xl xl:text-7xl font-normal leading-[0.95]"
                style={{ 
                  color: '#D4AF37',
                  textShadow: '0 1px 10px rgba(212, 175, 55, 0.12)',
                  letterSpacing: '0.02em'
                }}
              >
                WOMEN&apos;S
              </h1>
              <h1 
                className="text-6xl xl:text-7xl font-normal leading-[0.95]"
                style={{ 
                  color: '#D4AF37',
                  textShadow: '0 1px 10px rgba(212, 175, 55, 0.12)',
                  letterSpacing: '0.02em'
                }}
              >
                EXCELLENCE
              </h1>
              <h1 
                className="text-6xl xl:text-7xl font-normal leading-[0.95]"
                style={{ 
                  color: '#D4AF37',
                  textShadow: '0 1px 10px rgba(212, 175, 55, 0.12)',
                  letterSpacing: '0.02em'
                }}
              >
                AWARDS
              </h1>
            </div>

            {/* Subtitle */}
            <p 
              className="text-xl xl:text-2xl font-light"
              style={{ 
                color: '#E8E8E8',
                letterSpacing: '0.22em',
                textShadow: '0 1px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              HONOURING OUTSTANDING WOMEN
            </p>

            {/* Button with Enhanced Hover */}
            <div className="pt-6">
              <button
                onClick={handleCastVote}
                disabled={loading}
                className="group relative px-11 py-4 bg-transparent rounded-lg overflow-hidden disabled:opacity-50"
                style={{
                  border: '2px solid rgba(212, 175, 55, 0.6)',
                  boxShadow: '0 2px 15px rgba(212, 175, 55, 0.08)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.border = '2px solid rgba(212, 175, 55, 1)';
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.12)';
                    e.currentTarget.style.boxShadow = '0 8px 35px rgba(212, 175, 55, 0.25)';
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '2px solid rgba(212, 175, 55, 0.6)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 2px 15px rgba(212, 175, 55, 0.08)';
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                }}
              >
                <span 
                  className="relative text-2xl font-light"
                  style={{ 
                    color: '#D4AF37',
                    letterSpacing: '0.28em',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? 'LOADING...' : 'CAST YOUR VOTE'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Side - Trophy (Extra Top Space) */}
          <div className="flex-1 flex items-center justify-center pt-16 pb-8">
            <div className="relative w-[380px] h-[460px]">
              <Image
                src="/trophy.png"
                alt="Excellence Trophy"
                fill
                className="object-contain object-center"
                style={{ filter: 'drop-shadow(0 5px 25px rgba(212, 175, 55, 0.1))' }}
                priority
              />
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout (Stacked) */}
       {/* Mobile/Tablet Layout (Stacked) */}
<div className="lg:hidden flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
  {/* Title */}
  <div className="space-y-2 mb-6">
    <h1 
      className="text-4xl sm:text-5xl font-normal leading-[0.95]"
      style={{ 
        color: '#D4AF37',
        textShadow: '0 1px 10px rgba(212, 175, 55, 0.12)',
        letterSpacing: '0.02em'
      }}
    >
      WOMEN&apos;S
    </h1>
    <h1 
      className="text-4xl sm:text-5xl font-normal leading-[0.95]"
      style={{ 
        color: '#D4AF37',
        textShadow: '0 1px 10px rgba(212, 175, 55, 0.12)',
        letterSpacing: '0.02em'
      }}
    >
      EXCELLENCE
    </h1>
    <h1 
      className="text-4xl sm:text-5xl font-normal leading-[0.95]"
      style={{ 
        color: '#D4AF37',
        textShadow: '0 1px 10px rgba(212, 175, 55, 0.12)',
        letterSpacing: '0.02em'
      }}
    >
      AWARDS
    </h1>
  </div>

  {/* Trophy in Middle (Reduced Top Space) */}
  <div className="relative mb-8 pt-2">
    <div className="relative w-[200px] h-[250px] sm:w-[240px] sm:h-[290px]">
      <Image
  src="/trophy.png"
  alt="Excellence Trophy"
  fill
  className="object-contain object-center"
  priority
/>

    </div>
  </div>

  {/* Subtitle */}
  <p 
    className="text-sm sm:text-base font-light mb-10"
    style={{ 
      color: '#E8E8E8',
      letterSpacing: '0.18em',
      textShadow: '0 1px 8px rgba(0, 0, 0, 0.3)'
    }}
  >
    HONOURING OUTSTANDING WOMEN
  </p>

  {/* Button with Enhanced Hover */}
  <button
    onClick={handleCastVote}
    disabled={loading}
    className="group relative px-9 py-3 bg-transparent rounded-lg overflow-hidden"
    style={{
      border: '2px solid rgba(212, 175, 55, 0.6)',
      boxShadow: '0 2px 15px rgba(212, 175, 55, 0.08)',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease'
    }}
    onMouseEnter={(e) => {
      if (!loading) {
        e.currentTarget.style.border = '2px solid rgba(212, 175, 55, 1)';
        e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.12)';
        e.currentTarget.style.boxShadow = '0 8px 35px rgba(212, 175, 55, 0.25)';
        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.border = '2px solid rgba(212, 175, 55, 0.6)';
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.boxShadow = '0 2px 15px rgba(212, 175, 55, 0.08)';
      e.currentTarget.style.transform = 'scale(1) translateY(0)';
    }}
  >
    <span 
      className="relative text-lg sm:text-xl font-light"
      style={{ 
        color: '#D4AF37',
        letterSpacing: '0.28em',
        transition: 'all 0.3s ease'
      }}
    >
      {loading ? 'LOADING...' : 'CAST YOUR VOTE'}
    </span>
  </button>
</div>

      </div>
    </div>
  );
}
