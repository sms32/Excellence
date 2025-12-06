'use client';

import { useEffect, useState } from 'react';
import { 
  getVotingSettings, 
  openVoting, 
  closeVoting
} from '@/lib/services/adminService';
import { VotingSettings } from '@/lib/types/voting';

export default function VotingControlPage() {
  const [settings, setSettings] = useState<VotingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closedMessage, setClosedMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getVotingSettings();
      setSettings(data);
      setClosedMessage(data.closedMessage || '');
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVoting = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to OPEN voting?\n\nUsers will be able to cast their votes.'
    );
    
    if (!confirmed) return;
    
    setUpdating(true);
    setError('');
    
    try {
      await openVoting();
      await loadSettings();
    } catch (error: any) {
      setError(error.message || 'Failed to open voting');
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseVoting = async () => {
    if (!closedMessage.trim()) {
      setError('Please enter a message to display when voting is closed');
      return;
    }

    setUpdating(true);
    setError('');
    
    try {
      await closeVoting(closedMessage.trim());
      await loadSettings();
      setShowCloseModal(false);
    } catch (error: any) {
      setError(error.message || 'Failed to close voting');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: '#D4AF37' }}
          />
          <p className="mt-4" style={{ color: '#E8E8E8' }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div 
        className="rounded-xl shadow-md p-12 text-center"
        style={{ 
          background: 'rgba(4, 29, 26, 0.95)',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <span className="text-6xl mb-4 block">⚙️</span>
        <h3 className="text-xl font-bold mb-2" style={{ color: '#D4AF37' }}>
          Failed to Load Settings
        </h3>
        <p className="mb-6" style={{ color: '#94A3B8' }}>
          Please refresh the page and try again.
        </p>
        <button
          onClick={loadSettings}
          className="px-6 py-3 rounded-lg font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
            color: '#021210',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(212, 175, 55, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#D4AF37', letterSpacing: '0.02em' }}>
          Voting Control
        </h1>
        <p className="mt-1" style={{ color: '#94A3B8' }}>
          Manage voting status and display messages
        </p>
      </div>

      {error && (
        <div 
          className="p-4 rounded-lg flex items-start gap-3"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          <svg 
            className="w-6 h-6 flex-shrink-0 mt-0.5" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            style={{ color: '#EF4444' }}
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold" style={{ color: '#FCA5A5' }}>Error</p>
            <p style={{ color: '#FCA5A5' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Current Status */}
      <div 
        className="rounded-xl shadow-lg p-8"
        style={{
          background: settings.isOpen 
            ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
            : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
        }}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255, 255, 255, 0.2)' }}
            >
              <span className="text-5xl">{settings.isOpen ? '🟢' : '🔴'}</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Voting is {settings.isOpen ? 'OPEN' : 'CLOSED'}
              </h2>
              <p style={{ opacity: 0.9 }}>
                {settings.isOpen 
                  ? `Opened on ${settings.openedAt?.toDate?.()?.toLocaleString() || 'Unknown'}`
                  : `Closed on ${settings.closedAt?.toDate?.()?.toLocaleString() || 'Unknown'}`
                }
              </p>
            </div>
          </div>
          
          <div>
            {settings.isOpen ? (
              <button
                onClick={() => setShowCloseModal(true)}
                disabled={updating}
                className="px-8 py-4 rounded-lg font-bold text-lg disabled:opacity-50 flex items-center gap-3 shadow-xl transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#DC2626',
                  cursor: updating ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!updating) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Close Voting</span>
              </button>
            ) : (
              <button
                onClick={handleOpenVoting}
                disabled={updating}
                className="px-8 py-4 rounded-lg font-bold text-lg disabled:opacity-50 flex items-center gap-3 shadow-xl transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#16A34A',
                  cursor: updating ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!updating) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Open Voting</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Closed Message Configuration */}
      <div 
        className="rounded-xl shadow-lg p-8"
        style={{ 
          background: 'rgba(4, 29, 26, 0.95)',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="p-3 rounded-lg"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: '#EF4444' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#E8E8E8' }}>
              Voting Closed Message
            </h3>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              This message will be displayed when voting is closed
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#B8956D' }}
            >
              Closed Message
            </label>
            <textarea
              value={closedMessage}
              onChange={(e) => setClosedMessage(e.target.value)}
              placeholder="Enter the message to display when voting is closed..."
              className="w-full px-4 py-3 rounded-lg h-32 resize-none transition-all"
              style={{
                background: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#E8E8E8',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
              }}
              maxLength={500}
            />
            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
              {closedMessage.length}/500 characters
            </p>
          </div>

          {/* Preview */}
          <div 
            className="rounded-lg p-6"
            style={{ 
              background: 'rgba(107, 114, 128, 0.2)',
              border: '2px dashed rgba(212, 175, 55, 0.3)'
            }}
          >
            <p 
              className="text-xs mb-2 font-semibold uppercase"
              style={{ color: '#94A3B8' }}
            >
              Preview
            </p>
            <div 
              className="rounded-lg p-4"
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <div className="flex items-start gap-3">
                <svg 
                  className="w-6 h-6 flex-shrink-0 mt-0.5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  style={{ color: '#EF4444' }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-bold mb-1" style={{ color: '#FCA5A5' }}>
                    Voting Closed
                  </p>
                  <p style={{ color: '#FCA5A5' }}>
                    {closedMessage || 'Your message will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close Voting Modal */}
      {showCloseModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div 
            className="rounded-xl shadow-2xl max-w-lg w-full"
            style={{ 
              background: 'rgba(4, 29, 26, 0.98)',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            <div 
              className="px-6 py-4 flex justify-between items-center rounded-t-xl"
              style={{ 
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
              }}
            >
              <h2 className="text-xl font-bold text-white">Close Voting</h2>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-white rounded-lg p-1 transition-all"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div 
                className="rounded-lg p-4"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <div className="flex items-start gap-3">
                  <svg 
                    className="w-6 h-6 flex-shrink-0 mt-0.5" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    style={{ color: '#EF4444' }}
                  >
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-bold mb-1" style={{ color: '#FCA5A5' }}>
                      Warning
                    </p>
                    <p className="text-sm" style={{ color: '#FCA5A5' }}>
                      This will immediately prevent all users from voting. Make sure the message below is correct.
                    </p>
                  </div>
                </div>
              </div>

              <p style={{ color: '#E8E8E8' }}>
                Confirm that you want to close voting. The following message will be displayed to users:
              </p>

              <div 
                className="rounded-lg p-4"
                style={{ 
                  background: 'rgba(107, 114, 128, 0.2)',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <p className="font-medium" style={{ color: '#E8E8E8' }}>
                  {closedMessage || 'No message set'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 px-6 py-3 rounded-lg font-medium transition-all"
                  style={{
                    background: 'rgba(107, 114, 128, 0.3)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#E8E8E8',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseVoting}
                  disabled={updating || !closedMessage.trim()}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: updating || !closedMessage.trim() 
                      ? 'rgba(239, 68, 68, 0.5)' 
                      : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    cursor: updating || !closedMessage.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!updating && closedMessage.trim()) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 25px rgba(239, 68, 68, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  {updating ? (
                    <>
                      <div 
                        className="animate-spin rounded-full h-5 w-5 border-b-2"
                        style={{ borderColor: 'white' }}
                      />
                      <span>Closing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Close Voting Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
