import { useState, useEffect } from 'react';
import { fileService } from '../services/fileService';
import { downloadFileFromStorage, formatFileSize, isImageFile, isPDFFile } from '../utils/fileHelpers';
import { logger } from '../utils/logger';

interface SavedFilesViewerProps {
  claimId: string;
  className?: string;
}

interface FileInfo {
  path: string;
  name: string;
  type: string;
  size: number;
  savedAt: string;
}

export function SavedFilesViewer({ claimId, className = '' }: SavedFilesViewerProps) {
  const [claimFiles, setClaimFiles] = useState<FileInfo[]>([]);
  const [billFiles, setBillFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedFiles();
  }, [claimId]);

  const loadSavedFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const { claimFiles: claimPaths, billFiles: billPaths } = await fileService.listClaimFiles(claimId);
      
      // Get file info for each path
      const claimFileInfos = await Promise.all(
        claimPaths.map(async (path) => {
          const storedData = localStorage.getItem(`file:${path}`);
          if (storedData) {
            const fileInfo = JSON.parse(storedData);
            return {
              path,
              name: fileInfo.name,
              type: fileInfo.type,
              size: fileInfo.size,
              savedAt: fileInfo.savedAt
            };
          }
          return null;
        })
      );

      const billFileInfos = await Promise.all(
        billPaths.map(async (path) => {
          const storedData = localStorage.getItem(`file:${path}`);
          if (storedData) {
            const fileInfo = JSON.parse(storedData);
            return {
              path,
              name: fileInfo.name,
              type: fileInfo.type,
              size: fileInfo.size,
              savedAt: fileInfo.savedAt
            };
          }
          return null;
        })
      );

      setClaimFiles(claimFileInfos.filter((f): f is FileInfo => f !== null));
      setBillFiles(billFileInfos.filter((f): f is FileInfo => f !== null));

      logger.debug('Loaded saved files for claim', {
        component: 'SavedFilesViewer',
        action: 'loadSavedFiles',
        claimId,
        metadata: {
          claimFileCount: claimFileInfos.filter(f => f !== null).length,
          billFileCount: billFileInfos.filter(f => f !== null).length
        }
      });
    } catch (err) {
      const errorMessage = 'Failed to load saved files';
      setError(errorMessage);
      logger.error('Failed to load saved files', {
        component: 'SavedFilesViewer',
        action: 'loadSavedFiles',
        claimId
      }, err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: FileInfo) => {
    try {
      await downloadFileFromStorage(file.path, file.name);
      logger.userAction('file_downloaded', {
        component: 'SavedFilesViewer',
        claimId,
        metadata: {
          fileName: file.name,
          filePath: file.path
        }
      });
    } catch (err) {
      logger.error('Failed to download file', {
        component: 'SavedFilesViewer',
        action: 'handleDownload',
        claimId,
        metadata: { fileName: file.name }
      }, err as Error);
    }
  };

  const getFileIcon = (file: FileInfo) => {
    if (isPDFFile(file.name)) {
      return (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (isImageFile(file.name)) {
      return (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  const FileList = ({ files, title }: { files: FileInfo[], title: string }) => (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-900 mb-3">{title} ({files.length})</h4>
      {files.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No files saved</p>
      ) : (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • Saved {new Date(file.savedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(file)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <span className="ml-2 text-sm text-gray-600">Loading saved files...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Files</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadSavedFiles}
                className="text-sm text-red-600 hover:text-red-500 underline mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (claimFiles.length === 0 && billFiles.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900">No Files Saved</h3>
          <p className="text-sm text-gray-500 mt-1">No files have been saved locally for this claim yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-medium text-gray-900">Saved Files</h3>
          <p className="text-sm text-gray-600">Files saved locally in your browser storage</p>
        </div>
        
        <FileList files={claimFiles} title="Claim Documents" />
        <FileList files={billFiles} title="Bill Receipts" />
      </div>
    </div>
  );
}
