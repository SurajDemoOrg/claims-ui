import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ViewPreviousClaims } from '../components/ViewPreviousClaims';
import { PreviousClaim } from '../App';
import { claimsApi } from '../services/claimsApi';
import { transformToPreviousClaim } from '../services/dataTransformers';
import { Skeleton } from '../components/ui/skeleton';

export function ViewPreviousClaimsPage() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<PreviousClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiClaims = await claimsApi.getAllClaims();
      const transformedClaims = apiClaims.map(transformToPreviousClaim);
      setClaims(transformedClaims);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
      setError('Failed to load claims. Please try again later.');
      // Fallback to mock data in case of error
      const mockPreviousClaims: PreviousClaim[] = [
        {
          id: 'CL-2024-001',
          dateSubmitted: '2024-01-15',
          claimantName: 'John Smith',
          totalAmount: '$245.67',
          status: 'PROCESSED'
        },
        {
          id: 'CL-2024-002',
          dateSubmitted: '2024-01-18',
          claimantName: 'Sarah Johnson',
          totalAmount: '$89.23',
          status: 'PENDING'
        },
        {
          id: 'CL-2024-003',
          dateSubmitted: '2024-01-22',
          claimantName: 'Mike Davis',
          totalAmount: '$156.44',
          status: 'ANOMALY_DETECTED'
        }
      ];
      setClaims(mockPreviousClaims);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleViewClaim = (claim: PreviousClaim) => {
    navigate(`/claims/view/${claim.id}`);
  };

  const handleRetry = () => {
    fetchClaims();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Previous Claims</h1>
          <p className="text-muted-foreground">Loading claims...</p>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Previous Claims</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ViewPreviousClaims
      claims={claims}
      onViewClaim={handleViewClaim}
    />
  );
}
