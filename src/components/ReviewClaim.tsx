import { useState } from 'react';
import { ClaimFormData, UploadedFile, ExtractedReceiptData } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DocumentViewer } from './DocumentViewer';
import { AlertTriangle, FileText, Image } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ReviewClaimProps {
  formData: ClaimFormData;
  setFormData: (data: ClaimFormData) => void;
  claimForm: UploadedFile | null;
  receipts: UploadedFile[];
  extractedReceiptData: ExtractedReceiptData[];
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function ReviewClaim({
  formData,
  setFormData,
  claimForm,
  receipts,
  extractedReceiptData,
  onSubmit,
  isSubmitting = false
}: ReviewClaimProps) {
  const [selectedDocument, setSelectedDocument] = useState<UploadedFile | null>(null);

  // Mock anomaly detection
  const hasAmountAnomaly = formData.totalAmount === '127.50'; // Mock condition

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="flex h-full">
      {/* Left Column - Generated Form and Claim Form Preview */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl mb-4">Generated Claim Form</h1>
            <p className="text-muted-foreground">
              Please review the information below for accuracy before submitting.
            </p>
          </div>

          {/* Claim Form Preview */}
          {claimForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Uploaded Claim Form</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setSelectedDocument(claimForm)}
                >
                  {getFileIcon(claimForm.type)}
                  <span className="flex-1 text-sm">{claimForm.name}</span>
                  <span className="text-xs text-muted-foreground">Click to preview</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Editable Form */}
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="participantName">Participant Name</Label>
                <Input
                  id="participantName"
                  value={formData.participantName}
                  onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfService">Date of Service</Label>
                <Input
                  id="dateOfService"
                  type="date"
                  value={formData.dateOfService}
                  onChange={(e) => setFormData({ ...formData, dateOfService: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="providerName">Provider Name</Label>
                <Input
                  id="providerName"
                  value={formData.providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Claim Amount</Label>
                <div className="relative">
                  <Input
                    id="totalAmount"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    className={hasAmountAnomaly ? 'bg-yellow-50 border-yellow-300' : ''}
                  />
                  {hasAmountAnomaly && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertTriangle className="absolute right-3 top-3 w-4 h-4 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>The total amount on the form does not match the sum of your uploaded receipts. Please check the values.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Button 
              onClick={onSubmit} 
              size="lg" 
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:hover:scale-100 disabled:shadow-md"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Claim'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column - Bill Receipts and Extracted Data */}
      <div className="w-96 border-l border-border p-6 overflow-auto">
        <div className="space-y-6">
          {/* Bill Receipts Only */}
          {receipts.length > 0 && (
            <div>
              <h2 className="text-xl mb-4">Bill Receipts ({receipts.length})</h2>
              <div className="grid grid-cols-2 gap-3">
                {receipts.map((receipt) => (
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