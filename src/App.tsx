import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ProcessNewClaimPage } from './pages/ProcessNewClaimPage';
import { ReviewClaimPage } from './pages/ReviewClaimPage';
import { ViewPreviousClaimsPage } from './pages/ViewPreviousClaimsPage';
import { ViewClaimDetailPage } from './pages/ViewClaimDetailPage';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  file?: File;
}

export interface ClaimFormData {
  participantName: string;
  dateOfService: string;
  providerName: string;
  totalAmount: string;
  description: string;
}

export interface ExtractedReceiptData {
  id: string;
  fileName: string;
  patientName: string;
  dateOfService: string;
  providerName: string;
  totalCost: string;
}

export interface PreviousClaim {
  id: string;
  dateSubmitted: string;
  claimantName: string;
  totalAmount: string;
  status: 'Processed' | 'Pending Review' | 'Anomaly Found';
}

export interface DetailedClaim {
  id: string;
  dateSubmitted: string;
  claimantName: string;
  totalAmount: string;
  status: 'Processed' | 'Pending Review' | 'Anomaly Found';
  formData: ClaimFormData;
  claimForm: UploadedFile;
  receipts: UploadedFile[];
  extractedReceiptData: ExtractedReceiptData[];
}

export default function App() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/claims/process" replace />} />
          <Route path="/claims/process" element={<ProcessNewClaimPage />} />
          <Route path="/claims/process/review" element={<ReviewClaimPage />} />
          <Route path="/claims/view" element={<ViewPreviousClaimsPage />} />
          <Route path="/claims/view/:id" element={<ViewClaimDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
