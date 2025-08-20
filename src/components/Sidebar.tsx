import { Link, useLocation } from 'react-router-dom';
import { FileText, History, Database } from 'lucide-react';
import { logger } from '../utils/logger';

export function Sidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/claims/process') {
      return location.pathname === '/claims/process' || location.pathname === '/claims/process/review';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">AI Claims Portal</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/claims/process"
              onClick={() => {
                logger.userAction('navigate_to_process_claim', {
                  component: 'Sidebar',
                  metadata: { from: location.pathname }
                });
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/claims/process')
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5" />
              Process New Claim
            </Link>
          </li>
          <li>
            <Link
              to="/claims/view"
              onClick={() => {
                logger.userAction('navigate_to_view_claims', {
                  component: 'Sidebar',
                  metadata: { from: location.pathname }
                });
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/claims/view')
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <History className="w-5 h-5" />
              View Previous Claims
            </Link>
          </li>
          <li>
            <Link
              to="/sample-data"
              onClick={() => {
                logger.userAction('navigate_to_sample_data', {
                  component: 'Sidebar',
                  metadata: { from: location.pathname }
                });
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/sample-data')
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Database className="w-5 h-5" />
              Sample Data Demo
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}