/**
 * Admin utilities
 */
import { APP_CONFIG } from './config';

/**
 * Check if an address is the admin
 */
export function isAdmin(address: string | null | undefined): boolean {
  if (!address) return false;
  return address === APP_CONFIG.admin.address;
}

/**
 * Check if user is authenticated as admin
 */
export function isAdminAuthenticated(wallet: any): boolean {
  return wallet?.isConnected && isAdmin(wallet?.publicKey);
}

/**
 * Format admin name with address
 */
export function getAdminDisplay(): string {
  return `${APP_CONFIG.admin.name} (${APP_CONFIG.admin.address.slice(0, 4)}...${APP_CONFIG.admin.address.slice(-4)})`;
}

export default {
  isAdmin,
  isAdminAuthenticated,
  getAdminDisplay,
};
