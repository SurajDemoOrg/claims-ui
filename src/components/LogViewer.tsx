import { useState, useEffect } from 'react';
import { logger, LogEntry } from '../utils/logger';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { X, Download, Trash2, RefreshCw } from 'lucide-react';

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogViewer({ isOpen, onClose }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const refreshLogs = () => {
    setLogs(logger.getLogs());
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const downloadLogs = () => {
    const logData = JSON.stringify(logs, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claims-ui-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
      // Auto-refresh logs every 2 seconds when viewer is open
      const interval = setInterval(refreshLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'WARN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INFO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DEBUG':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-5/6 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Application Logs</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {logs.length} entries
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshLogs}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadLogs}
              className="h-8 w-8 p-0"
              disabled={logs.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLogs}
              className="h-8 w-8 p-0"
              disabled={logs.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full px-6 pb-6">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No logs available
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 text-sm bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getLevelColor(log.level)}`}
                      >
                        {log.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      {log.context?.component && (
                        <Badge variant="secondary" className="text-xs">
                          {log.context.component}
                        </Badge>
                      )}
                      {log.context?.action && (
                        <Badge variant="outline" className="text-xs">
                          {log.context.action}
                        </Badge>
                      )}
                      {log.context?.claimId && (
                        <Badge variant="outline" className="text-xs">
                          {log.context.claimId}
                        </Badge>
                      )}
                    </div>
                    <div className="font-medium mb-1">{log.message}</div>
                    {log.context?.metadata && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">
                          Metadata
                        </summary>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(log.context.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                    {log.error && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground text-red-600">
                          Error Details
                        </summary>
                        <pre className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs overflow-auto text-red-800">
                          {log.error.message}
                          {log.error.stack && `\n\n${log.error.stack}`}
                        </pre>
                      </details>
                    )}
                    {log.data && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">
                          Data
                        </summary>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Debug button component to show/hide log viewer (only in development)
export function LogViewerToggle() {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-background"
      >
        View Logs
      </Button>
      <LogViewer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
