import React, { useState, useEffect } from 'react';
import { db, auth, collection, query, orderBy, onSnapshot, where, doc } from '../firebase';
import { Article, User } from '../types';
import { calculateMatchingScore, generateTrendBrief } from '../services/aiService';
import { Sparkles, TrendingUp, User as UserIcon, Heart, Share2, MessageSquare, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ['程序员', '新媒体', 'UI设计', '自由职业', '人工智能'];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('程序员');
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [matchingResults, setMatchingResults] = useState<Record<string, string>>({});
  const [trendBrief, setTrendBrief] = useState<string | null>(null);
  const [showMatchModal, setShowMatchModal] = useState<{ open: boolean, score: string, reason: string }>({ open: false, score: '', reason: '' });
  const [showPlanningAssistant, setShowPlanningAssistant] = useState(false);
  const [planningAnalysis, setPlanningAnalysis] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      onSnapshot(doc(db, 'users', auth.currentUser.uid), (d) => {
        if (d.exists()) setUserProfile({ uid: d.id, ...d.data() } as User);
      });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'articles'), 
      where('category', '==', activeCategory),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
      setLoading(false);
    });
    
    // Interest Detector: Simulate AI inserting a trend brief after 3s in a category
    const timer = setTimeout(async () => {
      const brief = await generateTrendBrief(activeCategory);
      setTrendBrief(brief);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
      setTrendBrief(null);
    };
  }, [activeCategory]);

  const handleMatchClick = async (article: Article) => {
    if (!userProfile) return;
    const result = await calculateMatchingScore(userProfile, article);
    const [score, reason] = result.split('|').map(s => s.trim());
    setShowMatchModal({ open: true, score, reason });
  };

  const handlePlanningAssistantClick = async () => {
    setShowPlanningAssistant(true);
    setPlanningAnalysis(null);
    if (!userProfile) return;
    
    // Simulate AI analysis for the current category
    const analysis = await generateTrendBrief(activeCategory);
    setPlanningAnalysis(analysis);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 pb-24 relative">
      {/* Category Tabs */}
      <div className="sticky top-[calc(72px+env(safe-area-inset-top))] z-40 bg-zinc-50/80 backdrop-blur py-2 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeCategory === cat ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Waterfall Flow */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {loading ? (
          // Skeleton Screens
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="break-inside-avoid bg-white border border-zinc-100 rounded-3xl p-5 space-y-4 animate-pulse">
              <div className="w-full h-48 bg-zinc-100 rounded-2xl" />
              <div className="h-6 bg-zinc-100 rounded w-3/4" />
              <div className="h-4 bg-zinc-100 rounded w-full" />
              <div className="h-4 bg-zinc-100 rounded w-1/2" />
            </div>
          ))
        ) : (
          <AnimatePresence>
            {trendBrief && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="break-inside-avoid bg-zinc-900 text-white p-6 rounded-3xl space-y-4 shadow-xl border border-zinc-800"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                <Zap size={14} /> 兴趣探测器 · 职业简报
              </div>
              <p className="text-sm leading-relaxed text-zinc-300">{trendBrief}</p>
              <button className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-colors">
                进入个性化规划
              </button>
            </motion.div>
          )}

          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="break-inside-avoid bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              {article.imageUrl && (
                <div className="relative overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-lg uppercase">
                    {article.category}
                  </div>
                </div>
              )}
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-zinc-900 leading-tight">{article.title}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{article.content}</p>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <UserIcon size={12} />
                    <span>{article.authorName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <button className="hover:text-red-500 transition-colors flex items-center gap-1">
                      <Heart size={14} /> <span className="text-[10px]">{article.likesCount || 0}</span>
                    </button>
                    <button className="hover:text-zinc-900 transition-colors"><Share2 size={14} /></button>
                  </div>
                </div>

                {/* AI Matching Tag */}
                <button 
                  onClick={() => handleMatchClick(article)}
                  className="w-full mt-2 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center gap-2 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  <Sparkles size={14} /> AI 职场匹配度分析
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>

      {/* AI Planning Assistant Floating Icon */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePlanningAssistantClick}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-zinc-900 text-white rounded-full shadow-2xl flex items-center justify-center border border-zinc-700"
      >
        <Sparkles size={24} className="text-emerald-400" />
      </motion.button>

      {/* AI Planning Assistant BottomSheet */}
      <AnimatePresence>
        {showPlanningAssistant && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlanningAssistant(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[40px] p-8 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-8" />
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Zap className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-zinc-900">AI 职业规划助手</h2>
                    <p className="text-sm text-zinc-500">正在分析：{activeCategory} 领域</p>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100">
                  {planningAnalysis ? (
                    <div className="space-y-4">
                      <p className="text-zinc-700 leading-relaxed italic">"{planningAnalysis}"</p>
                      <div className="pt-4 border-t border-zinc-200 flex flex-col gap-2">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">建议行动</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-xs text-zinc-600">提升技术深度</span>
                          <span className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-xs text-zinc-600">关注行业动态</span>
                          <span className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-xs text-zinc-600">建立人脉网络</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-12 space-y-4">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-zinc-400 font-medium">AI 正在深度解析中...</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setShowPlanningAssistant(false)}
                  className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  我知道了
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Matching Modal */}
      <AnimatePresence>
        {showMatchModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMatchModal({ ...showMatchModal, open: false })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Sparkles size={40} className="text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-zinc-900">匹配度 {showMatchModal.score}%</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">{showMatchModal.reason}</p>
              </div>
              <div className="flex flex-col gap-3">
                <button className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">
                  进入深度职业规划
                </button>
                <button 
                  onClick={() => setShowMatchModal({ ...showMatchModal, open: false })}
                  className="w-full py-4 text-zinc-400 font-bold hover:text-zinc-900 transition-colors"
                >
                  稍后再说
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
