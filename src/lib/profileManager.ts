// Profile Manager - Her cüzdan adresi için ayrı profil yönetimi

import { UserProfile } from '@/types';

const PROFILES_KEY = 'digital-seers-profiles';

// Tüm profilleri al
export function getAllProfiles(): Record<string, UserProfile> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(PROFILES_KEY);
    if (!stored) return {};
    
    // Parse stored data and convert date strings back to Date objects
    const parsed = JSON.parse(stored);
    const profiles: Record<string, UserProfile> = {};
    
    for (const key in parsed) {
      profiles[key] = {
        ...parsed[key],
        joinedAt: new Date(parsed[key].joinedAt)
      };
    }
    
    return profiles;
  } catch {
    return {};
  }
}

// Belirli bir cüzdan adresinin profilini al
export function getProfile(walletAddress: string): UserProfile | null {
  const profiles = getAllProfiles();
  return profiles[walletAddress] || null;
}

// Profili kaydet
export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  
  const profiles = getAllProfiles();
  profiles[profile.walletAddress] = profile;
  
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

// Yeni profil oluştur
export function createDefaultProfile(walletAddress: string): UserProfile {
  const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  
  const profile: UserProfile = {
    id: walletAddress,
    walletAddress,
    username: `Analyst_${shortAddress}`,
    avatar: '🔮',
    totalPredictions: 0,
    correctPredictions: 0,
    successRate: 0,
    xlmBalance: 0,
    xlmEarned: 0,
    xlmSpent: 0,
    joinedAt: new Date(),
    bio: '',
    badges: []
  };
  
  saveProfile(profile);
  return profile;
}

// Profili al veya oluştur
export function getOrCreateProfile(walletAddress: string): UserProfile {
  const existing = getProfile(walletAddress);
  if (existing) {
    return existing;
  }
  return createDefaultProfile(walletAddress);
}

// Avatar güncelle
export function updateProfileAvatar(walletAddress: string, avatar: string): UserProfile | null {
  const profile = getProfile(walletAddress);
  if (!profile) return null;
  
  const updated = { ...profile, avatar };
  saveProfile(updated);
  return updated;
}

// Kullanıcı adı güncelle
export function updateProfileUsername(walletAddress: string, username: string): UserProfile | null {
  const profile = getProfile(walletAddress);
  if (!profile) return null;
  
  const updated = { ...profile, username };
  saveProfile(updated);
  return updated;
}

// XLM bakiyesini güncelle
export function updateProfileBalance(walletAddress: string, xlmBalance: number): UserProfile | null {
  const profile = getProfile(walletAddress);
  if (!profile) return null;
  
  const updated = { ...profile, xlmBalance };
  saveProfile(updated);
  return updated;
}

// Profili sil
export function deleteProfile(walletAddress: string): void {
  if (typeof window === 'undefined') return;
  
  const profiles = getAllProfiles();
  delete profiles[walletAddress];
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}
