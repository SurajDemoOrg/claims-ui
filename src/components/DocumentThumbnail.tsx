import { UploadedFile } from '../App';
import { FileText, Image, Eye } from 'lucide-react';

interface DocumentThumbnailProps {
  document: UploadedFile;
  onClick: () => void;
  className?: string;
}

export function DocumentThumbnail({ document, onClick, className = "" }: DocumentThumbnailProps) {
  const isImage = document.type.startsWith('image/');
  const isPDF = document.type === 'application/pdf';

  const getFileIcon = () => {
    if (isImage) {
      return <Image className="w-6 h-6 text-blue-500" />;
    }
    return <FileText className="w-6 h-6 text-red-500" />;
  };

  return (
    <button
      onClick={onClick}
      className={`group relative p-3 border border-border rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-gray-50 ${className}`}
    >
      {/* Preview Area */}
      <div className="relative w-full h-20 bg-gray-100 rounded mb-3 overflow-hidden">
        {isImage ? (
          <div className="relative w-full h-full">
            <img
              src={document.url}
              alt={document.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            {getFileIcon()}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
              <Eye className="w-5 h-5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-900 truncate">{document.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase">
            {isPDF ? 'PDF' : isImage ? 'IMG' : 'FILE'}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">
            {Math.round(document.url.length / 1024)}KB
          </span>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-lg border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </button>
  );
}
