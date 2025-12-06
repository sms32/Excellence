'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    console.log('Dashboard - user:', user, 'loading:', loading);
    
    if (!loading && !user) {
      console.log('No user, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your space...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">W</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Women's Excellence Portal
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-lg">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border-2 border-purple-300"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user.displayName}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                  {userData && (
                    <p className="text-xs text-purple-600 font-medium">
                      Role: {userData.role}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSigningOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.displayName?.split(' ')[0]}! 🎉
          </h2>
          <p className="text-gray-600">This is your personal space in the portal</p>
          {userData && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-purple-100">
              <h3 className="font-semibold text-gray-800 mb-2">Your Account Info:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">User ID:</span>
                  <p className="font-mono text-xs text-gray-800">{userData.uid}</p>
                </div>
                <div>
                  <span className="text-gray-600">Account Status:</span>
                  <p className="font-semibold text-green-600">
                    {userData.isActive ? '✓ Active' : '✗ Inactive'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Member Since:</span>
                  <p className="text-gray-800">
                    {userData.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Last Login:</span>
                  <p className="text-gray-800">
                    {userData.lastLogin?.toDate?.()?.toLocaleString() || 'Just now'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Voting Card */}
          <Link
            href="/voting"
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-t-4 border-pink-500 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Start Voting</h3>
              <div className="p-3 bg-pink-100 rounded-lg">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 mb-4">Cast your vote for Women's Excellence Awards</p>
            <div className="text-pink-600 font-medium hover:text-pink-700 flex items-center gap-1">
              Begin Voting
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Profile Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Your Profile</h3>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 mb-4">Manage your personal information and preferences</p>
            <button className="text-purple-600 font-medium hover:text-purple-700 flex items-center gap-1">
              Manage Profile
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Resources Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-t-4 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Your Resources</h3>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 mb-4">Saved materials and learning resources</p>
            <button className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
              Browse Resources
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Personal Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Your Personal Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">Events Registered</p>
              <p className="text-3xl font-bold text-purple-900">0</p>
              <p className="text-xs text-purple-600 mt-1">Start exploring events!</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
              <p className="text-sm text-pink-700 font-medium">Events Attended</p>
              <p className="text-3xl font-bold text-pink-900">0</p>
              <p className="text-xs text-pink-600 mt-1">Join your first event</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
              <p className="text-sm text-indigo-700 font-medium">Resources Saved</p>
              <p className="text-3xl font-bold text-indigo-900">0</p>
              <p className="text-xs text-indigo-600 mt-1">Save helpful resources</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Achievements</p>
              <p className="text-3xl font-bold text-green-900">0</p>
              <p className="text-xs text-green-600 mt-1">Earn your first badge</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
