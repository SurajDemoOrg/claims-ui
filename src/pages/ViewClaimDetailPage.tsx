import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ViewClaimDetail } from '../components/ViewClaimDetail';
import { DetailedClaim } from '../App';
import { claimsApi } from '../services/claimsApi';
import { transformToDetailedClaim } from '../services/dataTransformers';
import { Skeleton } from '../components/ui/skeleton';

export function ViewClaimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<DetailedClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaim = async () => {
    if (!id) {
      navigate('/claims/view');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // First try to get from API
      const apiClaim = await claimsApi.getClaimById(id);
      const transformedClaim = transformToDetailedClaim(apiClaim);
      setClaim(transformedClaim);
    } catch (err) {
      console.error('Failed to fetch claim:', err);
      
      // Fallback: check localStorage for newly created claims
      const storedClaim = localStorage.getItem(`claim_${id}`);
      if (storedClaim) {
        setClaim(JSON.parse(storedClaim));
      } else {
        // Fallback: check mock data
        const mockDetailedClaims: DetailedClaim[] = [
          {
            id: 'CL-2024-001',
            dateSubmitted: '2024-01-15',
            ParticipantName: 'John Smith',
            totalAmount: '$245.67',
            status: 'PROCESSED',
            anomalies: [],
            bill: {
              amount: '245.67',
              date: '2024-01-10',
              description: 'Emergency room visit and X-ray examination',
              provider: 'General Hospital',
              receipt_attached: true
            },
            bill_files: ['emergency-room-receipt.jpg', 'xray-receipt.jpg'],
            claim: {
              'Participant Name (First, MI, Last)': 'John Smith',
              'Receipts.Date of service': '2024-01-10',
              'Provider Name': 'General Hospital',
              'Out-of-Pocket Cost (i.e. Patient Responsibility)': '245.67',
              'Description of service or item purchased': 'Emergency room visit and X-ray examination',
              'Service Dates (start and end dates)': '2024-01-10',
              'Employee ID': 'EMP001',
              'Employer Name': 'Tech Corp',
              'Plan Type': 'HFSA',
              'Social Security Number': '123456789',
              receipt_attached: true,
              'Receipts.Description of service or item purchased': 'Emergency room visit and X-ray examination',
              'Receipts.Dollar amount': '245.67',
              'Receipts.Name of provider': 'General Hospital',
              'Daycare Cost (Dependent Care FSA)': '',
              'Dependent Care FSA Provider Name': '',
              'Dependent Care FSA Service Dates (start and end dates)': '',
              'Provider\'s Signature (Dependent Care FSA)': '',
              'Total: $ (Dependent Care FSA)': ''
            },
            claim_file: 'claim-form-john-smith.pdf',
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
          }
        ];
        
        const mockClaim = mockDetailedClaims.find(claim => claim.id === id);
        if (mockClaim) {
          setClaim(mockClaim);
        } else {
          setError('Claim not found');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [id, navigate]);

  const handleBack = () => {
    navigate('/claims/view');
  };

  const handleRetry = () => {
    fetchClaim();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Claim Details</h1>
          <p className="text-muted-foreground">Loading claim details...</p>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Claim Details</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 mb-4">{error || 'Claim not found'}</p>
            <div className="space-x-2">
              <button 
                onClick={handleBack}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Back to Claims
              </button>
              {error && (
                <button 
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-right-4 duration-500">
      <ViewClaimDetail
        claim={claim}
        onBack={handleBack}
      />
    </div>
  );
}
