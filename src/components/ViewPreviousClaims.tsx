import React from 'react';
import { PreviousClaim } from '../App';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface ViewPreviousClaimsProps {
  claims: PreviousClaim[];
  onViewClaim: (claim: PreviousClaim) => void;
}

export function ViewPreviousClaims({ claims, onViewClaim }: ViewPreviousClaimsProps) {
  const getStatusColor = (status: PreviousClaim['status']) => {
    switch (status) {
      case 'Processed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Anomaly Found':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Previous Claims</h1>
        <p className="text-muted-foreground">
          Click on any claim to view detailed information, documents, and extracted data.
        </p>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
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
                    {claim.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {claims.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No previous claims found.</p>
        </div>
      )}
    </div>
  );
}