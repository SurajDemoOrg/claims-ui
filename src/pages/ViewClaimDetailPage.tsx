import { useParams, useNavigate } from 'react-router-dom';
import { ViewClaimDetail } from '../components/ViewClaimDetail';
import { DetailedClaim } from '../App';

export function ViewClaimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock detailed claims data
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
        dateOfService: '2024-01-15',
        providerName: 'City Medical Center',
        totalAmount: '89.23',
        description: 'Routine check-up and blood work'
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
          dateOfService: '2024-01-15',
          providerName: 'City Medical Center',
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
        providerName: 'Downtown Clinic',
        totalAmount: '156.44',
        description: 'Physical therapy session'
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
          name: 'therapy-receipt.jpg',
          type: 'image/jpeg',
          url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300'
        }
      ],
      extractedReceiptData: [
        {
          id: 'receipt-003-1',
          fileName: 'therapy-receipt.jpg',
          patientName: 'Mike Davis',
          dateOfService: '2024-01-20',
          providerName: 'Downtown Clinic',
          totalCost: '$156.44'
        }
      ]
    }
  ];

  let selectedClaim = id ? mockDetailedClaims.find(claim => claim.id === id) : null;
  
  // If not found in mock data, check localStorage for newly created claims
  if (!selectedClaim && id) {
    const storedClaim = localStorage.getItem(`claim_${id}`);
    if (storedClaim) {
      selectedClaim = JSON.parse(storedClaim);
    }
  }

  // If claim not found, redirect to view claims page
  if (!selectedClaim) {
    navigate('/claims/view');
    return null;
  }

  const handleBack = () => {
    navigate('/claims/view');
  };

  return (
    <div className="animate-in fade-in-0 slide-in-from-right-4 duration-500">
      <ViewClaimDetail
        claim={selectedClaim}
        onBack={handleBack}
      />
    </div>
  );
}
