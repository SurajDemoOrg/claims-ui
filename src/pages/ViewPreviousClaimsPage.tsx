import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ViewPreviousClaims } from '../components/ViewPreviousClaims';
import { PreviousClaim } from '../App';
import { claimsApi } from '../services/claimsApi';
import { transformToPreviousClaim } from '../services/dataTransformers';
import { Skeleton } from '../components/ui/skeleton';
import { logger } from '../utils/logger';

export function ViewPreviousClaimsPage() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<PreviousClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  logger.componentMount('ViewPreviousClaimsPage');

  const fetchClaims = async () => {
    const startTime = performance.now();
    try {
      setLoading(true);
      setError(null);
      
      logger.info('Fetching previous claims', {
        component: 'ViewPreviousClaimsPage',
        action: 'fetch_claims'
      });
      
      const apiClaims = await claimsApi.getAllClaims();
      const transformedClaims = apiClaims.map(transformToPreviousClaim);
      setClaims(transformedClaims);
      
      const duration = performance.now() - startTime;
      logger.performance('fetch_claims', duration, {
        component: 'ViewPreviousClaimsPage'
      });
      
      logger.info('Successfully fetched and transformed claims', {
        component: 'ViewPreviousClaimsPage',
        action: 'fetch_claims',
        metadata: { 
          count: transformedClaims.length,
          duration: Math.round(duration)
        }
      });
    } catch (err) {
      const duration = performance.now() - startTime;
      logger.error('Failed to fetch claims', {
        component: 'ViewPreviousClaimsPage',
        action: 'fetch_claims',
        metadata: { duration: Math.round(duration) }
      }, err as Error);
      
      setError('Failed to load claims. Please try again later.');
      
      logger.error('API call failed, no fallback data available', {
        component: 'ViewPreviousClaimsPage',
        action: 'api_error_no_fallback'
      });
      
      // No fallback - let the error state handle this
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleViewClaim = (claim: PreviousClaim) => {
    logger.userAction('view_claim_detail', {
      component: 'ViewPreviousClaimsPage',
      claimId: claim.id,
      metadata: { 
        status: claim.status,
        participantName: claim.ParticipantName
      }
    });
    navigate(`/claims/view/${claim.id}`);
  };

  const handleRetry = () => {
    logger.userAction('retry_fetch_claims', {
      component: 'ViewPreviousClaimsPage'
    });
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
