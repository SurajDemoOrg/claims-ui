import { useNavigate } from 'react-router-dom';
import { ViewPreviousClaims } from '../components/ViewPreviousClaims';
import { PreviousClaim } from '../App';

export function ViewPreviousClaimsPage() {
  const navigate = useNavigate();

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

  const handleViewClaim = (claim: PreviousClaim) => {
    navigate(`/claims/view/${claim.id}`);
  };

  return (
    <ViewPreviousClaims
      claims={mockPreviousClaims}
      onViewClaim={handleViewClaim}
    />
  );
}
