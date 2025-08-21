import { useState, useEffect } from 'react';
import { UploadedFile } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink, File, Archive } from 'lucide-react';
import { fileService } from '../services/fileService';
import { formatFileSize } from '../utils/fileHelpers';
import { logger } from '../utils/logger';

interface SavedFileDocument {
  id: string;
  path: string;
  name: string;
  type: string;
  size: number;
  savedAt: string;
  isSaved: true;
}

type DocumentType = UploadedFile | SavedFileDocument;

interface DocumentViewerProps {
  document: DocumentType;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if document is a saved file
  const isSavedFile = 'isSaved' in document && document.isSaved;
  
  useEffect(() => {
    loadDocumentUrl();
    return () => {
      // Cleanup any created blob URLs
      if (documentUrl && documentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [document]);

  const loadDocumentUrl = async () => {
    if (isSavedFile) {
      // Load from localStorage
      setLoading(true);
      setError(null);
      try {
        const savedDocument = document as SavedFileDocument;
        const file = await fileService.getFileFromStorage(savedDocument.path);
        if (file) {
          const url = URL.createObjectURL(file);
          setDocumentUrl(url);
          logger.debug('Loaded saved file for viewing', {
            component: 'DocumentViewer',
            action: 'loadDocumentUrl',
            metadata: {
              fileName: savedDocument.name,
              filePath: savedDocument.path
            }
          });
        } else {
          throw new Error('File not found in storage');
        }
      } catch (err) {
        const errorMessage = 'Failed to load saved file';
        setError(errorMessage);
        logger.error('Failed to load saved file for viewing', {
          component: 'DocumentViewer',
          action: 'loadDocumentUrl',
          metadata: { fileName: document.name }
        }, err as Error);
      } finally {
        setLoading(false);
      }
    } else {
      // Use original uploaded file URL
      const uploadedDocument = document as UploadedFile;
      setDocumentUrl(uploadedDocument.url);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = async () => {
    try {
      if (isSavedFile) {
        // Download saved file from localStorage
        const savedDocument = document as SavedFileDocument;
        const file = await fileService.getFileFromStorage(savedDocument.path);
        if (file) {
          const url = URL.createObjectURL(file);
          const link = window.document.createElement('a');
          link.href = url;
          link.download = savedDocument.name;
          link.click();
          URL.revokeObjectURL(url);
          
          logger.userAction('saved_file_downloaded_from_viewer', {
            component: 'DocumentViewer',
            metadata: {
              fileName: savedDocument.name,
              filePath: savedDocument.path
            }
          });
        }
      } else {
        // Download original uploaded file
        const uploadedDocument = document as UploadedFile;
        const link = window.document.createElement('a');
        link.href = uploadedDocument.url;
        link.download = uploadedDocument.name;
        link.click();
        
        logger.userAction('original_file_downloaded_from_viewer', {
          component: 'DocumentViewer',
          metadata: {
            fileName: uploadedDocument.name
          }
        });
      }
    } catch (err) {
      logger.error('Failed to download file from viewer', {
        component: 'DocumentViewer',
        action: 'handleDownload',
        metadata: { fileName: document.name }
      }, err as Error);
    }
  };

  const getFileSize = () => {
    if (isSavedFile) {
      return formatFileSize((document as SavedFileDocument).size);
    } else {
      // Estimate size from URL length for uploaded files
      return `${Math.round((document as UploadedFile).url.length / 1024)}KB`;
    }
  };

  const isImage = document.type.startsWith('image/');
  const isPDF = document.type === 'application/pdf';

  return (
    <Dialog open={!!document} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 flex flex-col">
        <DialogHeader className="p-4 pb-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="truncate">{document.name}</DialogTitle>
                {isSavedFile && (
                  <Badge variant="secondary" className="text-xs">
                    Saved File
                  </Badge>
                )}
              </div>
              <DialogDescription>
                {isImage ? 'Image' : isPDF ? 'PDF Document' : 'File'} • {getFileSize()}
                {isSavedFile && (
                  <span className="text-muted-foreground">
                    {' • Saved on '}
                    {new Date((document as SavedFileDocument).savedAt).toLocaleDateString()}
                  </span>
                )}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {/* Zoom and rotation controls for images */}
              {isImage && !loading && !error && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-2 min-w-[3rem] text-center">
                    {zoom}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRotate}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {/* Download button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {/* External link for PDFs */}
              {isPDF && !loading && !error && documentUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(documentUrl, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="w-full h-full flex items-center justify-center">
            {loading ? (
              // Loading state
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading {isSavedFile ? 'saved ' : ''}file...</p>
              </div>
            ) : error ? (
              // Error state
              <div className="w-full h-96 flex items-center justify-center bg-white rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-lg flex items-center justify-center">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load File</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Try Download
                  </Button>
                </div>
              </div>
            ) : isImage && documentUrl ? (
              // Image display
              <div 
                className="max-w-full max-h-full transition-transform duration-200 ease-in-out"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                }}
              >
                <img
                  src={documentUrl}
                  alt={document.name}
                  className="max-w-none h-auto shadow-lg rounded-lg"
                  style={{
                    maxHeight: rotation % 180 === 0 ? '70vh' : '70vw',
                    maxWidth: rotation % 180 === 0 ? '70vw' : '70vh',
                  }}
                  onError={() => setError('Failed to load image')}
                />
              </div>
            ) : isPDF && documentUrl ? (
              // PDF display
              <div className="w-full h-full min-h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
                <iframe
                  src={`${documentUrl}#view=FitH`}
                  className="w-full h-full border-0"
                  title={document.name}
                  onError={() => setError('Failed to load PDF')}
                />
              </div>
            ) : (
              // Fallback for unsupported file types
              <div className="w-full h-96 flex items-center justify-center bg-white rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <File className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
                  <p className="text-muted-foreground mb-2">{document.name}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isSavedFile ? 'Saved file' : 'Uploaded file'} • {getFileSize()}
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={loading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}