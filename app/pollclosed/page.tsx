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
                <span className="text-gradient-gold">The Poll Has</span>
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
