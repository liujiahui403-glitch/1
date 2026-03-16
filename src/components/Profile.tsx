import React, { useState, useEffect } from 'react';
import { db, auth, doc, onSnapshot, updateDoc } from '../firebase';
import { User } from '../types';
import { generateCareerAdvice, generateCareerRadarData } from '../services/aiService';
import { Settings, User as UserIcon, Award, Heart, History, Sparkles, ChevronRight, ShoppingBag, Users, ThumbsUp, FileText, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [advice, setAdvice] = useState('');
  const [radarData, setRadarData] = useState<any[]>([]);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (d) => {
      if (d.exists()) setUser({ uid: d.id, ...d.data() } as User);
    });
    return () => unsubscribe();
  }, []);

  const getAIAdvice = async () => {
    if (!user) return;
    setLoadingAdvice(true);
    const [adviceRes, radarRes] = await Promise.all([
      generateCareerAdvice(user.careerInterests || [], user.bio || '寻求职业突破'),
      generateCareerRadarData(user)
    ]);
    setAdvice(adviceRes);
    setRadarData(radarRes);
    setLoadingAdvice(false);
    setShowReport(true);
  };

  if (!user) return <div className="p-8 text-center text-zinc-500">加载个人资料中...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Bilibili Style Header */}
      <div className="bg-white rounded-[32px] overflow-hidden border border-zinc-200 shadow-sm">
        <div className="h-40 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <button className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur rounded-full text-white hover:bg-black/40 transition-colors">
            <Edit3 size={18} />
          </button>
        </div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-10 relative z-10">
          <div className="w-32 h-32 rounded-3xl border-4 border-white bg-zinc-100 flex items-center justify-center overflow-hidden shadow-xl shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={64} className="text-zinc-300" />
            )}
          </div>
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-zinc-900 tracking-tighter">{user.displayName}</h1>
              <p className="text-zinc-500 text-sm font-medium">{user.bio || '这个人很懒，什么都没有留下'}</p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-lg font-black text-zinc-900">{user.followingCount || 0}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">关注</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-zinc-900">{user.followersCount || 0}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">粉丝</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-zinc-900">{user.likesReceived || 0}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">获赞</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings & Performance Section */}
      <section className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
          <Settings size={16} className="text-zinc-400" /> 系统设置
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="space-y-1">
              <p className="text-sm font-bold text-zinc-900">性能优化模式</p>
              <p className="text-[10px] text-zinc-400 font-medium">针对低配虚拟机/旧设备，关闭复杂动效</p>
            </div>
            <button 
              onClick={() => {
                const current = localStorage.getItem('perf_mode') === 'true';
                localStorage.setItem('perf_mode', (!current).toString());
                window.location.reload();
              }}
              className={`w-12 h-6 rounded-full transition-all relative ${localStorage.getItem('perf_mode') === 'true' ? 'bg-emerald-500' : 'bg-zinc-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localStorage.getItem('perf_mode') === 'true' ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          
          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <History size={18} />
              </div>
              <span className="text-sm font-bold text-zinc-700">清除本地缓存</span>
            </div>
            <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-900" />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Medals & Skills */}
        <div className="md:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
              <Award size={16} className="text-emerald-500" /> 职业勋章墙
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(user.medals || ['Python 精通', '英语六级', '算法专家', '产品思维']).map((medal, i) => (
                <div key={i} className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-1">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles size={14} className="text-emerald-600" />
                  </div>
                  <p className="text-[10px] font-bold text-emerald-800">{medal}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
              <Heart size={16} className="text-pink-500" /> 职业兴趣
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.careerInterests?.map(interest => (
                <span key={interest} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-lg">
                  {interest}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: AI Report & Actions */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-zinc-900 p-8 rounded-[32px] text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tighter">AI 职业规划报告</h3>
                  <p className="text-zinc-400 text-xs">基于大模型全方位评估您的职业潜力</p>
                </div>
                <Sparkles className="text-emerald-400" size={32} />
              </div>
              <button 
                onClick={getAIAdvice}
                disabled={loadingAdvice}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
              >
                {loadingAdvice ? '正在深度评估中...' : '生成我的职业报告'}
              </button>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <History size={20} />, label: '学习记录', count: 24, color: 'bg-blue-50 text-blue-600' },
              { icon: <ShoppingBag size={20} />, label: '我的订单', count: 3, color: 'bg-orange-50 text-orange-600' },
              { icon: <ThumbsUp size={20} />, label: '收藏夹', count: 15, color: 'bg-pink-50 text-pink-600' },
              { icon: <Users size={20} />, label: '关注导师', count: 8, color: 'bg-purple-50 text-purple-600' },
            ].map((item, i) => (
              <button key={i} className="p-6 bg-white border border-zinc-200 rounded-[32px] flex flex-col items-center text-center space-y-3 hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{item.label}</p>
                  <p className="text-xs text-zinc-400">{item.count} 项</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Report Modal */}
      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReport(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] p-10 shadow-2xl max-h-[80vh] overflow-y-auto no-scrollbar"
            >
              <div className="space-y-8">
                <header className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">个性化职业规划报告</h2>
                  <p className="text-zinc-500 text-sm">生成时间: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="space-y-6">
                  {/* Radar Chart Section */}
                  <div className="h-64 w-full bg-zinc-50 rounded-3xl p-4 border border-zinc-100">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 text-center">职业能力雷达图</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#e4e4e7" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} />
                        <Radar
                          name="能力值"
                          dataKey="A"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.5}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">核心建议</h4>
                    <p className="text-zinc-900 leading-relaxed">{advice}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                      <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">优势分析</h4>
                      <ul className="text-sm text-emerald-900 space-y-1">
                        <li>• 跨领域学习能力强</li>
                        <li>• 具备前瞻性技术视野</li>
                        <li>• 沟通协作能力优秀</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                      <h4 className="text-xs font-black text-orange-800 uppercase tracking-widest mb-2">提升方向</h4>
                      <ul className="text-sm text-orange-900 space-y-1">
                        <li>• 深化特定领域技术栈</li>
                        <li>• 积累更多实战项目经验</li>
                        <li>• 建立行业影响力</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowReport(false)}
                  className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl"
                >
                  保存并关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
