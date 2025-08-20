import { ClaimResponse } from './claimsApi';
import { PreviousClaim, DetailedClaim } from '../App';
import { logger } from '../utils/logger';

// Transform API response to PreviousClaim format
export function transformToPreviousClaim(apiClaim: ClaimResponse): PreviousClaim {
  logger.debug('Transforming API claim to PreviousClaim format', {
    component: 'dataTransformers',
    action: 'transformToPreviousClaim',
    claimId: apiClaim.id,
    metadata: { status: apiClaim.claim_status }
  });

  // Handle both new and legacy API structures
  const participantName = apiClaim.claim?.['Participant Name'] || 
                          apiClaim.legacyClaim?.['Participant Name (First, MI, Last)'] || 
                          'Unknown';
  
  const totalAmount = apiClaim.claim?.['Total Cost'] ? 
                     `$${apiClaim.claim['Total Cost']}` : 
                     `$${apiClaim.legacyBill?.amount || '0'}`;

  const transformed = {
    id: apiClaim.id,
    dateSubmitted: new Date(apiClaim.created_at).toLocaleDateString(),
    participantName,
    totalAmount,
    status: apiClaim.claim_status,
    anomalies: apiClaim.anomalies,
    employeeId: apiClaim.claim?.['Employee ID'] || apiClaim.legacyClaim?.['Employee ID'],
    employerName: apiClaim.claim?.['Employer Name'] || apiClaim.legacyClaim?.['Employer Name'],
    planType: apiClaim.claim?.['Lists']?.[0]?.['Plan Type'] || apiClaim.legacyClaim?.['Plan Type'],
    provider: apiClaim.claim?.['Provider Name'] || apiClaim.legacyBill?.provider
  };

  logger.debug('Successfully transformed PreviousClaim', {
    component: 'dataTransformers',
    action: 'transformToPreviousClaim',
    claimId: apiClaim.id,
    metadata: { 
      participantName: transformed.participantName,
      hasAnomalies: transformed.anomalies.length > 0
    }
  });

  return transformed;
}

// Transform API response to DetailedClaim format
export function transformToDetailedClaim(apiClaim: ClaimResponse): DetailedClaim {
  logger.debug('Transforming API claim to DetailedClaim format', {
    component: 'dataTransformers',
    action: 'transformToDetailedClaim',
    claimId: apiClaim.id,
    metadata: { 
      status: apiClaim.claim_status,
      billFileCount: apiClaim.bill_files.length,
      hasAnomalies: apiClaim.anomalies.length > 0
    }
  });

  const transformed = {
    id: apiClaim.id,
    dateSubmitted: new Date(apiClaim.created_at).toLocaleDateString(),
    participantName: apiClaim.claim['Participant Name (First, MI, Last)'] || 'Unknown',
    totalAmount: `$${apiClaim.bill.amount}`,
    status: apiClaim.claim_status,
    anomalies: apiClaim.anomalies,
    created_at: apiClaim.created_at,
    updated_at: apiClaim.updated_at,
    bill: apiClaim.bill,
    bill_files: apiClaim.bill_files,
    claim: apiClaim.claim,
    claim_file: apiClaim.claim_file,
    // New structured claim data
    claimData: {
      participantName: apiClaim.claim?.['Participant Name'] || 'Unknown',
      socialSecurityNumber: apiClaim.claim?.['Social Security Number'] || '',
      employerName: apiClaim.claim?.['Employer Name'] || '',
      employeeId: apiClaim.claim?.['Employee ID'] || '',
      lists: apiClaim.claim?.['Lists'] || [], // Now using the actual API Lists structure
      totalCost: apiClaim.claim?.['Total Cost'] || parseFloat(apiClaim.bill?.amount) || 0,
      serviceStartDate: apiClaim.claim?.['Service StartDate'] || '',
      serviceEndDate: apiClaim.claim?.['Service EndDate'] || '',
      providerName: apiClaim.claim?.['Provider Name'] || apiClaim.bill?.provider || '',
      providerSignature: apiClaim.claim?.['Provider Signature'] || '',
      dayCareCost: apiClaim.claim?.['Day Care Cost'] || undefined
    },
    // New structured bill data matching API response
    billData: apiClaim.bill || [],
    // Transform to legacy format for existing components
    formData: {
      participantName: apiClaim.claim?.['Participant Name'] || 'Unknown',
      socialSecurityNumber: apiClaim.claim?.['Social Security Number'],
      employerName: apiClaim.claim?.['Employer Name'],
      employeeId: apiClaim.claim?.['Employee ID'],
      serviceStartDate: apiClaim.claim?.['Service StartDate'] || '',
      serviceEndDate: apiClaim.claim?.['Service EndDate'] || '',
      providerName: apiClaim.claim['Provider Name'] || apiClaim.bill.provider,
      typeOfService: apiClaim.claim['Description of service or item purchased'] || '',
      outOfPocketCost: parseFloat(apiClaim.bill.amount) || 0,
      totalCost: parseFloat(apiClaim.bill.amount) || 0,
      providerSignature: apiClaim.claim['Provider\'s Signature (Dependent Care FSA)'],
      dayCareCost: parseFloat(apiClaim.claim['Daycare Cost (Dependent Care FSA)']) || undefined
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
      providerName: apiClaim.claim['Receipts.Name of provider'] || apiClaim.bill.provider,
      patientName: apiClaim.claim['Participant Name (First, MI, Last)'],
      serviceDate: apiClaim.claim['Receipts.Date of service'] || apiClaim.bill.date,
      totalCost: `$${apiClaim.claim['Receipts.Dollar amount'] || apiClaim.bill.amount}`
    }))
  };

  logger.debug('Successfully transformed DetailedClaim', {
    component: 'dataTransformers',
    action: 'transformToDetailedClaim',
    claimId: apiClaim.id,
    metadata: { 
      participantName: transformed.participantName,
      receiptCount: transformed.receipts?.length || 0,
      extractedDataCount: transformed.extractedReceiptData?.length || 0
    }
  });

  return transformed;
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
