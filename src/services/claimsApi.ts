// API base URL - you can configure this based on your environment
// In development, we use '/api' which gets proxied to the backend by Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ClaimResponse {
  id: string;
  claim_status: 'PROCESSED' | 'PENDING' | 'ANOMALY_DETECTED';
  created_at: string;
  updated_at: string;
  anomalies: string[];
  bill: {
    amount: string;
    date: string;
    description: string;
    provider: string;
    receipt_attached: boolean;
  };
  bill_files: string[];
  claim: {
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
  claim_file: string;
}

export class ClaimsApiService {
  private async fetchWithErrorHandling(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getAllClaims(): Promise<ClaimResponse[]> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/claims`);
  }

  async getClaimById(id: string): Promise<ClaimResponse> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/claims/${id}`);
  }
}

// Export a singleton instance
export const claimsApi = new ClaimsApiService();
