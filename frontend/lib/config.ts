/**
 * Application Configuration
 * Central place for all app constants and configurations
 */

export const APP_CONFIG = {
  // Admin Account
  admin: {
    address: process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '',
    name: 'Digital Prophets Admin',
  },

  // Stellar Network Configuration
  stellar: {
    horizonUrl: process.env.NEXT_PUBLIC_FREIGHTER_RPC_URL || 'https://horizon.stellar.org',
    testnetHorizonUrl: 'https://horizon-testnet.stellar.org',
    futurenetHorizonUrl: 'https://horizon-futurenet.stellar.org',
    networkPassphrase: {
      testnet: 'Test SDF Network ; September 2015',
      public: 'Public Global Stellar Network ; September 2015',
      futurenet: 'Test SDF Future Network ; October 2022',
    },
  },

  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  // Application Settings
  app: {
    name: 'Digital Prophets',
    version: '0.1.0',
    refreshIntervals: {
      predictions: 30000, // 30 seconds
      wallet: 15000, // 15 seconds
      gameNews: 30000, // 30 seconds
    },
  },

  // Features
  features: {
    enableBetting: true,
    enableLeaderboard: true,
    enableProfiles: true,
    enableWallet: true,
  },
};

export default APP_CONFIG;
