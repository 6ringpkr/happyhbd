"use client";
import NiceModal from '@ebay/nice-modal-react';
import RsvpModal from './RsvpModal';
import { useState } from 'react';

interface GodparentAcceptFormProps {
  guest: {
    uniqueId: string;
    name: string;
    status: 'Pending' | 'Confirmed' | 'Declined';
  };
}

export default function GodparentAcceptForm({ guest }: GodparentAcceptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [showRsvpOptions, setShowRsvpOptions] = useState(false);
  const [selectedRsvpStatus, setSelectedRsvpStatus] = useState<'Confirmed' | 'Declined' | null>(null);

  const handleGodparentSubmit = async (isAccepting: boolean) => {
    if (isAccepting && !fullName.trim()) {
      alert('Please enter your full legal name to accept the godparent role.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('uniqueId', guest.uniqueId);
      formData.append('fullName', fullName.trim());
      
      if (isAccepting) {
        formData.append('accept', 'yes');
      } else {
        formData.append('decline', 'yes');
      }

      const res = await fetch('/api/godparent-accept', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.action === 'accepted') {
          // Show RSVP options inline instead of modal
          setShowRsvpOptions(true);
        } else {
          // Just redirect for decline
          window.location.reload();
        }
      } else {
        const errorText = await res.text().catch(() => '');
        alert(errorText || 'Failed to submit response');
      }
    } catch (error) {
      console.error('Godparent submission error:', error);
      alert('Network error - please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCombinedRsvpSubmit = async () => {
    if (!selectedRsvpStatus) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('uniqueId', guest.uniqueId);
      formData.append('status', selectedRsvpStatus);

      const res = await fetch('/api/rsvp', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.ok) {
          // Redirect to thank you page with both godparent and RSVP status
          const url = new URL(window.location.href);
          url.searchParams.set('accepted', '1');
          url.searchParams.set('rsvp', selectedRsvpStatus);
          window.location.href = url.toString();
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

  return (
    <div className="godparent-letter">
      <h3>A Special Request</h3>
      <p>We would be honored to have you as Ninong/Ninang. If you accept, please confirm your full legal name for the dedication certificate. Your information will remain private.</p>
      
      {!showRsvpOptions ? (
        <form style={{ marginTop: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '.75rem', alignItems: 'center' }}>
          <div id="accept-description" style={{ display: 'none' }}>Accept the godparent role and provide your full legal name</div>
          <div id="decline-description" style={{ display: 'none' }}>Decline the godparent role</div>
          <div style={{ position: 'relative', maxWidth: 360, width: '100%' }}>
            <label htmlFor="fullName" className="microcopy" style={{ display: 'block', textAlign: 'left', marginBottom: 4 }}>Full legal name</label>
            <input 
              id="fullName" 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full legal name" 
              className="invite-input" 
              style={{ maxWidth: 360 }}
              aria-describedby="fullName-help"
              required
            />
            <div id="fullName-help" className="microcopy" style={{ marginTop: 6 }}>Used only for the dedication certificate.</div>
          </div>
          
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              type="button"
              onClick={() => handleGodparentSubmit(true)}
              disabled={isSubmitting}
              className="invite-button confirm"
              style={{ 
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              aria-describedby="accept-description"
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
                  Accepting...
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined">check_circle</span> I accept to be Godparent
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => handleGodparentSubmit(false)}
              disabled={isSubmitting}
              className="invite-button decline"
              style={{ 
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              aria-describedby="decline-description"
            >
              <span className="material-symbols-outlined">cancel</span> I can't be a Godparent
            </button>
          </div>
        </form>
      ) : (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <div style={{ 
            background: '#f0f8ff', 
            border: '2px solid #4a90e2', 
            borderRadius: '12px', 
            padding: '1rem', 
            marginBottom: '1rem' 
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c5aa0' }}>
              <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>celebration</span>
              Thank you for accepting to be Godparent!
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Now, will you be able to attend the dedication ceremony?
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => setSelectedRsvpStatus('Confirmed')}
              className={`invite-button ${selectedRsvpStatus === 'Confirmed' ? 'confirm' : ''}`}
              style={{ 
                width: '100%',
                maxWidth: '320px',
                padding: '12px 24px',
                border: selectedRsvpStatus === 'Confirmed' ? '2px solid #28a745' : '2px solid #e9ecef',
                background: selectedRsvpStatus === 'Confirmed' ? '#28a745' : 'white',
                color: selectedRsvpStatus === 'Confirmed' ? 'white' : '#333',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>celebration</span>
              I accept and will attend
            </button>
            
            <button
              onClick={() => setSelectedRsvpStatus('Declined')}
              className={`invite-button ${selectedRsvpStatus === 'Declined' ? 'decline' : ''}`}
              style={{ 
                width: '100%',
                maxWidth: '320px',
                padding: '12px 24px',
                border: selectedRsvpStatus === 'Declined' ? '2px solid #dc3545' : '2px solid #e9ecef',
                background: selectedRsvpStatus === 'Declined' ? '#dc3545' : 'white',
                color: selectedRsvpStatus === 'Declined' ? 'white' : '#333',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>cancel</span>
              I accept but can't attend
            </button>
          </div>
          
          {selectedRsvpStatus && (
            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={handleCombinedRsvpSubmit}
                disabled={isSubmitting}
                className="invite-button primary"
                style={{ 
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
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
                  'Confirm Response'
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
