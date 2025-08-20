import { ClaimResponse } from './claimsApi';
import { PreviousClaim, DetailedClaim } from '../App';

// Transform API response to PreviousClaim format
export function transformToPreviousClaim(apiClaim: ClaimResponse): PreviousClaim {
  return {
    id: apiClaim.id,
    dateSubmitted: new Date(apiClaim.created_at).toLocaleDateString(),
    claimantName: apiClaim.claim['Participant Name (First, MI, Last)'] || 'Unknown',
    totalAmount: `$${apiClaim.bill.amount}`,
    status: apiClaim.claim_status,
    anomalies: apiClaim.anomalies
  };
}

// Transform API response to DetailedClaim format
export function transformToDetailedClaim(apiClaim: ClaimResponse): DetailedClaim {
  return {
    id: apiClaim.id,
    dateSubmitted: new Date(apiClaim.created_at).toLocaleDateString(),
    claimantName: apiClaim.claim['Participant Name (First, MI, Last)'] || 'Unknown',
    totalAmount: `$${apiClaim.bill.amount}`,
    status: apiClaim.claim_status,
    anomalies: apiClaim.anomalies,
    bill: apiClaim.bill,
    bill_files: apiClaim.bill_files,
    claim: apiClaim.claim,
    claim_file: apiClaim.claim_file,
    // Transform to legacy format for existing components
    formData: {
      participantName: apiClaim.claim['Participant Name (First, MI, Last)'],
      dateOfService: apiClaim.claim['Receipts.Date of service'] || apiClaim.bill.date,
      providerName: apiClaim.claim['Provider Name'] || apiClaim.bill.provider,
      totalAmount: apiClaim.bill.amount,
      description: apiClaim.claim['Description of service or item purchased'] || apiClaim.bill.description
    },
    claimForm: {
      id: `form-${apiClaim.id}`,
      name: apiClaim.claim_file,
      type: 'application/pdf',
      url: `#` // Placeholder - you may need to construct the actual URL
    },
    receipts: apiClaim.bill_files.map((fileName, index) => ({
      id: `receipt-${apiClaim.id}-${index}`,
      name: fileName,
      type: fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      url: `#` // Placeholder - you may need to construct the actual URL
    })),
    extractedReceiptData: apiClaim.bill_files.map((fileName, index) => ({
      id: `receipt-${apiClaim.id}-${index}`,
      fileName: fileName,
      patientName: apiClaim.claim['Participant Name (First, MI, Last)'],
      dateOfService: apiClaim.claim['Receipts.Date of service'] || apiClaim.bill.date,
      providerName: apiClaim.claim['Receipts.Name of provider'] || apiClaim.bill.provider,
      totalCost: `$${apiClaim.claim['Receipts.Dollar amount'] || apiClaim.bill.amount}`
    }))
  };
}

// Helper function to map API status to display status
export function getDisplayStatus(status: ClaimResponse['claim_status']): string {
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
}
