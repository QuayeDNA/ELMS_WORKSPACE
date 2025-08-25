import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useConnectionStatus } from '../../services/realTimeService';

export const ConnectionStatus: React.FC = () => {
  const isConnected = useConnectionStatus();

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
      isConnected 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
};

interface LiveIndicatorProps {
  className?: string;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ className = '' }) => {
  const isConnected = useConnectionStatus();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`relative ${isConnected ? '' : 'opacity-50'}`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-gray-400'
        }`}></div>
        {isConnected && (
          <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
        )}
      </div>
      <span className={`text-sm font-medium ${
        isConnected ? 'text-green-600' : 'text-gray-500'
      }`}>
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
};

export default ConnectionStatus;
