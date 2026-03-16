export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  careerInterests?: string[];
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  medals: string[]; // AI evaluated skills
}

export interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category: string;
  authorId: string;
  authorName: string;
  tags: string[];
  aiAnalysis?: string;
  createdAt: string;
  likesCount: number;
  isTrendBrief?: boolean; // For AI generated trend cards
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  sellerId: string;
  sellerName: string;
  category: string;
  stock: number;
  logisticsStatus: 'pending' | 'shipped' | 'delivered';
  logisticsTimeline: { status: string; time: string; icon: string }[];
  estimatedArrivalProb: string; // AI predicted
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  roomId: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastTimestamp?: string;
  order: number;
  otherUser?: User; // Joined client-side
}

export interface CareerRule {
  id: string;
  ruleName: string;
  condition: string;
  recommendation: string;
  weight: number;
}
