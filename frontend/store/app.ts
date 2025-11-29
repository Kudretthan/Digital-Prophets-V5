import { create } from 'zustand';
import { UserProfile, Prediction, UserBet, FreighterWallet } from '@/types';
import { APP_CONFIG } from '@/lib/config';

interface AppState {
  // Admin
  admin: {
    address: string;
    name: string;
  };

  // Wallet state
  wallet: FreighterWallet | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshWalletBalance: (publicKey: string) => Promise<void>;

  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;

  // Predictions
  predictions: Prediction[];
  setPredictions: (predictions: Prediction[]) => void;
  addPrediction: (prediction: Prediction) => void;
  updatePrediction: (id: string, prediction: Partial<Prediction>) => void;

  // User bets
  userBets: UserBet[];
  setUserBets: (bets: UserBet[]) => void;
  placeBet: (bet: UserBet) => void;

  // Market data
  marketVolume: Record<string, number>;
  updateMarketVolume: (predictionId: string, volume: number) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Errors
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Admin
  admin: APP_CONFIG.admin,

  // Wallet
  wallet: null,
  connectWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const { connectFreighter } = await import('@/lib/freighter');
      const wallet = await connectFreighter();
      set({
        wallet: {
          publicKey: wallet.publicKey,
          isConnected: wallet.isConnected,
          network: wallet.network as 'testnet' | 'public',
          xlmBalance: wallet.xlmBalance || 0,
        },
      });
    } catch (err: any) {
      set({ error: err.message || String(err) });
      alert(err.message || 'Cüzdan bağlantısı başarısız');
    } finally {
      set({ isLoading: false });
    }
  },
  disconnectWallet: () => {
    const { disconnectWallet } = require('@/lib/freighter');
    disconnectWallet();
    set({ wallet: null, userProfile: null });
  },
  refreshWalletBalance: async (publicKey: string) => {
    try {
      const { refreshBalance } = await import('@/lib/freighter');
      const currentWallet = get().wallet;
      // Freighter uses TESTNET/PUBLIC format
      const network = currentWallet?.network === 'testnet' ? 'TESTNET' : 'PUBLIC';
      
      console.log('Refreshing balance for:', publicKey, 'network:', network);
      const balance = await refreshBalance(publicKey, network);
      
      console.log('Refreshed balance:', balance);
      set((state) => ({
        wallet: state.wallet ? { ...state.wallet, xlmBalance: balance } : null,
      }));
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  },

  // User profile
  userProfile: null,
  setUserProfile: (profile) => set({ userProfile: profile }),

  // Predictions
  predictions: [],
  setPredictions: (predictions) => set({ predictions }),
  addPrediction: (prediction) =>
    set((state) => ({ predictions: [prediction, ...state.predictions] })),
  updatePrediction: (id, updates) =>
    set((state) => ({
      predictions: state.predictions.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  // User bets
  userBets: [],
  setUserBets: (bets) => set({ userBets: bets }),
  placeBet: (bet) =>
    set((state) => ({ userBets: [bet, ...state.userBets] })),

  // Market
  marketVolume: {},
  updateMarketVolume: (predictionId, volume) =>
    set((state) => ({
      marketVolume: {
        ...state.marketVolume,
        [predictionId]: volume,
      },
    })),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Error
  error: null,
  setError: (error) => set({ error }),
}));

export default useAppStore;
