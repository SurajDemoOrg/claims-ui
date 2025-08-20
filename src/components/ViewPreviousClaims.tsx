import { useState } from 'react';
import { PreviousClaim } from '../App';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';

interface ViewPreviousClaimsProps {
  claims: PreviousClaim[];
  onViewClaim: (claim: PreviousClaim) => void;
}

export function ViewPreviousClaims({ claims, onViewClaim }: ViewPreviousClaimsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter claims based on search term
  const filteredClaims = claims.filter(claim => 
    claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claimantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Previous Claims</h1>
        <p className="text-muted-foreground mb-4">
          Click on any claim to view detailed information, documents, and extracted data.
        </p>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by Claim ID, Claimant Name, or Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            Showing {filteredClaims.length} of {claims.length} claims
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claim ID</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Claimant Name</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Anomalies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClaims.map((claim) => (
              <TableRow
                key={claim.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewClaim(claim)}
              >
                <TableCell className="font-medium">{claim.id}</TableCell>
                <TableCell>{new Date(claim.dateSubmitted).toLocaleDateString()}</TableCell>
                <TableCell>{claim.claimantName}</TableCell>
                <TableCell>{claim.totalAmount}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(claim.status)}>
                    {getDisplayStatus(claim.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {claim.anomalies && claim.anomalies.length > 0 ? (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      {claim.anomalies.length} issue{claim.anomalies.length > 1 ? 's' : ''}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
  );
}