// Prediction Types
export interface Prediction {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  targetDate: Date;
  status: 'active' | 'resolved' | 'cancelled';
  result?: 'correct' | 'incorrect' | null;
  
  // Analysis sections
  technicalAnalysis: string;
  emotionalAnalysis: string;
  
  // Market data
  totalxlmStaked: number;
  supportingxlm: number;  // xlm backing "YES"
  opposingxlm: number;    // xlm backing "NO"
  
  // Metrics
  successRate: number;    // Percentage
  probability: number;    // 0-100
  odds: number;           // Payout multiplier
  
  category: string;
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  username: string;
  avatar: string;
  
  // Analytics
  totalPredictions: number;
  correctPredictions: number;
  successRate: number;
  
  // Tokens
  xlmBalance: number;
  xlmEarned: number;
  xlmSpent: number;
  
  // Profile metadata
  joinedAt: Date;
  bio: string;
  badges: string[];
}

export interface UserBet {
  id: string;
  userId: string;
  predictionId: string;
  amountxlm: number;
  prediction: 'yes' | 'no';
  placedAt: Date;
  status: 'pending' | 'won' | 'lost';
  payout?: number;
}

export interface MarketData {
  predictionId: string;
  currentOdds: number;
  yesOdds: number;
  noOdds: number;
  volumexlm: number;
  timestamp: Date;
}

export interface FreighterWallet {
  publicKey: string;
  isConnected: boolean;
  network: 'testnet' | 'public';
  xlmBalance?: number;
}

export interface TransactionData {
  id: string;
  type: 'bet' | 'payout' | 'transfer';
  fromAddress: string;
  toAddress: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  hash: string;
}

export interface GameNews {
  id: string;
  source: 'lol' | 'cs2' | 'valorant' | 'tft' | 'hltv';
  title: string;
  description: string;
  link: string;
  timestamp: Date;
  type: 'patch' | 'news';
  game: string;
}
