"use client";
import { useState } from 'react';

interface RsvpSectionProps {
  guest: {
    uniqueId: string;
    name: string;
    status: 'Pending' | 'Confirmed' | 'Declined';
  };
  editMode: boolean;
}

export default function RsvpSection({ guest, editMode }: RsvpSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'Confirmed' | 'Declined' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRsvpSubmit = async (status: 'Confirmed' | 'Declined') => {
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('uniqueId', guest.uniqueId);
      formData.append('status', status);

      const res = await fetch('/api/rsvp', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json?.ok) {
        // Redirect to thank you page
        const redirectUrl = `/thank-you?uniqueId=${encodeURIComponent(guest.uniqueId)}&status=${encodeURIComponent(status)}`;
        window.location.href = redirectUrl;
      } else {
        setError(json?.error || `Failed to submit RSVP (${res.status})`);
      }
    } catch (error) {
      console.error('RSVP submission error:', error);
      setError('Network error - please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (guest.status !== 'Pending' && !editMode) {
    return (
      <div className="rsvp-confirmed">
        <h3><span className="material-symbols-outlined">celebration</span> Thank you for your response!</h3>
        <p>Your status: <strong>{guest.status}</strong></p>
        <div className="qr-section" style={{ marginTop: 12 }}>
          <h3><span className="material-symbols-outlined">qr_code</span> Save Your Invitation</h3>
          <div className="qr-code">
            <img alt="Invitation QR Code" src={`/api/qr?url=/invites/${guest.uniqueId}&size=144`} width={144} height={144} style={{ borderRadius: 8 }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: 8 }}>
            <a href={`/api/qr?url=/invites/${guest.uniqueId}&size=512`} download={`invitation-${guest.uniqueId}.png`} className="invite-button primary">
              <span className="material-symbols-outlined">download</span> Download QR
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rsvp-form">
      <h3><span className="material-symbols-outlined">rsvp</span> Will you be joining us?</h3>
      
      {isSubmitting ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '12px',
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #1c82ff 0%, #0f62fe 100%)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(28, 130, 255, 0.3)',
          marginTop: '1rem'
        }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid rgba(255,255,255,0.3)', 
            borderTop: '2px solid white', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }} />
          Submitting...
        </div>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
            {/* Accept Option */}
            <button
              onClick={() => {
                setSelectedStatus('Confirmed');
                handleRsvpSubmit('Confirmed');
              }}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedStatus === 'Confirmed'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                background: selectedStatus === 'Confirmed' ? '#f0fdf4' : 'white',
                borderColor: selectedStatus === 'Confirmed' ? '#22c55e' : '#e5e7eb',
                color: selectedStatus === 'Confirmed' ? '#15803d' : '#374151'
              }}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedStatus === 'Confirmed' 
                  ? 'border-green-500 bg-green-500' 
                  : 'border-gray-300'
              }`}>
                {selectedStatus === 'Confirmed' && (
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">I will attend</div>
                <div className="text-sm opacity-75">Looking forward to celebrating with you!</div>
              </div>
              <span className="material-symbols-outlined text-green-500">celebration</span>
            </button>

            {/* Decline Option */}
            <button
              onClick={() => {
                setSelectedStatus('Declined');
                handleRsvpSubmit('Declined');
              }}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedStatus === 'Declined'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
              }`}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                background: selectedStatus === 'Declined' ? '#fef2f2' : 'white',
                borderColor: selectedStatus === 'Declined' ? '#ef4444' : '#e5e7eb',
                color: selectedStatus === 'Declined' ? '#dc2626' : '#374151'
              }}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedStatus === 'Declined' 
                  ? 'border-red-500 bg-red-500' 
                  : 'border-gray-300'
              }`}>
                {selectedStatus === 'Declined' && (
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">I can't make it</div>
                <div className="text-sm opacity-75">Sorry, I won't be able to attend</div>
              </div>
              <span className="material-symbols-outlined text-red-500">cancel</span>
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="polite">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
