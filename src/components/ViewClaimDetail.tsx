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
    // Fallback to API structure
    return {
      participantName: claim.claim?.['Participant Name (First, MI, Last)'] || '',
      dateOfService: claim.claim?.['Receipts.Date of service'] || claim.bill?.date || '',
      providerName: claim.claim?.['Provider Name'] || claim.bill?.provider || '',
      totalAmount: claim.bill?.amount || '0',
      description: claim.claim?.['Description of service or item purchased'] || claim.bill?.description || ''
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
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={claim.claim?.['Employee ID'] || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerName">Employer Name</Label>
                  <Input
                    id="employerName"
                    value={claim.claim?.['Employer Name'] || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planType">Plan Type</Label>
                  <Input
                    id="planType"
                    value={claim.claim?.['Plan Type'] || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfService">Date of Service</Label>
                  <Input
                    id="dateOfService"
                    value={formData.dateOfService}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceDates">Service Dates (Range)</Label>
                  <Input
                    id="serviceDates"
                    value={claim.claim?.['Service Dates (start and end dates)'] || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="providerName">Provider Name</Label>
                  <Input
                    id="providerName"
                    value={formData.providerName}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Out-of-Pocket Cost</Label>
                  <div className="relative">
                    <Input
                      id="totalAmount"
                      value={`$${formData.totalAmount}`}
                      readOnly
                      className={hasAnomaly ? 'bg-yellow-50 border-yellow-300' : 'bg-muted'}
                    />
                    {hasAnomaly && (
                      <AlertTriangle className="absolute right-3 top-3 w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description of Service</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  readOnly
                  className="bg-muted"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Receipt Information */}
          <Card>
            <CardHeader>
              <CardTitle>Receipt Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiptDate">Receipt Date of Service</Label>
                  <Input
                    id="receiptDate"
                    value={claim.claim?.['Receipts.Date of service'] || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptAmount">Receipt Dollar Amount</Label>
                  <Input
                    id="receiptAmount"
                    value={claim.claim?.['Receipts.Dollar amount'] ? `$${claim.claim['Receipts.Dollar amount']}` : ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptProvider">Receipt Provider Name</Label>
                  <Input
                    id="receiptProvider"
                    value={claim.claim?.['Receipts.Name of provider'] || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptAttached">Receipt Attached</Label>
                  <Input
                    id="receiptAttached"
                    value={claim.claim?.receipt_attached ? 'Yes' : 'No'}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptDescription">Receipt Description</Label>
                <Textarea
                  id="receiptDescription"
                  value={claim.claim?.['Receipts.Description of service or item purchased'] || ''}
                  readOnly
                  className="bg-muted"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

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

          {/* Extracted Receipt Data */}
          {extractedReceiptData.length > 0 && (
            <div>
              <h2 className="text-xl mb-4">Extracted Receipt Data</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Patient</TableHead>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Provider</TableHead>
                          <TableHead className="text-xs">Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {extractedReceiptData.map((data) => (
                          <TableRow key={data.id}>
                            <TableCell className="text-xs font-medium">{data.patientName}</TableCell>
                            <TableCell className="text-xs">{new Date(data.dateOfService).toLocaleDateString()}</TableCell>
                            <TableCell className="text-xs">{data.providerName}</TableCell>
                            <TableCell className="text-xs">{data.totalCost}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Total Summary */}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total from {extractedReceiptData.length} Receipt{extractedReceiptData.length !== 1 ? 's' : ''}:</span>
                  <span className="text-sm font-medium">
                    ${extractedReceiptData.reduce((sum, item) => 
                      sum + parseFloat(item.totalCost.replace('$', '')), 0
                    ).toFixed(2)}
                  </span>
                </div>
                {hasAnomaly && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    Anomaly detected: Total amounts do not match
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bill Information from API */}
          {claim.bill && (
            <div>
              <h2 className="text-xl mb-4">Bill Information</h2>
              <Card>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Provider:</span>
                      <span>{claim.bill.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span className="font-semibold">${claim.bill.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date:</span>
                      <span>{claim.bill.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Receipt Attached:</span>
                      <span>{claim.bill.receipt_attached ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="font-medium mb-1">Description:</div>
                    <div className="text-xs text-muted-foreground">{claim.bill.description}</div>
                  </div>
                </CardContent>
              </Card>
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

          {/* Bill Files from API */}
          {claim.bill_files && claim.bill_files.length > 0 && (
            <div>
              <h2 className="text-xl mb-4">Bill Files ({claim.bill_files.length})</h2>
              <div className="space-y-2">
                {claim.bill_files.map((fileName, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg text-sm flex items-center gap-2">
                    <span className="text-lg">📄</span>
                    <span className="flex-1 truncate">{fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claim File */}
          {claim.claim_file && (
            <div>
              <h2 className="text-xl mb-4">Claim Form File</h2>
              <div className="p-3 bg-muted rounded-lg text-sm flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span className="flex-1 truncate">{claim.claim_file}</span>
              </div>
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