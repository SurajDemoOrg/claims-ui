import { useRef, useState } from 'react';
import { UploadedFile } from '../App';
import { Button } from './ui/button';
import { X, FileText, Image, Plus } from 'lucide-react';
import { logger } from '../utils/logger';

interface FileUploadProps {
  file?: UploadedFile | null;
  files?: UploadedFile[];
  onFileSelect?: (file: UploadedFile) => void;
  onFilesSelect?: (files: UploadedFile[]) => void;
  onFileRemove?: (fileId?: string) => void;
  accept: string;
  multiple: boolean;
  supportText: string;
}

export function FileUpload({
  file,
  files,
  onFileSelect,
  onFilesSelect,
  onFileRemove,
  accept,
  multiple,
  supportText
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(selectedFiles);
  };

  const handleFiles = (fileList: File[]) => {
    logger.userAction('files_selected', {
      component: 'FileUpload',
      metadata: {
        fileCount: fileList.length,
        fileNames: fileList.map(f => f.name),
        fileSizes: fileList.map(f => f.size),
        fileTypes: fileList.map(f => f.type),
        isMultiple: multiple,
        totalSize: fileList.reduce((sum, f) => sum + f.size, 0)
      }
    });

    if (!multiple && fileList.length > 0) {
      const selectedFile = fileList[0];
      logger.debug('Processing single file upload', {
        component: 'FileUpload',
        metadata: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type
        }
      });

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${selectedFile.name}`,
        name: selectedFile.name,
        type: selectedFile.type,
        url: URL.createObjectURL(selectedFile),
        file: selectedFile
      };
      onFileSelect?.(uploadedFile);

      logger.info('Single file uploaded successfully', {
        component: 'FileUpload',
        metadata: { fileName: selectedFile.name }
      });
    } else if (multiple && fileList.length > 0) {
      logger.debug('Processing multiple file upload', {
        component: 'FileUpload',
        metadata: {
          newFileCount: fileList.length,
          existingFileCount: files?.length || 0
        }
      });

      const uploadedFiles: UploadedFile[] = fileList.map(f => ({
        id: `${Date.now()}-${Math.random()}-${f.name}`,
        name: f.name,
        type: f.type,
        url: URL.createObjectURL(f),
        file: f
      }));
      
      // Append to existing files instead of replacing
      const currentFiles = files || [];
      const allFiles = [...currentFiles, ...uploadedFiles];
      onFilesSelect?.(allFiles);

      logger.info('Multiple files uploaded successfully', {
        component: 'FileUpload',
        metadata: {
          newFileCount: fileList.length,
          totalFileCount: allFiles.length
        }
      });
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  // Single file display
  if (!multiple && file) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/50">
          {getFileIcon(file.type)}
          <span className="flex-1 text-sm">{file.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logger.userAction('file_removed', {
                component: 'FileUpload',
                metadata: { fileName: file.name, fileType: file.type }
              });
              onFileRemove?.();
            }}
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{supportText}</p>
      </div>
    );
  }

  // Multiple files display
  if (multiple && files && files.length > 0) {
    return (
      <div className="space-y-4">
        {/* Display uploaded files */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{files.length} file{files.length !== 1 ? 's' : ''} uploaded</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50">
                {getFileIcon(file.type)}
                <span className="flex-1 text-sm truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileRemove?.(file.id)}
                  className="text-destructive hover:text-destructive flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Add more files area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Add More Files
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{supportText}</p>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          className="hidden"
        />
      </div>
    );
  }

  // Empty state - drag and drop area
  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-muted-foreground">
          {multiple ? 'Drag & Drop Files Here or Browse' : 'Drag & Drop File Here or Browse'}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">{supportText}</p>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
    </div>
  );
}