import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ProcessNewClaimPage } from './pages/ProcessNewClaimPage';
import { ViewPreviousClaimsPage } from './pages/ViewPreviousClaimsPage';
import { ViewClaimDetailPage } from './pages/ViewClaimDetailPage';
import { SampleDataDemoPage } from './pages/SampleDataDemoPage';
import { LogViewerToggle } from './components/LogViewer';
import { logger } from './utils/logger';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  file?: File;
}

export interface ClaimFormData {
  participantName: string;
  socialSecurityNumber: string;
  employerName: string;
  employeeId: string;
  planType: string;
  serviceStartDate: string;
  serviceEndDate: string;
  providerName: string;
  typeOfService: string;
  outOfPocketCost: number;
  totalCost: number;
  providerSignature?: string;
  dayCareCost?: number;
  lists?: {
    'Out of Pocket Cost': number;
    'Plan Type': string;
    'Provider': string;
    'Service End Date': string;
    'Service Start Date': string;
    'Type of Service': string;
  }[];
}

export interface ClaimServiceItem {
  planType: string;
  serviceStartDate: string;
  serviceEndDate: string;
  provider: string;
  typeOfService: string;
  outOfPocketCost: number;
}

export interface ExtractedReceiptData {
  id: string;
  fileName: string;
  providerName: string;
  patientName: string;
  serviceDate: string;
  totalCost: string;
}

// Updated PreviousClaim interface to match API response
export interface PreviousClaim {
  id: string;
  dateSubmitted: string;
  participantName: string;
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
  participantName: string;
  totalAmount: string;
  status: 'PROCESSED' | 'PENDING' | 'ANOMALY_DETECTED';
  anomalies: string[];
  created_at?: string;
  updated_at?: string;
  
  // New claim structure based on API response
  claimData?: {
    participantName: string;
    socialSecurityNumber: string;
    employerName: string;
    employeeId: string;
    lists: {
      'Out of Pocket Cost': number;
      'Plan Type': string;
      'Provider': string;
      'Service End Date': string;
      'Service Start Date': string;
      'Type of Service': string;
    }[];
    totalCost: number;
    serviceStartDate: string;
    serviceEndDate: string;
    providerName: string;
    providerSignature?: string;
    dayCareCost?: number;
  };
  
  // New bill structure based on API response
  billData?: {
    filename: string;
    patient_name: string;
    provider_name: string;
    service_date: string;
    total_cost: string;
  }[];
  
  // Legacy fields for backward compatibility with existing components
  bill: {
    amount: string;
    date: string;
    description: string;
    provider: string;
    receipt_attached: boolean;
  };
  bill_files: string[];
  claim_file?: string;
  claim: {
    'Participant Name': string;
    'Date of service': string;
    'Provider Name': string;
    'Total Cost': string;
    'Description of service or item purchased': string;
    'Service Dates': string;
    'Service StartDate': string;
    'Service EndDate': string;
    'Employee ID': string;
    'Employer Name': string;
    'Plan Type': string;
    'Social Security Number': string;
    'Provider Signature': string;
    'Day Care Cost': string;
    receipt_attached: boolean;
    'Receipts.Description of service or item purchased'?: string;
    'Receipts.Dollar amount'?: string;
    'Receipts.Name of provider'?: string;
    'Receipts.Date of service'?: string;
    'Daycare Cost (Dependent Care FSA)'?: string;
    'Dependent Care FSA Provider Name'?: string;
    'Dependent Care FSA Service Dates (start and end dates)'?: string;
    'Provider\'s Signature (Dependent Care FSA)'?: string;
    'Total: $ (Dependent Care FSA)'?: string;
  };
  formData?: ClaimFormData;
  claimForm?: UploadedFile;
  receipts?: UploadedFile[];
  extractedReceiptData?: ExtractedReceiptData[];
}

export default function App() {
  logger.componentMount('App');
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/claims/process" replace />} />
          <Route path="/claims/process" element={<ProcessNewClaimPage />} />
          <Route path="/claims/view" element={<ViewPreviousClaimsPage />} />
          <Route path="/claims/view/:id" element={<ViewClaimDetailPage />} />
          <Route path="/sample-data" element={<SampleDataDemoPage />} />
        </Routes>
      </main>
      <LogViewerToggle />
    </div>
  );
}
