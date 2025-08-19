import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProcessNewClaim } from './components/ProcessNewClaim';
import { ReviewClaim } from './components/ReviewClaim';
import { ViewPreviousClaims } from './components/ViewPreviousClaims';
import { ViewClaimDetail } from './components/ViewClaimDetail';

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

export type Screen = 'process' | 'review' | 'previous' | 'claimDetail';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('process');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [claimForm, setClaimForm] = useState<UploadedFile | null>(null);
  const [receipts, setReceipts] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState<ClaimFormData>({
    participantName: '',
    dateOfService: '',
    providerName: '',
    totalAmount: '',
    description: ''
  });

  const mockPreviousClaims: PreviousClaim[] = [
    {
      id: 'CL-2024-001',
      dateSubmitted: '2024-01-15',
      claimantName: 'John Smith',
      totalAmount: '$245.67',
      status: 'Processed'
    },
    {
      id: 'CL-2024-002',
      dateSubmitted: '2024-01-18',
      claimantName: 'Sarah Johnson',
      totalAmount: '$89.23',
      status: 'Pending Review'
    },
    {
      id: 'CL-2024-003',
      dateSubmitted: '2024-01-22',
      claimantName: 'Mike Davis',
      totalAmount: '$156.44',
      status: 'Anomaly Found'
    }
  ];

  // Detailed mock data for previous claims
  const mockDetailedClaims: DetailedClaim[] = [
    {
      id: 'CL-2024-001',
      dateSubmitted: '2024-01-15',
      claimantName: 'John Smith',
      totalAmount: '$245.67',
      status: 'Processed',
      formData: {
        participantName: 'John Smith',
        dateOfService: '2024-01-10',
        providerName: 'General Hospital',
        totalAmount: '245.67',
        description: 'Emergency room visit and X-ray examination'
      },
      claimForm: {
        id: 'form-001',
        name: 'claim-form-john-smith.pdf',
        type: 'application/pdf',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300'
      },
      receipts: [
        {
          id: 'receipt-001-1',
          name: 'emergency-room-receipt.jpg',
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300'
        },
        {
          id: 'receipt-001-2',
          name: 'xray-receipt.jpg',
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300'
        }
      ],
      extractedReceiptData: [
        {
          id: 'receipt-001-1',
          fileName: 'emergency-room-receipt.jpg',
          patientName: 'John Smith',
          dateOfService: '2024-01-10',
          providerName: 'General Hospital',
          totalCost: '$185.67'
        },
        {
          id: 'receipt-001-2',
          fileName: 'xray-receipt.jpg',
          patientName: 'John Smith',
          dateOfService: '2024-01-10',
          providerName: 'General Hospital',
          totalCost: '$60.00'
        }
      ]
    },
    {
      id: 'CL-2024-002',
      dateSubmitted: '2024-01-18',
      claimantName: 'Sarah Johnson',
      totalAmount: '$89.23',
      status: 'Pending Review',
      formData: {
        participantName: 'Sarah Johnson',
        dateOfService: '2024-01-16',
        providerName: 'Family Clinic',
        totalAmount: '89.23',
        description: 'Routine checkup and blood work'
      },
      claimForm: {
        id: 'form-002',
        name: 'claim-form-sarah-johnson.pdf',
        type: 'application/pdf',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300'
      },
      receipts: [
        {
          id: 'receipt-002-1',
          name: 'checkup-receipt.jpg',
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300'
        }
      ],
      extractedReceiptData: [
        {
          id: 'receipt-002-1',
          fileName: 'checkup-receipt.jpg',
          patientName: 'Sarah Johnson',
          dateOfService: '2024-01-16',
          providerName: 'Family Clinic',
          totalCost: '$89.23'
        }
      ]
    },
    {
      id: 'CL-2024-003',
      dateSubmitted: '2024-01-22',
      claimantName: 'Mike Davis',
      totalAmount: '$156.44',
      status: 'Anomaly Found',
      formData: {
        participantName: 'Mike Davis',
        dateOfService: '2024-01-20',
        providerName: 'Dental Center',
        totalAmount: '156.44',
        description: 'Dental cleaning and filling'
      },
      claimForm: {
        id: 'form-003',
        name: 'claim-form-mike-davis.pdf',
        type: 'application/pdf',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300'
      },
      receipts: [
        {
          id: 'receipt-003-1',
          name: 'dental-cleaning-receipt.jpg',
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300'
        },
        {
          id: 'receipt-003-2',
          name: 'filling-receipt.jpg',
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300'
        }
      ],
      extractedReceiptData: [
        {
          id: 'receipt-003-1',
          fileName: 'dental-cleaning-receipt.jpg',
          patientName: 'Mike Davis',
          dateOfService: '2024-01-20',
          providerName: 'Dental Center',
          totalCost: '$85.44'
        },
        {
          id: 'receipt-003-2',
          fileName: 'filling-receipt.jpg',
          patientName: 'Mike Davis',
          dateOfService: '2024-01-20',
          providerName: 'Dental Center',
          totalCost: '$71.00'
        }
      ]
    }
  ];

  const handleProcessReview = () => {
    // Simulate AI processing and populate form data
    setFormData({
      participantName: 'John Doe',
      dateOfService: '2024-01-20',
      providerName: 'City Medical Center',
      totalAmount: '127.50',
      description: 'Annual physical examination'
    });
    setCurrentScreen('review');
  };

  const handleViewClaim = (claim: PreviousClaim) => {
    setSelectedClaimId(claim.id);
    setCurrentScreen('claimDetail');
  };

  // Generate mock extracted data from receipts - using useMemo to maintain stable data
  const extractedReceiptData = useMemo((): ExtractedReceiptData[] => {
    const mockAmounts = ['85.00', '42.50', '125.75', '67.25', '93.80'];
    const mockProviders = ['City Medical Center', 'Downtown Clinic', 'Regional Hospital', 'Family Care Center', 'Wellness Center'];
    
    return receipts.map((receipt, index) => ({
      id: receipt.id,
      fileName: receipt.name,
      patientName: 'John Doe',
      dateOfService: `2024-01-${20 + index}`,
      providerName: mockProviders[index % mockProviders.length],
      totalCost: `$${mockAmounts[index % mockAmounts.length]}`
    }));
  }, [receipts]);

  const selectedClaimDetail = mockDetailedClaims.find(claim => claim.id === selectedClaimId);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'process':
        return (
          <ProcessNewClaim
            claimForm={claimForm}
            receipts={receipts}
            setClaimForm={setClaimForm}
            setReceipts={setReceipts}
            onProcessReview={handleProcessReview}
          />
        );
      case 'review':
        return (
          <ReviewClaim
            formData={formData}
            setFormData={setFormData}
            claimForm={claimForm}
            receipts={receipts}
            extractedReceiptData={extractedReceiptData}
            onSubmit={() => {
              alert('Claim submitted successfully!');
              setCurrentScreen('process');
              setClaimForm(null);
              setReceipts([]);
              setFormData({
                participantName: '',
                dateOfService: '',
                providerName: '',
                totalAmount: '',
                description: ''
              });
            }}
          />
        );
      case 'previous':
        return (
          <ViewPreviousClaims
            claims={mockPreviousClaims}
            onViewClaim={handleViewClaim}
          />
        );
      case 'claimDetail':
        return selectedClaimDetail ? (
          <ViewClaimDetail
            claim={selectedClaimDetail}
            onBack={() => setCurrentScreen('previous')}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      <main className="flex-1 overflow-auto">
        {renderScreen()}
      </main>
    </div>
  );
}