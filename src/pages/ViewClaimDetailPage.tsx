import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ViewClaimDetail } from '../components/ViewClaimDetail';
import { DetailedClaim } from '../App';
import { claimsApi } from '../services/claimsApi';
import { transformToDetailedClaim } from '../services/dataTransformers';
import { Skeleton } from '../components/ui/skeleton';
import { logger } from '../utils/logger';

export function ViewClaimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<DetailedClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  logger.componentMount('ViewClaimDetailPage', { claimId: id });

  const fetchClaim = async () => {
    if (!id) {
      logger.warn('No claim ID provided, redirecting to claims list', {
        component: 'ViewClaimDetailPage',
        action: 'redirect_no_id'
      });
      navigate('/claims/view');
      return;
    }

    const startTime = performance.now();
    try {
      setLoading(true);
      setError(null);
      
      logger.info('Fetching claim details', {
        component: 'ViewClaimDetailPage',
        action: 'fetch_claim',
        claimId: id
      });
      
      // First try to get from API
      const apiClaim = await claimsApi.getClaimById(id);
      const transformedClaim = transformToDetailedClaim(apiClaim);
      setClaim(transformedClaim);
      console.log(transformedClaim);
      
      const duration = performance.now() - startTime;
      logger.performance('fetch_claim_detail', duration, {
        component: 'ViewClaimDetailPage',
        claimId: id
      });
      
      logger.info('Successfully fetched claim details', {
        component: 'ViewClaimDetailPage',
        action: 'fetch_claim',
        claimId: id,
        metadata: { 
          status: transformedClaim.status,
          hasAnomalies: transformedClaim.anomalies.length > 0,
          duration: Math.round(duration)
        }
      });
    } catch (err) {
      const duration = performance.now() - startTime;
      logger.error('Failed to fetch claim from API', {
        component: 'ViewClaimDetailPage',
        action: 'fetch_claim',
        claimId: id,
        metadata: { duration: Math.round(duration) }
      }, err as Error);
      
      // Fallback: check localStorage for newly created claims
      logger.info('Attempting localStorage fallback', {
        component: 'ViewClaimDetailPage',
        action: 'localStorage_fallback',
        claimId: id
      });
      
      const storedClaim = localStorage.getItem(`claim_${id}`);
      if (storedClaim) {
        setClaim(JSON.parse(storedClaim));
        logger.info('Successfully loaded claim from localStorage', {
          component: 'ViewClaimDetailPage',
          action: 'localStorage_fallback',
          claimId: id
        });
      } else {
        logger.warn('Claim not found in localStorage either', {
          component: 'ViewClaimDetailPage',
          action: 'no_fallback_available',
          claimId: id
        });
        
        setError('Failed to load claim details. Please try again later.');
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
