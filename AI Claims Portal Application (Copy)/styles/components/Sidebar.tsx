import React from 'react';
import { Screen } from '../App';
import { FileText, History } from 'lucide-react';

interface SidebarProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
}

export function Sidebar({ currentScreen, setCurrentScreen }: SidebarProps) {
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
            <button
              onClick={() => setCurrentScreen('process')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentScreen === 'process'
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <FileText className="w-5 h-5" />
              Process New Claim
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentScreen('previous')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentScreen === 'previous'
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <History className="w-5 h-5" />
              View Previous Claims
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}