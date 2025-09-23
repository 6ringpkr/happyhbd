"use client";
import NiceModal from '@ebay/nice-modal-react';
import RsvpModal from './RsvpModal';
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

  const handleRsvpSubmit = async (status: 'Confirmed' | 'Declined' | 'Pending') => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('uniqueId', guest.uniqueId);
      formData.append('status', status);

      const res = await fetch('/api/rsvp', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.ok) {
          // Redirect to thank you page
          const redirectUrl = `/thank-you?uniqueId=${encodeURIComponent(guest.uniqueId)}&status=${encodeURIComponent(status)}`;
          window.location.href = redirectUrl;
        } else {
          window.location.href = '/thank-you';
        }
      } else {
        const errorText = await res.text().catch(() => '');
        alert(errorText || 'Failed to submit RSVP');
      }
    } catch (error) {
      console.error('RSVP submission error:', error);
      alert('Network error - please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showRsvpModal = () => {
    NiceModal.show(RsvpModal, {
      uniqueId: guest.uniqueId,
      initialStatus: guest.status
    });
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
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button
          onClick={showRsvpModal}
          disabled={isSubmitting}
          className="invite-button primary"
          style={{ 
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            minHeight: '48px', // Better touch target
            width: '100%',
            maxWidth: '280px'
          }}
          aria-label="Open RSVP form to respond to invitation"
        >
          {isSubmitting ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTop: '2px solid white', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }} />
              Submitting...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">rsvp</span>
              RSVP Now
            </div>
          )}
        </button>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
