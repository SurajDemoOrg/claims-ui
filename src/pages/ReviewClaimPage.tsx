import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReviewClaim } from '../components/ReviewClaim';
import { UploadedFile, ClaimFormData, ExtractedReceiptData } from '../App';

export function ReviewClaimPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { claimForm, receipts } = location.state as { 
    claimForm: UploadedFile | null; 
    receipts: UploadedFile[] 
  } || { claimForm: null, receipts: [] };

  const [formData, setFormData] = useState<ClaimFormData>({
    participantName: 'John Smith',
    dateOfService: '2024-08-15',
    providerName: 'General Medical Center',
    totalAmount: '245.50',
    description: 'Routine medical examination and blood work'
  });

  const extractedReceiptData = useMemo((): ExtractedReceiptData[] => {
    return receipts.map((receipt, index) => ({
      id: receipt.id,
      fileName: receipt.name,
      patientName: 'John Smith', // Matches the form data
      dateOfService: '2024-08-15', // Matches the form data
      providerName: 'General Medical Center', // Matches the form data
      totalCost: '$' + (index === 0 ? '145.50' : (100 + Math.floor(Math.random() * 100)).toString()), // First receipt matches, others are random
    }));
  }, [receipts]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Generate a new claim ID
    const claimId = `CL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // Create a new detailed claim object to store in localStorage for the detail view
    const newClaim = {
      id: claimId,
      dateSubmitted: new Date().toISOString().split('T')[0],
      claimantName: formData.participantName || 'New Claimant',
      totalAmount: '$' + formData.totalAmount,
      status: 'Pending Review' as const,
      formData,
      claimForm: claimForm!,
      receipts,
      extractedReceiptData
    };
    
    // Store the new claim data in localStorage for the detail view
    localStorage.setItem(`claim_${claimId}`, JSON.stringify(newClaim));
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success state
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Wait a bit for success animation then navigate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Navigate to the claim detail page
    navigate(`/claims/view/${claimId}`);
  };

  // If no data is passed, redirect to process page
  if (!claimForm && receipts.length === 0) {
    navigate('/claims/process');
    return null;
  }

  return (
    <div className="relative">
      <ReviewClaim
        claimForm={claimForm}
        receipts={receipts}
        extractedReceiptData={extractedReceiptData}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      
      {/* Submitting/Success Overlay */}
      {(isSubmitting || showSuccess) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl transform animate-in fade-in-0 zoom-in-95 duration-500">
            <div className="flex flex-col items-center space-y-4">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Submitting Your Claim</h3>
                    <p className="text-sm text-gray-600 mt-1">Please wait while we process your submission...</p>
                  </div>
                </>
              ) : showSuccess ? (
                <>
                  <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center animate-in zoom-in-0 duration-300">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-green-900">Claim Submitted Successfully!</h3>
                    <p className="text-sm text-green-600 mt-1">Redirecting to claim details...</p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
