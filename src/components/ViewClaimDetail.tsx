import { useState } from 'react';
import { DetailedClaim } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DocumentViewer } from './DocumentViewer';
import { DocumentThumbnail } from './DocumentThumbnail';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface ViewClaimDetailProps {
  claim: DetailedClaim;
  onBack: () => void;
}

export function ViewClaimDetail({ claim, onBack }: ViewClaimDetailProps) {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  // Helper to get form data with fallbacks to API structure
  const getFormData = () => {
    if (claim.formData) {
      return claim.formData;
    }
    
    // Try to access the raw API structure directly first
    const rawClaim = claim.claim;
    
    // Updated to match new API structure with better fallbacks
    return {
      participantName: rawClaim?.['Participant Name'] || 
                      claim.claimData?.participantName || 
                      claim.claim?.['Participant Name (First, MI, Last)'] || 
                      '',
      socialSecurityNumber: rawClaim?.['Social Security Number'] ||
                           claim.claimData?.socialSecurityNumber || 
                           claim.claim?.['Social Security Number'] || 
                           '',
      employerName: rawClaim?.['Employer Name'] ||
                   claim.claimData?.employerName || 
                   claim.claim?.['Employer Name'] || 
                   '',
      employeeId: rawClaim?.['Employee ID'] ||
                 claim.claimData?.employeeId || 
                 claim.claim?.['Employee ID'] || 
                 '',
      planType: rawClaim?.['Lists']?.[0]?.['Plan Type'] ||
               claim.claimData?.lists?.[0]?.['Plan Type'] || 
               claim.claim?.['Plan Type'] || 
               '',
      serviceStartDate: rawClaim?.['Service StartDate'] ||
                       rawClaim?.['Lists']?.[0]?.['Service Start Date'] ||
                       claim.claimData?.serviceStartDate || 
                       claim.claim?.['Service StartDate'] || 
                       claim.claim?.['Service Start Date'] ||
                       '',
      serviceEndDate: rawClaim?.['Service EndDate'] ||
                     rawClaim?.['Lists']?.[0]?.['Service End Date'] ||
                     claim.claimData?.serviceEndDate || 
                     claim.claim?.['Service EndDate'] || 
                     claim.claim?.['Service End Date'] ||
                     '',
      providerName: rawClaim?.['Provider Name'] ||
                   rawClaim?.['Lists']?.[0]?.['Provider'] ||
                   claim.claimData?.providerName || 
                   claim.claim?.['Provider Name'] || 
                   claim.billData?.[0]?.provider_name || 
                   '',
      typeOfService: rawClaim?.['Lists']?.[0]?.['Type of Service'] ||
                    claim.claimData?.lists?.[0]?.['Type of Service'] || 
                    claim.claim?.['Description of service or item purchased'] || 
                    '',
      outOfPocketCost: rawClaim?.['Lists']?.[0]?.['Out of Pocket Cost'] ||
                      claim.claimData?.lists?.[0]?.['Out of Pocket Cost'] || 
                      parseFloat(claim.bill?.amount || '0') || 
                      0,
      totalCost: rawClaim?.['Total Cost'] ||
                claim.claimData?.totalCost || 
                parseFloat(claim.bill?.amount || '0') || 
                claim.claim?.['Total Cost'] ||
                0,
      providerSignature: rawClaim?.['Provider Signature'] ||
                        claim.claimData?.providerSignature || 
                        claim.claim?.['Provider Signature'] || 
                        '',
      dayCareCost: rawClaim?.['Day Care Cost'] ||
                  claim.claimData?.dayCareCost || 
                  parseFloat(claim.claim?.['Day Care Cost'] || '0') || 
                  undefined,
      lists: rawClaim?.['Lists'] || claim.claimData?.lists || []
    };
  };

  const formData = getFormData();
  const receipts = claim.receipts || [];
  const extractedReceiptData = claim.extractedReceiptData || [];
  const claimForm = claim.claimForm;

  const getStatusColor = (status: DetailedClaim['status']) => {
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

  const getDisplayStatus = (status: DetailedClaim['status']) => {
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

  const hasAnomaly = claim.status === 'ANOMALY_DETECTED' || (claim.anomalies && claim.anomalies.length > 0);

  return (
    <div className="flex h-full">
      {/* Left Column - Claim Details */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Previous Claims
              </Button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl mb-2">Claim Details - {claim.id}</h1>
                <p className="text-muted-foreground">
                  Submitted on {new Date(claim.dateSubmitted).toLocaleDateString()}
                </p>
              </div>
              <Badge className={getStatusColor(claim.status)}>
                {getDisplayStatus(claim.status)}
              </Badge>
            </div>
          </div>

          {/* Claim Form Preview */}
          {claimForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Original Claim Form</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentThumbnail
                  document={claimForm}
                  onClick={() => setSelectedDocument(claimForm)}
                  className="w-full"
                />
              </CardContent>
            </Card>
          )}

          {/* Anomalies Display */}
          {hasAnomaly && claim.anomalies && claim.anomalies.length > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5" />
                  Anomalies Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {claim.anomalies.map((anomaly, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-orange-800 capitalize">
                        {anomaly.replace(/_/g, ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Claim Information (Read-only) */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Participant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="participantName">Participant Name</Label>
                  <Input
                    id="participantName"
                    value={formData.participantName}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialSecurityNumber">Social Security Number</Label>
                  <Input
                    id="socialSecurityNumber"
                    value={formData.socialSecurityNumber}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerName">Employer Name</Label>
                  <Input
                    id="employerName"
                    value={formData.employerName}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceStartDate">Service Start Date</Label>
                  <Input
                    id="serviceStartDate"
                    value={formData.serviceStartDate || 'N/A'}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceEndDate">Service End Date</Label>
                  <Input
                    id="serviceEndDate"
                    value={formData.serviceEndDate || 'N/A'}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                {formData.dayCareCost && (
                  <div className="space-y-2">
                    <Label htmlFor="dayCareCost">Day Care Cost</Label>
                    <Input
                      id="dayCareCost"
                      value={`$${formData.dayCareCost}`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Items List */}
          {((claim.claimData?.lists && claim.claimData.lists.length > 0) || (claim.claim?.['Lists'] && claim.claim['Lists'].length > 0)) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Service Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Plan Type</TableHead>
                        <TableHead className="text-xs">Start Date</TableHead>
                        <TableHead className="text-xs">End Date</TableHead>
                        <TableHead className="text-xs">Provider</TableHead>
                        <TableHead className="text-xs">Service Type</TableHead>
                        <TableHead className="text-xs">Out of Pocket Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(claim.claim?.['Lists'] || claim.claimData?.lists || []).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs">{item['Plan Type']}</TableCell>
                          <TableCell className="text-xs">{item['Service Start Date']}</TableCell>
                          <TableCell className="text-xs">{item['Service End Date']}</TableCell>
                          <TableCell className="text-xs">{item['Provider']}</TableCell>
                          <TableCell className="text-xs">{item['Type of Service']}</TableCell>
                          <TableCell className="text-xs">${item['Out of Pocket Cost']}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Claim Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claimId">Claim ID</Label>
                  <Input
                    id="claimId"
                    value={claim.id}
                    readOnly
                    className="bg-muted font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialSecurity">Social Security Number</Label>
                  <Input
                    id="socialSecurity"
                    value={claim.claim?.['Social Security Number'] ? `***-**-${claim.claim['Social Security Number'].slice(-4)}` : ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="createdAt">Created Date</Label>
                  <Input
                    id="createdAt"
                    value={new Date(claim.created_at || claim.dateSubmitted).toLocaleString()}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="updatedAt">Last Updated</Label>
                  <Input
                    id="updatedAt"
                    value={claim.updated_at ? new Date(claim.updated_at).toLocaleString() : 'N/A'}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Bill Receipts and Extracted Data */}
      <div className="w-96 border-l border-border p-6 overflow-auto">
        <div className="space-y-6">
          {/* Bill Receipts */}
          {receipts.length > 0 && (
            <div>
              <h2 className="text-xl mb-4">Bill Receipts ({receipts.length})</h2>
              <div className="grid grid-cols-2 gap-3">
                {receipts.map((receipt) => (
                  <DocumentThumbnail
                    key={receipt.id}
                    document={receipt}
                    onClick={() => setSelectedDocument(receipt)}
                  />
                ))}
              </div>
            </div>
          )}

          

          {/* Dependent Care FSA Information */}
          {claim.claim && (
            claim.claim['Daycare Cost (Dependent Care FSA)'] || 
            claim.claim['Dependent Care FSA Provider Name'] || 
            claim.claim['Dependent Care FSA Service Dates (start and end dates)'] ||
            claim.claim['Total: $ (Dependent Care FSA)']
          ) && (
            <div>
              <h2 className="text-xl mb-4">Dependent Care FSA</h2>
              <Card>
                <CardContent className="space-y-3 text-sm">
                  {claim.claim['Dependent Care FSA Provider Name'] && (
                    <div className="flex justify-between">
                      <span className="font-medium">Provider:</span>
                      <span>{claim.claim['Dependent Care FSA Provider Name']}</span>
                    </div>
                  )}
                  {claim.claim['Daycare Cost (Dependent Care FSA)'] && (
                    <div className="flex justify-between">
                      <span className="font-medium">Daycare Cost:</span>
                      <span>${claim.claim['Daycare Cost (Dependent Care FSA)']}</span>
                    </div>
                  )}
                  {claim.claim['Dependent Care FSA Service Dates (start and end dates)'] && (
                    <div className="flex justify-between">
                      <span className="font-medium">Service Dates:</span>
                      <span className="text-xs">{claim.claim['Dependent Care FSA Service Dates (start and end dates)']}</span>
                    </div>
                  )}
                  {claim.claim['Total: $ (Dependent Care FSA)'] && (
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>${claim.claim['Total: $ (Dependent Care FSA)']}</span>
                    </div>
                  )}
                  {claim.claim['Provider\'s Signature (Dependent Care FSA)'] && (
                    <div className="pt-2 border-t">
                      <div className="font-medium mb-1">Provider's Signature:</div>
                      <div className="text-xs text-muted-foreground">{claim.claim['Provider\'s Signature (Dependent Care FSA)']}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {selectedDocument && (
          <DocumentViewer
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </div>
    </div>
  );
}