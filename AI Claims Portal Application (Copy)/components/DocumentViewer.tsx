import React from 'react';
import { UploadedFile } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface DocumentViewerProps {
  document: UploadedFile;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  return (
    <Dialog open={!!document} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{document.name}</DialogTitle>
              <DialogDescription>
                Document preview for {document.type.startsWith('image/') ? 'image' : 'file'}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6 pt-4">
          <div className="w-full h-96 border border-border rounded-lg overflow-hidden">
            {document.type.startsWith('image/') ? (
              <img
                src={document.url}
                alt={document.name}
                className="w-full h-full object-contain"
              />
            ) : document.type === 'application/pdf' ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">PDF Preview</p>
                  <p className="text-sm text-muted-foreground">{document.name}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.open(document.url, '_blank')}
                  >
                    Open in New Tab
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">File Preview Not Available</p>
                  <p className="text-sm text-muted-foreground">{document.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}