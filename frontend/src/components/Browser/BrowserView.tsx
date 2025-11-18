import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface BrowserViewProps {
  clientId?: string;
}

export const BrowserView: React.FC<BrowserViewProps> = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  
  const urls: Record<string, string> = {
    azure: 'https://portal.azure.com',
    aws: 'https://console.aws.amazon.com',
    gcp: 'https://console.cloud.google.com',
  };

  // Default to azure if not specified
  const cloudProvider = 'azure';

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="bg-slate-900 px-4 py-3 flex items-center space-x-4 border-b border-slate-700">
        <Globe className="w-5 h-5 text-blue-400" />
        <span className="text-sm text-slate-400">
          {cloudProvider === 'azure' ? 'portal.azure.com' :
           cloudProvider === 'aws' ? 'console.aws.amazon.com' :
           'console.cloud.google.com'}
        </span>
      </div>
      <div className="p-8 h-96 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400 mb-4">
            In production, this would open an authenticated browser session
          </p>
          <p className="text-sm text-slate-500">
            The container would handle SSO/authentication automatically
          </p>
          <a
            href={urls[cloudProvider]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  );
};

export default BrowserView;