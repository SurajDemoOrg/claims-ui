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

// Updated PreviousClaim interface to match API response
export interface PreviousClaim {
  id: string;
  dateSubmitted: string;
  ParticipantName: string;
  totalAmount: string;
  status: 'PROCESSED' | 'PENDING' | 'ANOMALY_DETECTED';
  anomalies?: string[];
  employeeId?: string;
  employerName?: string;
  planType?: string;
  provider?: string;
}

// Updated DetailedClaim interface to match API response structure
export interface DetailedClaim {
  id: string;
  dateSubmitted: string;
  ParticipantName: string;
  totalAmount: string;
  status: 'PROCESSED' | 'PENDING' | 'ANOMALY_DETECTED';
  anomalies: string[];
  created_at?: string;
  updated_at?: string;
  bill: {
    amount: string;
    date: string;
    description: string;
    provider: string;
    receipt_attached: boolean;
  };
  bill_files: string[];
  claim: {
    'Participant Name (First, MI, Last)': string;
    'Receipts.Date of service': string;
    'Provider Name': string;
    'Out-of-Pocket Cost (i.e. Patient Responsibility)': string;
    'Description of service or item purchased': string;
    'Service Dates (start and end dates)': string;
    'Employee ID': string;
    'Employer Name': string;
    'Plan Type': string;
    'Social Security Number': string;
    receipt_attached: boolean;
    'Receipts.Description of service or item purchased': string;
    'Receipts.Dollar amount': string;
    'Receipts.Name of provider': string;
    'Daycare Cost (Dependent Care FSA)': string;
    'Dependent Care FSA Provider Name': string;
    'Dependent Care FSA Service Dates (start and end dates)': string;
    'Provider\'s Signature (Dependent Care FSA)': string;
    'Total: $ (Dependent Care FSA)': string;
  };
  claim_file: string;
  // Legacy fields for backward compatibility with existing components
  formData?: ClaimFormData;
  claimForm?: UploadedFile;
  receipts?: UploadedFile[];
  extractedReceiptData?: ExtractedReceiptData[];
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
