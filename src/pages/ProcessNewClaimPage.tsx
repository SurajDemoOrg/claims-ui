import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProcessNewClaim } from '../components/ProcessNewClaim';
import { UploadedFile } from '../App';

export function ProcessNewClaimPage() {
  const navigate = useNavigate();
  const [claimForm, setClaimForm] = useState<UploadedFile | null>(null);
  const [receipts, setReceipts] = useState<UploadedFile[]>([]);

  const handleProcessReview = () => {
    navigate('/claims/process/review', { 
      state: { claimForm, receipts } 
    });
  };

  return (
    <ProcessNewClaim
      claimForm={claimForm}
      receipts={receipts}
      setClaimForm={setClaimForm}
      setReceipts={setReceipts}
      onProcessReview={handleProcessReview}
    />
  );
}
