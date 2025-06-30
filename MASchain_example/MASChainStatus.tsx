import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Activity, ExternalLink } from 'lucide-react';
import { useMASChain } from '../hooks/use-maschain';

export const MASChainStatus: React.FC = () => {
  const { 
    isConnected, 
    tokenBalances,
    networkStatus, 
    loading,
    error,
    formatAddress,
    walletAddress
  } = useMASChain();

  if (loading) {
    return (
      <Card className="p-4 bg-slate-800/80 border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">MASChain</div>
            <div className="text-xs text-slate-400">Connecting...</div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-slate-800/80 border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">MASChain</div>
            <div className="text-xs text-red-400">Connection Error</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-slate-800/80 border-slate-700 backdrop-blur-sm">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">MASChain Wallet</div>
              <div className="text-xs text-slate-400">Malaysian Blockchain</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected && networkStatus.connected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                isConnected && networkStatus.connected 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-red-500/20 text-red-300'
              }`}
            >
              {isConnected && networkStatus.connected ? 'Connected' : 'Offline'}
            </Badge>
          </div>
        </div>

        {/* Wallet Info */}
        {isConnected && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Address</span>
              <span className="text-xs font-mono text-slate-300">
                {formatAddress(walletAddress)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">RET Balance</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white">
                  {parseFloat(tokenBalances?.RET || '0').toFixed(2)}
                </span>
                <span className="text-xs text-purple-300">RET</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">RCC Balance</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white">
                  {parseFloat(tokenBalances?.RCC || '0').toFixed(2)}
                </span>
                <span className="text-xs text-blue-300">RCC</span>
              </div>
            </div>

            {/* Network Status - Simple connected indicator */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Network</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-slate-300">Connected</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <button 
            className="flex-1 text-xs text-purple-300 hover:text-purple-200 transition-colors"
            onClick={() => window.open(import.meta.env.VITE_MASCHAIN_EXPLORER_URL, '_blank')}
          >
            <ExternalLink className="w-3 h-3 inline mr-1" />
            Explorer
          </button>
          <button 
            className="flex-1 text-xs text-purple-300 hover:text-purple-200 transition-colors"
            onClick={() => window.open(import.meta.env.VITE_MASCHAIN_PORTAL_URL, '_blank')}
          >
            <ExternalLink className="w-3 h-3 inline mr-1" />
            Portal
          </button>
        </div>
      </div>
    </Card>
  );
};
