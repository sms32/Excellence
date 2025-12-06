'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { isAdmin } from '../../lib/utils/adminCheck';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.email))) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
          fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif',
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: '#D4AF37' }}
          />
          <p className="mt-4" style={{ color: '#E8E8E8' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin(user.email)) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/categories', label: 'Categories', icon: '📁' },
    { href: '/admin/candidates', label: 'Candidates', icon: '👥' },
    { href: '/admin/control', label: 'Voting Control', icon: '⚙️' },
  ];

  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
          'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
        fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif',
      }}
    >
      {/* Subtle Overlays */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(6, 39, 36, 0.5) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(2, 18, 16, 0.6) 0%, transparent 50%)',
        }}
      />

      {/* Top Navigation */}
      <nav
        className="relative z-20 shadow-lg"
        style={{
          background:
            'linear-gradient(135deg, rgba(4, 29, 26, 0.95) 0%, rgba(6, 39, 36, 0.98) 100%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)',
                }}
              >
                <span className="text-xl font-bold" style={{ color: '#021210' }}>
                  A
                </span>
              </div>
              <div>
                <h1
                  className="text-xl font-bold"
                  style={{ color: '#D4AF37', letterSpacing: '0.05em' }}
                >
                  Admin Panel
                </h1>
                <p className="text-xs" style={{ color: '#94A3B8' }}>
                  Women&apos;s Excellence Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="font-semibold" style={{ color: '#E8E8E8' }}>
                  {user.displayName}
                </p>
                <p className="text-xs" style={{ color: '#B8956D' }}>
                  Admin
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 pb-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-t-lg transition flex items-center gap-2 text-sm"
                  style={
                    isActive
                      ? {
                          background: 'rgba(4, 29, 26, 1)',
                          color: '#D4AF37',
                          borderTop: '1px solid rgba(212, 175, 55, 0.8)',
                          borderLeft: '1px solid rgba(212, 175, 55, 0.4)',
                          borderRight: '1px solid rgba(212, 175, 55, 0.4)',
                        }
                      : {
                          color: '#E8E8E8',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background =
                        'rgba(212, 175, 55, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div
          className="rounded-2xl shadow-2xl p-8"
          style={{
            background: 'rgba(4, 29, 26, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
