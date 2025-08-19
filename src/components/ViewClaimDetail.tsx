import React, { useState } from 'react';
import { DetailedClaim } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DocumentViewer } from './DocumentViewer';
import { ArrowLeft, FileText, Image, AlertTriangle } from 'lucide-react';

interface ViewClaimDetailProps {
  claim: DetailedClaim;
  onBack: () => void;
}

export function ViewClaimDetail({ claim, onBack }: ViewClaimDetailProps) {
  const [selectedDocument, setSelectedDocument] = useState<typeof claim.claimForm | typeof claim.receipts[0] | null>(null);

  const getStatusVariant = (status: DetailedClaim['status']) => {
    switch (status) {
      case 'Processed':
        return 'default' as const;
      case 'Pending Review':
        return 'secondary' as const;
      case 'Anomaly Found':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  const getStatusColor = (status: DetailedClaim['status']) => {
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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const hasAnomaly = claim.status === 'Anomaly Found';

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
                {claim.status}
              </Badge>
            </div>
          </div>

          {/* Claim Form Preview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Original Claim Form</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setSelectedDocument(claim.claimForm)}
              >
                {getFileIcon(claim.claimForm.type)}
                <span className="flex-1 text-sm">{claim.claimForm.name}</span>
                <span className="text-xs text-muted-foreground">Click to preview</span>
              </div>
            </CardContent>
          </Card>

          {/* Claim Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Claim Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="participantName">Participant Name</Label>
                <Input
                  id="participantName"
                  value={claim.formData.participantName}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfService">Date of Service</Label>
                <Input
                  id="dateOfService"
                  type="date"
                  value={claim.formData.dateOfService}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="providerName">Provider Name</Label>
                <Input
                  id="providerName"
                  value={claim.formData.providerName}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Claim Amount</Label>
                <div className="relative">
                  <Input
                    id="totalAmount"
                    value={`$${claim.formData.totalAmount}`}
                    readOnly
                    className={hasAnomaly ? 'bg-yellow-50 border-yellow-300' : 'bg-muted'}
                  />
                  {hasAnomaly && (
                    <AlertTriangle className="absolute right-3 top-3 w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={claim.formData.description}
                  readOnly
                  className="bg-muted"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Bill Receipts and Extracted Data */}
      <div className="w-96 border-l border-border p-6 overflow-auto">
        <div className="space-y-6">
          {/* Bill Receipts */}
          {claim.receipts.length > 0 && (
            <div>
              <h2 className="text-xl mb-4">Bill Receipts ({claim.receipts.length})</h2>
              <div className="grid grid-cols-2 gap-3">
                {claim.receipts.map((receipt) => (
                  <button
                    key={receipt.id}
                    onClick={() => setSelectedDocument(receipt)}
                    className="p-3 border border-border rounded-lg hover:border-primary transition-colors text-left"
                  >
                    <div className="w-full h-16 bg-muted rounded mb-2 flex items-center justify-center">
                      {getFileIcon(receipt.type)}
                    </div>
                    <p className="text-xs truncate">{receipt.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Receipt Data */}
          {claim.extractedReceiptData.length > 0 && (
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
                        {claim.extractedReceiptData.map((data) => (
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
                  <span className="text-sm font-medium">Total from {claim.extractedReceiptData.length} Receipt{claim.extractedReceiptData.length !== 1 ? 's' : ''}:</span>
                  <span className="text-sm font-medium">
                    ${claim.extractedReceiptData.reduce((sum, item) => 
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