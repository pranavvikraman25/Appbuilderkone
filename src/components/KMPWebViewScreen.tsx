import { ArrowLeft, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Screen } from '../App';

export function KMPWebViewScreen({ 
  onNavigate,
  onGoBack 
}: { 
  onNavigate: (screen: Screen) => void;
  onGoBack?: () => void;
}) {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate({ name: 'dashboard' })}>
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <div className="text-sm text-gray-700">KONE Maintenance Portal</div>
              <div className="text-xs text-gray-500">Embedded portal – read-only for prototype</div>
            </div>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-2 px-3 py-2 text-xs border ${
              viewMode === 'mobile'
                ? 'border-[#005EB8] bg-[#005EB8] text-white'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            Mobile View
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-2 px-3 py-2 text-xs border ${
              viewMode === 'desktop'
                ? 'border-[#005EB8] bg-[#005EB8] text-white'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            <Monitor className="w-3 h-3" />
            Desktop View
          </button>
        </div>
      </div>
      
      {/* Web View Content */}
      <div className="flex-1 overflow-hidden bg-white">
        <iframe
          src="https://kone-maintenance-website.streamlit.app/"
          className="w-full h-full border-0"
          style={{
            transform: viewMode === 'mobile' ? 'scale(1)' : 'scale(0.6)',
            transformOrigin: 'top left',
            width: viewMode === 'mobile' ? '100%' : '166.67%',
            height: viewMode === 'mobile' ? '100%' : '166.67%',
          }}
          title="KONE Maintenance Portal"
        />
      </div>
      
      {/* Status Bar */}
      <div className="bg-white border-t border-gray-300 p-2">
        <div className="text-xs text-gray-500 text-center">
          {viewMode === 'mobile' ? 'Mobile' : 'Desktop'} view • Read-only access
        </div>
      </div>
    </div>
  );
}
