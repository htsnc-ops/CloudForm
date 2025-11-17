import React from 'react';
import { Cloud, Key } from 'lucide-react';

const ClientCard = ({ client, onSelect }) => {
  return (
    <div
      className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
      onClick={() => onSelect(client)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{client.name}</h3>
            <p className="text-sm text-slate-400">{client.cloudProvider.toUpperCase()}</p>
          </div>
        </div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2 text-slate-400">
          <Key className="w-4 h-4" />
          <span>{client.credentials.type}</span>
        </div>
        <div className="text-slate-500 text-xs">
          Created: {new Date(client.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ClientCard;