import { logger } from '../utils/logger';

export interface SaveFileOptions {
  claimId: string;
  file: File;
  fileType: 'claim' | 'bill';
}

export class FileService {

  private async saveFileToStorage(file: File, path: string): Promise<void> {
    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      // Store in localStorage with the path as key
      const fileInfo = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: fileData,
        savedAt: new Date().toISOString()
      };

      localStorage.setItem(`file:${path}`, JSON.stringify(fileInfo));
      
      logger.info('File saved to browser storage', {
        component: 'FileService',
        action: 'saveFileToStorage',
        metadata: {
          path,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }
      });
    } catch (error) {
      logger.error('Failed to save file to storage', {
        component: 'FileService',
        action: 'saveFileToStorage',
        metadata: { path, fileName: file.name }
      }, error as Error);
      throw error;
    }
  }

  async saveClaimFiles(claimId: string, claimFile: File, billFiles: File[]): Promise<void> {
    logger.info('Saving claim files', {
      component: 'FileService',
      action: 'saveClaimFiles',
      claimId,
      metadata: {
        claimFileName: claimFile.name,
        billCount: billFiles.length,
        billFileNames: billFiles.map(f => f.name)
      }
    });

    try {
      // Save claim file to /documents/{claimId}/claim/
      const claimPath = `/documents/${claimId}/claim/${claimFile.name}`;
      await this.saveFileToStorage(claimFile, claimPath);

      // Save bill files to /documents/{claimId}/bills/
      const billSavePromises = billFiles.map(async (billFile, index) => {
        const billPath = `/documents/${claimId}/bills/${billFile.name}`;
        await this.saveFileToStorage(billFile, billPath);
        
        logger.debug('Bill file saved', {
          component: 'FileService',
          action: 'saveClaimFiles',
          claimId,
          metadata: {
            billIndex: index,
            billFileName: billFile.name,
            billPath
          }
        });
      });

      await Promise.all(billSavePromises);

      logger.info('All claim files saved successfully', {
        component: 'FileService',
        action: 'saveClaimFiles',
        claimId,
        metadata: {
          claimPath,
          billPaths: billFiles.map(f => `/documents/${claimId}/bills/${f.name}`)
        }
      });
    } catch (error) {
      logger.error('Failed to save claim files', {
        component: 'FileService',
        action: 'saveClaimFiles',
        claimId
      }, error as Error);
      throw error;
    }
  }

  async getFileFromStorage(path: string): Promise<File | null> {
    try {
      const storedData = localStorage.getItem(`file:${path}`);
      if (!storedData) {
        return null;
      }

      const fileInfo = JSON.parse(storedData);
      
      // Convert base64 back to blob
      const response = await fetch(fileInfo.data);
      const blob = await response.blob();
      
      // Create File object
      const file = new File([blob], fileInfo.name, { type: fileInfo.type });
      
      logger.debug('File retrieved from storage', {
        component: 'FileService',
        action: 'getFileFromStorage',
        metadata: {
          path,
          fileName: fileInfo.name,
          fileType: fileInfo.type
        }
      });
      
      return file;
    } catch (error) {
      logger.error('Failed to retrieve file from storage', {
        component: 'FileService',
        action: 'getFileFromStorage',
        metadata: { path }
      }, error as Error);
      return null;
    }
  }

  async listClaimFiles(claimId: string): Promise<{ claimFiles: string[], billFiles: string[] }> {
    try {
      const claimFiles: string[] = [];
      const billFiles: string[] = [];

      // Iterate through localStorage to find files for this claim
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`file:/documents/${claimId}/`)) {
          const path = key.replace('file:', '');
          if (path.includes('/claim/')) {
            claimFiles.push(path);
          } else if (path.includes('/bills/')) {
            billFiles.push(path);
          }
        }
      }

      logger.debug('Listed claim files', {
        component: 'FileService',
        action: 'listClaimFiles',
        claimId,
        metadata: {
          claimFileCount: claimFiles.length,
          billFileCount: billFiles.length
        }
      });

      return { claimFiles, billFiles };
    } catch (error) {
      logger.error('Failed to list claim files', {
        component: 'FileService',
        action: 'listClaimFiles',
        claimId
      }, error as Error);
      return { claimFiles: [], billFiles: [] };
    }
  }

  async deleteClaimFiles(claimId: string): Promise<void> {
    try {
      const keysToDelete: string[] = [];
      
      // Find all keys for this claim
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`file:/documents/${claimId}/`)) {
          keysToDelete.push(key);
        }
      }

      // Delete all found keys
      keysToDelete.forEach(key => localStorage.removeItem(key));

      logger.info('Claim files deleted', {
        component: 'FileService',
        action: 'deleteClaimFiles',
        claimId,
        metadata: {
          deletedCount: keysToDelete.length
        }
      });
    } catch (error) {
      logger.error('Failed to delete claim files', {
        component: 'FileService',
        action: 'deleteClaimFiles',
        claimId
      }, error as Error);
      throw error;
    }
  }
}

// Export a singleton instance
export const fileService = new FileService();