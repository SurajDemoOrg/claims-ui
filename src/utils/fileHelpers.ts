import { fileService } from '../services/fileService';
import { logger } from './logger';

/**
 * Utility functions for file operations
 */

export const downloadFileFromStorage = async (filePath: string, fileName?: string): Promise<void> => {
  try {
    const file = await fileService.getFileFromStorage(filePath);
    if (!file) {
      throw new Error('File not found');
    }

    // Create a download link
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logger.info('File downloaded successfully', {
      component: 'fileHelpers',
      action: 'downloadFileFromStorage',
      metadata: {
        filePath,
        fileName: fileName || file.name
      }
    });
  } catch (error) {
    logger.error('Failed to download file', {
      component: 'fileHelpers',
      action: 'downloadFileFromStorage',
      metadata: { filePath }
    }, error as Error);
    throw error;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  return imageExtensions.includes(getFileExtension(fileName));
};

export const isPDFFile = (fileName: string): boolean => {
  return getFileExtension(fileName) === 'pdf';
};

/**
 * Get a preview URL for a file stored in localStorage
 */
export const getFilePreviewUrl = async (filePath: string): Promise<string | null> => {
  try {
    const file = await fileService.getFileFromStorage(filePath);
    if (!file) {
      return null;
    }

    return URL.createObjectURL(file);
  } catch (error) {
    logger.error('Failed to get file preview URL', {
      component: 'fileHelpers',
      action: 'getFilePreviewUrl',
      metadata: { filePath }
    }, error as Error);
    return null;
  }
};

/**
 * Clean up object URLs to prevent memory leaks
 */
export const revokeFilePreviewUrl = (url: string): void => {
  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    logger.warn('Failed to revoke object URL', {
      component: 'fileHelpers',
      action: 'revokeFilePreviewUrl',
      metadata: { url }
    });
  }
};
