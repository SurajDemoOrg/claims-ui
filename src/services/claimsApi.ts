import { logger } from '../utils/logger';

// API base URL - you can configure this based on your environment
// In development, we use '/api' which gets proxied to the backend by Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ClaimResponse {
  id: string;
  claim_status: 'PROCESSED' | 'PENDING' | 'ANOMALY_DETECTED';
  created_at: string;
  updated_at: string;
  anomalies: string[];
  
  // New API structure
  claim?: {
    'Day Care Cost': number | null;
    'Employee ID': string;
    'Employer Name': string;
    'Lists': {
      'Out of Pocket Cost': number;
      'Plan Type': string;
      'Provider': string;
      'Service End Date': string;
      'Service Start Date': string;
      'Type of Service': string;
    }[];
    'Participant Name': string;
    'Provider Name': string;
    'Provider Signature': string;
    'Service EndDate': string;
    'Service StartDate': string;
    'Social Security Number': string;
    'Total Cost': number;
  };
  
  bill?: {
    filename: string;
    patient_name: string;
    provider_name: string;
    service_date: string;
    total_cost: string;
  }[];

  // Legacy API structure for backward compatibility
  legacyBill?: {
    amount: string;
    date: string;
    description: string;
    provider: string;
    receipt_attached: boolean;
  };
  bill_files?: string[];
  legacyClaim?: {
    'Participant Name (First, MI, Last)': string;
    'Receipts.Date of service': string;
    'Provider Name': string;
    'Out-of-Pocket Cost (i.e. Patient Responsibility)': string;
    'Description of service or item purchased': string;
    'Service Dates (start and end dates)': string;
    'Employee ID': string;
    'Employer Name': string;
    'Plan Type': string;
    'Social Security Number': string;
    receipt_attached: boolean;
    'Receipts.Description of service or item purchased': string;
    'Receipts.Dollar amount': string;
    'Receipts.Name of provider': string;
    'Daycare Cost (Dependent Care FSA)': string;
    'Dependent Care FSA Provider Name': string;
    'Dependent Care FSA Service Dates (start and end dates)': string;
    'Provider\'s Signature (Dependent Care FSA)': string;
    'Total: $ (Dependent Care FSA)': string;
  };
  claim_file?: string;
}

export class ClaimsApiService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit): Promise<any> {
    const method = options?.method || 'GET';
    const startTime = performance.now();
    
    // Generate correlation ID for this request
    const correlationId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.apiRequest(method, url, {
      component: 'ClaimsApiService',
      correlationId,
      metadata: {
        hasBody: !!options?.body,
        bodyType: options?.body ? (options.body instanceof FormData ? 'FormData' : typeof options.body) : 'none'
      }
    });

    try {
      // Add timeout for file uploads (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const duration = performance.now() - startTime;
      
      logger.apiResponse(method, url, response.status, duration, {
        component: 'ClaimsApiService',
        correlationId
      });

      if (!response.ok) {
        // Try to get error response body for better debugging
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorDetails += ` - ${errorBody}`;
          }
        } catch (e) {
          // Ignore if we can't read the error body
        }
        
        const errorMessage = errorDetails;
        logger.apiError(method, url, new Error(errorMessage), {
          component: 'ClaimsApiService',
          correlationId,
          metadata: { 
            status: response.status, 
            statusText: response.statusText,
            contentType: response.headers.get('Content-Type')
          }
        });
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      logger.debug('API response data received', {
        component: 'ClaimsApiService',
        correlationId,
        metadata: { dataType: typeof data, hasData: !!data }
      });
      
      return data;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Check if it's an abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error('Request timed out after 30 seconds');
        logger.apiError(method, url, timeoutError, {
          component: 'ClaimsApiService',
          correlationId,
          metadata: { duration, errorType: 'timeout' }
        });
        throw timeoutError;
      }
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new Error('Network error - unable to connect to server. Check if the backend is running and CORS is configured properly.');
        logger.apiError(method, url, networkError, {
          component: 'ClaimsApiService',
          correlationId,
          metadata: { duration, errorType: 'network', originalError: error.message }
        });
        throw networkError;
      }
      
      logger.apiError(method, url, error as Error, {
        component: 'ClaimsApiService',
        correlationId,
        metadata: { duration, errorType: 'unknown' }
      });
      throw error;
    }
  }

  async getAllClaims(): Promise<ClaimResponse[]> {
    logger.info('Fetching all claims', {
      component: 'ClaimsApiService',
      action: 'getAllClaims'
    });
    
    const claims = await this.fetchWithErrorHandling(`${API_BASE_URL}/claims`);
    
    logger.info('Successfully fetched claims', {
      component: 'ClaimsApiService',
      action: 'getAllClaims',
      metadata: { count: claims?.length || 0 }
    });
    
    return claims;
  }

  async getClaimById(id: string): Promise<ClaimResponse> {
    logger.info('Fetching claim by ID', {
      component: 'ClaimsApiService',
      action: 'getClaimById',
      claimId: id
    });
    
    const claim = await this.fetchWithErrorHandling(`${API_BASE_URL}/claims/${id}`);
    
    logger.info('Successfully fetched claim', {
      component: 'ClaimsApiService',
      action: 'getClaimById',
      claimId: id,
      metadata: { status: claim?.claim_status }
    });
    
    return claim;
  }

  async submitClaim(claimFormFile: File, receiptFiles: File[]): Promise<ClaimResponse> {
    logger.info('Submitting new claim', {
      component: 'ClaimsApiService',
      action: 'submitClaim',
      metadata: {
        claimFormName: claimFormFile.name,
        claimFormType: claimFormFile.type,
        claimFormSize: claimFormFile.size,
        receiptCount: receiptFiles.length,
        receiptNames: receiptFiles.map(f => f.name),
        receiptTypes: receiptFiles.map(f => f.type),
        receiptSizes: receiptFiles.map(f => f.size),
        totalSize: claimFormFile.size + receiptFiles.reduce((sum, f) => sum + f.size, 0)
      }
    });

    const formData = new FormData();
    
    // Add claim form file
    formData.append('claim_file', claimFormFile);
    logger.debug('Added claim form to FormData', {
      component: 'ClaimsApiService',
      action: 'submitClaim',
      metadata: { 
        fileName: claimFormFile.name, 
        fileType: claimFormFile.type,
        fileSize: claimFormFile.size 
      }
    });
    
    // Add bill receipts
    receiptFiles.forEach((file, index) => {
      formData.append('bill_files', file);
      logger.debug('Added receipt to FormData', {
        component: 'ClaimsApiService',
        action: 'submitClaim',
        metadata: { 
          index, 
          fileName: file.name, 
          fileType: file.type,
          fileSize: file.size 
        }
      });
    });

    const result = await this.fetchWithErrorHandling(`${API_BASE_URL}/claims`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let the browser set it automatically for FormData
      // This ensures proper multipart/form-data with boundary is set
    });
    
    logger.info('Successfully submitted claim', {
      component: 'ClaimsApiService',
      action: 'submitClaim',
      claimId: result?.id,
      metadata: { status: result?.claim_status }
    });
    
    return result;
  }
}

// Export a singleton instance
export const claimsApi = new ClaimsApiService();
