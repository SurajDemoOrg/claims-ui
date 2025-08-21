import { useState } from 'react';
import { UploadedFile } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { X, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink } from 'lucide-react';

interface DocumentViewerProps {
  document: UploadedFile;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    link.click();
  };

  const isImage = document.type.startsWith('image/');
  const isPDF = document.type === 'application/pdf';

  return (
    <Dialog open={!!document} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 flex flex-col">
        <DialogHeader className="p-4 pb-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="truncate">{document.name}</DialogTitle>
              <DialogDescription>
                {isImage ? 'Image' : isPDF ? 'PDF Document' : 'File'} • {Math.round(document.url.length / 1024)}KB
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {/* Zoom and rotation controls for images */}
              {isImage && (
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
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {/* External link for PDFs */}
              {isPDF && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(document.url, '_blank')}
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
            {isImage ? (
              <div 
                className="max-w-full max-h-full transition-transform duration-200 ease-in-out"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                }}
              >
                <img
                  src={document.url}
                  alt={document.name}
                  className="max-w-none h-auto shadow-lg rounded-lg"
                  style={{
                    maxHeight: rotation % 180 === 0 ? '70vh' : '70vw',
                    maxWidth: rotation % 180 === 0 ? '70vw' : '70vh',
                  }}
                />
              </div>
            ) : isPDF ? (
              <div className="w-full h-full min-h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
                <iframe
                  src={`${document.url}#view=FitH`}
                  className="w-full h-full border-0"
                  title={document.name}
                />
              </div>
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-white rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <X className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
                  <p className="text-muted-foreground mb-4">{document.name}</p>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="mr-2"
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