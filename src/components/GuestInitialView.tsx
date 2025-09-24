"use client";
import { useState } from 'react';
import RsvpSection from './RsvpSection';

interface GuestInitialViewProps {
  guest: {
    uniqueId: string;
    name: string;
    status: 'Pending' | 'Confirmed' | 'Declined';
  };
  editMode: boolean;
}

export default function GuestInitialView({ guest, editMode }: GuestInitialViewProps) {
  const [showRsvp, setShowRsvp] = useState(false);

  // If guest has already RSVP'd or in edit mode, show RSVP section directly
  if (guest.status !== 'Pending' || editMode) {
    return <RsvpSection guest={guest} editMode={editMode} />;
  }

  // Initial view - show RSVP button to reveal the form
  return (
    <div className="rsvp-form">
      <h3><span className="material-symbols-outlined">rsvp</span> Will you be joining us?</h3>
      <p style={{ marginBottom: '1rem', fontSize: '14px', color: '#666', textAlign: 'center' }}>
        Please let us know if you'll be attending the dedication ceremony.
      </p>
      
      {!showRsvp ? (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setShowRsvp(true)}
            className="invite-button primary"
            style={{ 
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #1c82ff 0%, #0f62fe 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(28, 130, 255, 0.3)',
              minHeight: '48px',
              width: '100%',
              maxWidth: '280px'
            }}
            aria-label="Open RSVP form to respond to invitation"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <span className="material-symbols-outlined">rsvp</span>
              RSVP Now
            </div>
          </button>
        </div>
      ) : (
        <RsvpSection guest={guest} editMode={editMode} />
      )}
    </div>
  );
}
