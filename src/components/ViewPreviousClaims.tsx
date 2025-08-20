import { useState } from 'react';
import { PreviousClaim } from '../App';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle } from 'lucide-react';

interface ViewPreviousClaimsProps {
  claims: PreviousClaim[];
  onViewClaim: (claim: PreviousClaim) => void;
}

export function ViewPreviousClaims({ claims, onViewClaim }: ViewPreviousClaimsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter claims based on search term
  const filteredClaims = claims.filter(claim => 
    claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDisplayStatus(claim.status).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: PreviousClaim['status']) => {
    switch (status) {
      case 'PROCESSED':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'ANOMALY_DETECTED':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
  };

  const getDisplayStatus = (status: PreviousClaim['status']) => {
    switch (status) {
      case 'PROCESSED':
        return 'Processed';
      case 'PENDING':
        return 'Pending Review';
      case 'ANOMALY_DETECTED':
        return 'Anomaly Found';
      default:
        return status;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Previous Claims</h1>
        <p className="text-muted-foreground mb-4">
          Click on any claim to view detailed information, documents, and extracted data.
        </p>
      </div>

      <div className="space-y-6">
        {filteredClaims.map((claim) => (
          <Card key={claim.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onViewClaim(claim)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Claim ID: {claim.id}</CardTitle>
                <Badge className={getStatusColor(claim.status)}>
                  {getDisplayStatus(claim.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Participant Name:</label>
                  <p className="text-muted-foreground">{claim.participantName}</p>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Date Submitted:</label>
                  <p className="text-muted-foreground">{new Date(claim.dateSubmitted).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Total Cost:</label>
                  <p className="text-muted-foreground font-bold text-green-600">${claim.totalAmount}</p>
                </div>
                {claim.employeeId && (
                  <div className="space-y-2">
                    <label className="font-semibold text-sm">Employee ID:</label>
                    <p className="text-muted-foreground">{claim.employeeId}</p>
                  </div>
                )}
                {claim.employerName && (
                  <div className="space-y-2">
                    <label className="font-semibold text-sm">Employer Name:</label>
                    <p className="text-muted-foreground">{claim.employerName}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Social Security Number:</label>
                  <p className="text-muted-foreground">***-**-****</p>
                </div>
                {claim.provider && (
                  <div className="space-y-2">
                    <label className="font-semibold text-sm">Provider Name:</label>
                    <p className="text-muted-foreground">{claim.provider}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Provider Signature:</label>
                  <p className="text-muted-foreground">Available</p>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm">Service Period:</label>
                  <p className="text-muted-foreground text-sm">08/03/23 - 08/13/25</p>
                </div>
              </div>
              
              {claim.anomalies && claim.anomalies.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-700">Anomalies Detected:</span>
                  </div>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {claim.anomalies.map((anomaly, index) => (
                      <li key={index}>
                        {anomaly.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredClaims.length === 0 && claims.length > 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No claims match your search criteria.</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Clear search
            </button>
          </div>
        )}

        {claims.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No previous claims found.</p>
          </div>
        )}
      </div>
    </div>
  );
}