import React, { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, getDoc, setDoc } from './firebase';
import { User } from './types';
import Home from './components/Home';
import Market from './components/Market';
import Chat from './components/Chat';
import Profile from './components/Profile';
import TestReport from './components/TestReport';
import { seedInitialData } from './services/seedService';
import { Home as HomeIcon, ShoppingBag, MessageCircle, User as UserIcon, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'market' | 'chat' | 'profile' | 'test'>('home');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Initialize Capacitor plugins for Android/iOS
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light }).catch(console.error);
      StatusBar.setBackgroundColor({ color: '#fafafa' }).catch(console.error);
      
      // Handle hardware back button on Android
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapacitorApp.exitApp();
        } else {
          window.history.back();
        }
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
        } else {
          const newUser: User = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || '新用户',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            careerInterests: ['人工智能', '产品经理', '软件开发'],
            bio: '这是一名正在探索职业可能性的用户。',
            role: 'user',
            createdAt: new Date().toISOString(),
            followersCount: 0,
            followingCount: 0,
            likesReceived: 0,
            medals: []
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
        // Seed data after user profile is guaranteed to exist
        seedInitialData();
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      setAuthError(error.message || '认证失败，请检查您的输入。');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-emerald-600 font-bold text-2xl"
        >
          CareerAI
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-zinc-900">CareerAI</h1>
            <p className="text-zinc-500 text-lg">基于大模型的个性化职业推荐与规划平台</p>
          </div>

          <form onSubmit={handleEmailAuth} className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">
              {isRegistering ? '创建新账号' : '欢迎回来'}
            </h2>
            
            {authError && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                {authError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">电子邮箱</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">密码</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg"
            >
              {isRegistering ? '立即注册' : '登录'}
            </button>

            <div className="text-center pt-4">
              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm font-bold text-emerald-600 hover:underline"
              >
                {isRegistering ? '已有账号？去登录' : '没有账号？去注册'}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-zinc-400">登录即表示您同意我们的服务条款和隐私政策</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black">C</div>
          <span className="font-bold text-zinc-900 tracking-tight">CareerAI</span>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 overflow-y-auto p-4 pb-32"
          >
            {activeTab === 'home' && <Home />}
            {activeTab === 'market' && <Market />}
            {activeTab === 'chat' && <Chat />}
            {activeTab === 'profile' && <Profile />}
            {activeTab === 'test' && <TestReport />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-white/90 backdrop-blur-xl border border-zinc-200 rounded-3xl shadow-2xl p-2 flex items-center justify-around z-50">
        {[
          { id: 'home', icon: <HomeIcon size={20} />, label: '推荐' },
          { id: 'market', icon: <ShoppingBag size={20} />, label: '书屋' },
          { id: 'chat', icon: <MessageCircle size={20} />, label: '消息' },
          { id: 'profile', icon: <UserIcon size={20} />, label: '我的' },
          { id: 'test', icon: <ShieldCheck size={20} />, label: '测试' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
              activeTab === tab.id ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
