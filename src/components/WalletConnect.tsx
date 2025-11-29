'use client';

import { useEffect, useState, useRef } from 'react';
import useAppStore from '@/store/app';
import { getStoredWallet, refreshBalance, disconnectWallet as clearWalletStorage } from '@/lib/freighter';
import { isConnected, WatchWalletChanges } from '@stellar/freighter-api';

export function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet, refreshWalletBalance } = useAppStore();
  const [isClient, setIsClient] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [freighterInstalled, setFreighterInstalled] = useState<boolean | null>(null);
  const watcherRef = useRef<any>(null);

  // Client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Freighter yüklü mü kontrol et
  useEffect(() => {
    if (!isClient) return;

    const checkFreighter = async () => {
      try {
        const result = await isConnected();
        setFreighterInstalled(result.isConnected);
      } catch (e) {
        setFreighterInstalled(false);
      }
    };

    checkFreighter();
  }, [isClient]);

  // Cüzdan değişikliğini dinle (WatchWalletChanges)
  useEffect(() => {
    if (!isClient || !wallet?.isConnected) return;

    // Watcher oluştur - her 2 saniyede kontrol et
    const watcher = new WatchWalletChanges(2000);
    watcherRef.current = watcher;

    watcher.watch((changes: { address: string; network: string; networkPassphrase: string }) => {
      console.log('Wallet change detected:', changes);
      
      // Eğer adres değiştiyse çıkış yap
      if (changes.address && changes.address !== wallet.publicKey) {
        console.log('Different wallet detected, logging out...');
        disconnectWallet();
        clearWalletStorage();
        alert('Cüzdan değiştirildi. Lütfen tekrar bağlanın.');
      }
    });

    return () => {
      // Cleanup: watcher'ı durdur
      if (watcherRef.current) {
        watcherRef.current.stop();
        watcherRef.current = null;
      }
    };
  }, [isClient, wallet?.isConnected, wallet?.publicKey, disconnectWallet]);

  // Sayfa yüklendiğinde kayıtlı cüzdanı geri yükle
  useEffect(() => {
    if (!isClient || freighterInstalled === null) return;

    const restoreWallet = async () => {
      const stored = getStoredWallet();
      
      if (stored && stored.isConnected && !wallet?.isConnected) {
        console.log('Restoring wallet from storage:', stored.publicKey);
        
        useAppStore.setState({
          wallet: {
            publicKey: stored.publicKey,
            isConnected: true,
            network: stored.network === 'TESTNET' ? 'testnet' : 'public',
            xlmBalance: stored.xlmBalance || 0,
          },
        });

        try {
          const freshBalance = await refreshBalance(stored.publicKey, stored.network);
          useAppStore.setState((state) => ({
            wallet: state.wallet ? { ...state.wallet, xlmBalance: freshBalance } : null,
          }));
        } catch (e) {
          console.error('Failed to refresh balance:', e);
        }
      }
    };

    restoreWallet();
  }, [isClient, freighterInstalled]);

  // Otomatik bakiye yenileme (her 15 saniyede)
  useEffect(() => {
    if (!wallet?.publicKey) return;

    const interval = setInterval(() => {
      refreshWalletBalance(wallet.publicKey);
    }, 15000);

    return () => clearInterval(interval);
  }, [wallet?.publicKey, refreshWalletBalance]);

  if (!isClient) return null;

  const handleConnect = async () => {
    if (freighterInstalled === false) {
      const install = confirm(
        'Freighter cüzdan eklentisi bulunamadı!\n\n' +
        'Freighter\'ı yüklemek için "OK" butonuna tıklayın.'
      );
      if (install) {
        window.open('https://freighter.app', '_blank');
      }
      return;
    }

    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (e: any) {
      console.error('Connection error:', e);
      alert(e.message || 'Cüzdan bağlantısı başarısız');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    // Watcher'ı durdur
    if (watcherRef.current) {
      watcherRef.current.stop();
      watcherRef.current = null;
    }
    disconnectWallet();
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  // Bağlı değilse sadece bağlan butonu göster
  if (!wallet?.isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 neon-border"
      >
        {isConnecting ? '⏳ Bağlanıyor...' : '⚡ Cüzdan Bağla'}
      </button>
    );
  }

  // Bağlıysa kompakt görünüm
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur border border-orange-500/40 rounded-xl">
      <div className="text-xs text-orange-300 font-mono">
        {formatAddress(wallet.publicKey)}
      </div>
      <div className="w-px h-4 bg-orange-500/30" />
      <div className="text-sm font-bold text-orange-400">
        ⚡ {(wallet.xlmBalance ?? 0).toFixed(2)} XLM
      </div>
      <div className="w-px h-4 bg-orange-500/30" />
      <button
        onClick={handleDisconnect}
        className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
      >
        Çıkış
      </button>
    </div>
  );
}
