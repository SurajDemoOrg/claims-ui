import React from 'react';
import { UploadedFile } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileUpload } from './FileUpload';

interface ProcessNewClaimProps {
  claimForm: UploadedFile | null;
  receipts: UploadedFile[];
  setClaimForm: (file: UploadedFile | null) => void;
  setReceipts: (files: UploadedFile[]) => void;
  onProcessReview: () => void;
}

export function ProcessNewClaim({
  claimForm,
  receipts,
  setClaimForm,
  setReceipts,
  onProcessReview
}: ProcessNewClaimProps) {
  const canProcess = claimForm && receipts.length > 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl mb-4">Process New Claim</h1>
        <p className="text-muted-foreground">
          Please upload your claim form and all associated receipts to get started.
        </p>
      </div>

      <div className="space-y-8">
        {/* Claim Form Upload */}
        <Card>
          <CardHeader>
            <CardTitle>1. Upload Claim Form</CardTitle>
            <CardDescription>
              Please upload your completed reimbursement claim form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              file={claimForm}
              onFileSelect={(file) => setClaimForm(file)}
              onFileRemove={() => setClaimForm(null)}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple={false}
              supportText="One file supported. PDF, JPG, PNG."
            />
          </CardContent>
        </Card>

        {/* Bill Receipts Upload */}
        <Card>
          <CardHeader>
            <CardTitle>2. Upload Bill Receipts</CardTitle>
            <CardDescription>
              Please upload all associated medical receipts or bills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              files={receipts}
              onFilesSelect={(files) => setReceipts(files)}
              onFileRemove={(fileId) => {
                setReceipts(receipts.filter(f => f.id !== fileId));
              }}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple={true}
              supportText="Multiple files supported. PDF, JPG, PNG."
            />
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={onProcessReview}
            disabled={!canProcess}
            size="lg"
          >
            Process & Review
          </Button>
        </div>
      </div>
    </div>
  );
}