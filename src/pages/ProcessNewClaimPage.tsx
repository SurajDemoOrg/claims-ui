import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProcessNewClaim } from '../components/ProcessNewClaim';
import { UploadedFile } from '../App';
import { claimsApi } from '../services/claimsApi';
import { logger } from '../utils/logger';

export function ProcessNewClaimPage() {
  const navigate = useNavigate();
  const [claimForm, setClaimForm] = useState<UploadedFile | null>(null);
  const [receipts, setReceipts] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  logger.componentMount('ProcessNewClaimPage');

  const handleSubmit = async () => {
    logger.userAction('submit_claim_initiated', {
      component: 'ProcessNewClaimPage',
      metadata: {
        hasClaimForm: !!claimForm,
        receiptCount: receipts.length,
        claimFormName: claimForm?.name,
        receiptNames: receipts.map(r => r.name)
      }
    });

    if (!claimForm?.file || receipts.length === 0) {
      const errorMsg = 'Missing required files';
      logger.warn('Claim submission validation failed', {
        component: 'ProcessNewClaimPage',
        action: 'submit_validation',
        metadata: {
          hasClaimForm: !!claimForm?.file,
          receiptCount: receipts.length
        }
      });
      setError(errorMsg);
      return;
    }

    // Validate file sizes (max 10MB per file)
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    const oversizedFiles = [];
    
    if (claimForm.file.size > maxFileSize) {
      oversizedFiles.push(`Claim form: ${claimForm.name} (${(claimForm.file.size / 1024 / 1024).toFixed(2)}MB)`);
    }
    
    receipts.forEach(receipt => {
      if (receipt.file && receipt.file.size > maxFileSize) {
        oversizedFiles.push(`Receipt: ${receipt.name} (${(receipt.file.size / 1024 / 1024).toFixed(2)}MB)`);
      }
    });
    
    if (oversizedFiles.length > 0) {
      const errorMsg = `The following files exceed the 10MB size limit:\n${oversizedFiles.join('\n')}`;
      logger.warn('File size validation failed', {
        component: 'ProcessNewClaimPage',
        action: 'file_size_validation',
        metadata: { oversizedFiles }
      });
      setError(errorMsg);
      return;
    }

    // Validate file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const invalidFiles = [];
    
    if (!allowedTypes.includes(claimForm.file.type)) {
      invalidFiles.push(`Claim form: ${claimForm.name} (${claimForm.file.type})`);
    }
    
    receipts.forEach(receipt => {
      if (receipt.file && !allowedTypes.includes(receipt.file.type)) {
        invalidFiles.push(`Receipt: ${receipt.name} (${receipt.file.type})`);
      }
    });
    
    if (invalidFiles.length > 0) {
      const errorMsg = `The following files have unsupported formats (only PDF, JPG, PNG allowed):\n${invalidFiles.join('\n')}`;
      logger.warn('File type validation failed', {
        component: 'ProcessNewClaimPage',
        action: 'file_type_validation',
        metadata: { invalidFiles }
      });
      setError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const startTime = performance.now();
    
    try {
      logger.info('Starting claim submission process', {
        component: 'ProcessNewClaimPage',
        action: 'submit_claim',
        metadata: {
          claimFormSize: claimForm.file.size,
          totalReceiptSize: receipts.reduce((sum, r) => sum + (r.file?.size || 0), 0)
        }
      });

      // Extract File objects from UploadedFile structure
      const claimFormFile = claimForm.file;
      const receiptFiles = receipts.map(receipt => receipt.file).filter((file): file is File => file !== undefined);
      
      if (receiptFiles.length !== receipts.length) {
        throw new Error('Some receipt files are missing');
      }

      // Submit claim via API
      const response = await claimsApi.submitClaim(claimFormFile, receiptFiles);
      
      const duration = performance.now() - startTime;
      logger.performance('claim_submission', duration, {
        component: 'ProcessNewClaimPage',
        claimId: response.id
      });

      logger.info('Claim submitted successfully', {
        component: 'ProcessNewClaimPage',
        action: 'submit_claim',
        claimId: response.id,
        metadata: { 
          status: response.claim_status,
          duration: Math.round(duration)
        }
      });
      
      // Show success state
      setIsSubmitting(false);
      setShowSuccess(true);
      
      logger.userAction('claim_submission_success', {
        component: 'ProcessNewClaimPage',
        claimId: response.id
      });
      
      // Wait a bit for success animation then navigate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to the claim detail page using the returned claim ID
      logger.info('Navigating to claim detail page', {
        component: 'ProcessNewClaimPage',
        action: 'navigate',
        claimId: response.id
      });
      navigate(`/claims/view/${response.id}`);
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error('Claim submission failed', {
        component: 'ProcessNewClaimPage',
        action: 'submit_claim',
        metadata: { duration: Math.round(duration) }
      }, error as Error);
      
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit claim. Please try again.';
      setError(errorMessage);
      
      logger.userAction('claim_submission_failed', {
        component: 'ProcessNewClaimPage',
        metadata: { errorMessage }
      });
    }
  };

  return (
    <div className="relative">
      <ProcessNewClaim
        claimForm={claimForm}
        receipts={receipts}
        setClaimForm={setClaimForm}
        setReceipts={setReceipts}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      
      {/* Error Alert */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
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
