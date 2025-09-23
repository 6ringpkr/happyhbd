"use client";
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useState, useEffect } from 'react';

interface RsvpModalProps {
  uniqueId: string;
  initialStatus: 'Confirmed' | 'Declined' | 'Pending';
}

const RsvpModal = NiceModal.create(({ uniqueId, initialStatus }: RsvpModalProps) => {
  const modal = useModal();
  const [selectedStatus, setSelectedStatus] = useState<'Confirmed' | 'Declined' | 'Pending'>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent closing modal with Escape key since there's no close button
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('uniqueId', uniqueId);
      formData.append('status', selectedStatus);

      const res = await fetch('/api/rsvp', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json?.ok) {
        // Close modal and redirect
        modal.hide();
        const redirectUrl = `/thank-you?uniqueId=${encodeURIComponent(uniqueId)}&status=${encodeURIComponent(selectedStatus)}`;
        window.location.href = redirectUrl;
      } else {
        setError(json?.error || `Failed to submit RSVP (${res.status})`);
      }
    } catch (err) {
      setError('Network error - please try again');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsvp-modal-title"
      aria-describedby="rsvp-modal-description"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="text-center">
            <h2 id="rsvp-modal-title" className="text-xl font-semibold text-white">
              Will you be joining us?
            </h2>
            <p id="rsvp-modal-description" className="text-blue-100 text-sm mt-1">
              Please let us know your attendance
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3">
            {/* Accept Option */}
            <button
              onClick={() => setSelectedStatus('Confirmed')}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedStatus === 'Confirmed'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
              aria-pressed={selectedStatus === 'Confirmed'}
              aria-describedby="accept-description"
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedStatus === 'Confirmed' 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedStatus === 'Confirmed' && (
                    <span className="material-symbols-outlined text-white text-sm">check</span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">I will attend</div>
                  <div id="accept-description" className="text-sm opacity-75">Looking forward to celebrating with you!</div>
                </div>
                <span className="material-symbols-outlined text-green-500">celebration</span>
              </div>
            </button>

            {/* Decline Option */}
            <button
              onClick={() => setSelectedStatus('Declined')}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedStatus === 'Declined'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
              }`}
              aria-pressed={selectedStatus === 'Declined'}
              aria-describedby="decline-description"
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedStatus === 'Declined' 
                    ? 'border-red-500 bg-red-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedStatus === 'Declined' && (
                    <span className="material-symbols-outlined text-white text-sm">check</span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">I can't make it</div>
                  <div id="decline-description" className="text-sm opacity-75">Sorry, I won't be able to attend</div>
                </div>
                <span className="material-symbols-outlined text-red-500">cancel</span>
              </div>
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="polite">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={handleSubmit}
            disabled={!selectedStatus || isSubmitting}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default RsvpModal;