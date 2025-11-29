// Freighter Wallet Integration - Official @stellar/freighter-api
import {
  isConnected,
  requestAccess,
  getAddress,
  getNetwork,
  getNetworkDetails,
  signTransaction,
} from '@stellar/freighter-api';

export interface WalletInfo {
  publicKey: string;
  network: 'TESTNET' | 'PUBLIC' | 'FUTURENET' | string;
  networkPassphrase: string;
  isConnected: boolean;
  xlmBalance: number;
}

const HORIZON_URLS: Record<string, string> = {
  PUBLIC: 'https://horizon.stellar.org',
  TESTNET: 'https://horizon-testnet.stellar.org',
  FUTURENET: 'https://horizon-futurenet.stellar.org',
};

const STORAGE_KEY = 'digital-seers-wallet';

/**
 * Freighter extension'ın yüklü olup olmadığını kontrol et
 */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

/**
 * Horizon API'den hesap bakiyesini çek
 */
async function fetchBalanceFromHorizon(publicKey: string, network: string): Promise<number> {
  // Network'e göre Horizon URL seç
  const horizonUrl = HORIZON_URLS[network] || HORIZON_URLS.TESTNET;
  
  try {
    const response = await fetch(`${horizonUrl}/accounts/${publicKey}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Account not found on', network);
        
        // Diğer network'leri dene
        for (const [netName, url] of Object.entries(HORIZON_URLS)) {
          if (netName === network) continue;
          
          try {
            const otherResponse = await fetch(`${url}/accounts/${publicKey}`);
            if (otherResponse.ok) {
              const data = await otherResponse.json();
              const nativeBalance = data.balances?.find((b: any) => b.asset_type === 'native');
              console.log('Found account on', netName, 'with balance:', nativeBalance?.balance);
              return nativeBalance ? parseFloat(nativeBalance.balance) : 0;
            }
          } catch (e) {
            continue;
          }
        }
        return 0;
      }
      throw new Error(`Horizon error: ${response.status}`);
    }
    
    const data = await response.json();
    const nativeBalance = data.balances?.find((b: any) => b.asset_type === 'native');
    
    return nativeBalance ? parseFloat(nativeBalance.balance) : 0;
  } catch (error) {
    console.error('Error fetching balance from Horizon:', error);
    return 0;
  }
}

/**
 * Freighter'a bağlan ve cüzdan bilgilerini al
 */
export async function connectFreighter(): Promise<WalletInfo> {
  // Önce Freighter yüklü mü kontrol et
  const connectionStatus = await isConnected();
  
  if (!connectionStatus.isConnected) {
    throw new Error('Freighter cüzdan eklentisi bulunamadı veya bağlı değil. Lütfen Freighter\'ı yükleyin: https://freighter.app');
  }

  console.log('Freighter is connected');

  try {
    // Kullanıcıdan erişim iste - bu popup açacak
    const accessResult = await requestAccess();
    
    if (accessResult.error) {
      throw new Error(accessResult.error);
    }
    
    const publicKey = accessResult.address;
    
    if (!publicKey) {
      throw new Error('Cüzdan adresi alınamadı');
    }

    console.log('Got public key:', publicKey);

    // Network bilgisini al
    const networkResult = await getNetworkDetails();
    
    if (networkResult.error) {
      console.error('Network error:', networkResult.error);
    }
    
    const network = networkResult.network || 'TESTNET';
    const networkPassphrase = networkResult.networkPassphrase || 'Test SDF Network ; September 2015';
    
    console.log('Network:', network, 'Passphrase:', networkPassphrase);

    // Bakiyeyi çek
    const xlmBalance = await fetchBalanceFromHorizon(publicKey, network);
    console.log('Balance:', xlmBalance, 'XLM');

    const wallet: WalletInfo = {
      publicKey,
      network,
      networkPassphrase,
      isConnected: true,
      xlmBalance,
    };

    // LocalStorage'a kaydet
    saveWallet(wallet);
    
    return wallet;
  } catch (error: any) {
    console.error('Freighter connection error:', error);
    throw new Error(error.message || 'Cüzdan bağlantısı başarısız');
  }
}

/**
 * Bakiyeyi yenile
 */
export async function refreshBalance(publicKey: string, network: string = 'TESTNET'): Promise<number> {
  const xlmBalance = await fetchBalanceFromHorizon(publicKey, network);
  
  // Stored wallet'ı güncelle
  const stored = getStoredWallet();
  if (stored) {
    stored.xlmBalance = xlmBalance;
    saveWallet(stored);
  }
  
  return xlmBalance;
}

/**
 * Cüzdan bilgilerini localStorage'a kaydet
 */
export function saveWallet(wallet: WalletInfo): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
}

/**
 * Kayıtlı cüzdan bilgilerini al
 */
export function getStoredWallet(): WalletInfo | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Cüzdan bağlantısını kes
 */
export function disconnectWallet(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Transaction imzala (Freighter ile)
 */
export async function signTx(xdr: string, networkPassphrase?: string, address?: string): Promise<string> {
  const result = await signTransaction(xdr, {
    networkPassphrase,
    address,
  });
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result.signedTxXdr;
}

/**
 * Mevcut adresi al (daha önce izin verilmişse)
 */
export async function getCurrentAddress(): Promise<string | null> {
  try {
    const result = await getAddress();
    if (result.error) {
      return null;
    }
    return result.address || null;
  } catch {
    return null;
  }
}

// Legacy export for backwards compatibility
export class FreighterWalletService {
  static isFreighterAvailable = isFreighterInstalled;
  static requestConnection = connectFreighter;
  static refreshxlmBalance = refreshBalance;
  static getStoredWallet = getStoredWallet;
  static saveWallet = saveWallet;
  static clearWallet = disconnectWallet;
  static disconnect = disconnectWallet;
  static signTransaction = signTx;
}

export default FreighterWalletService;
