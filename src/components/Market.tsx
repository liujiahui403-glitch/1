import React, { useState, useEffect } from 'react';
import { db, auth, collection, query, onSnapshot, where } from '../firebase';
import { Product, User } from '../types';
import { predictLogistics } from '../services/aiService';
import { Search, ShoppingBag, Package, Truck, User as UserIcon, ChevronRight, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Market() {
  const [products, setProducts] = useState<Product[]>([]);
  const [experts, setExperts] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'products' | 'experts'>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [aiPrediction, setAiPrediction] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    
    const eq = query(collection(db, 'users'), where('role', '==', 'admin'));
    const unsubscribeExperts = onSnapshot(eq, (snapshot) => {
      setExperts(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User)));
    });

    return () => { unsubscribe(); unsubscribeExperts(); };
  }, []);

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product);
    const prediction = await predictLogistics(product.name);
    setAiPrediction(prediction);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExperts = experts.filter(e => 
    e.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 pb-24">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tighter">职场资源中心</h1>
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveView('products')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'products' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
            >
              商品
            </button>
            <button 
              onClick={() => setActiveView('experts')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'experts' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'}`}
            >
              专家
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder={activeView === 'products' ? "搜索职业书籍、课程、工具..." : "搜索资深规划师、导师名称..."}
            className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {activeView === 'products' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -4 }}
              onClick={() => handleProductClick(product)}
              className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden flex flex-col cursor-pointer group"
            >
              <div className="aspect-[4/3] bg-zinc-50 relative overflow-hidden">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-200">
                    <Package size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-zinc-900 text-white px-4 py-1.5 rounded-full text-sm font-black shadow-xl">
                  ¥{product.price}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{product.category}</span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                    <UserIcon size={12} className="text-zinc-300" /> {product.sellerName}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 leading-tight">{product.name}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{product.description}</p>
                
                <div className="pt-4 mt-auto border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <Truck size={14} />
                    {product.logisticsStatus === 'delivered' ? '已送达' : 
                     product.logisticsStatus === 'shipped' ? '运输中' : '待发货'}
                  </div>
                  <ChevronRight size={16} className="text-zinc-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExperts.map(expert => (
            <motion.div 
              key={expert.uid}
              className="bg-white p-6 rounded-3xl border border-zinc-200 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center overflow-hidden">
                {expert.photoURL ? <img src={expert.photoURL} className="w-full h-full object-cover" /> : <UserIcon size={32} className="text-zinc-300" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-zinc-900">{expert.displayName}</h4>
                <p className="text-xs text-zinc-500 line-clamp-1">{expert.bio}</p>
                <div className="mt-2 flex gap-1">
                  {expert.careerInterests?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-zinc-100 text-[10px] text-zinc-500 rounded-md">{tag}</span>
                  ))}
                </div>
              </div>
              <button className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl">进店</button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Logistics Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-t-[40px] md:rounded-[40px] p-8 shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">物流详情</h2>
                <button onClick={() => setSelectedProduct(null)} className="text-zinc-400 hover:text-zinc-900">关闭</button>
              </div>

              {/* AI Prediction Card */}
              <div className="bg-emerald-600 p-6 rounded-3xl text-white space-y-2 shadow-lg shadow-emerald-200">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80">
                  <Clock size={14} /> AI 动态预计到达
                </div>
                <p className="text-lg font-bold">{aiPrediction || '正在计算最优路径...'}</p>
              </div>

              {/* Graphical Timeline (Custom View) */}
              <div className="relative h-24 bg-zinc-50 rounded-3xl p-4 flex items-center justify-between overflow-hidden">
                <div className="absolute top-1/2 left-8 right-8 h-1 bg-zinc-200 -translate-y-1/2" />
                <div 
                  className="absolute top-1/2 left-8 h-1 bg-emerald-500 -translate-y-1/2 transition-all duration-1000" 
                  style={{ width: selectedProduct.logisticsStatus === 'delivered' ? 'calc(100% - 64px)' : selectedProduct.logisticsStatus === 'shipped' ? '50%' : '0%' }}
                />
                
                {['下单', '发货', '运输', '送达'].map((label, i) => {
                  const isActive = (i === 0) || 
                                  (i === 1 && (selectedProduct.logisticsStatus === 'shipped' || selectedProduct.logisticsStatus === 'delivered')) ||
                                  (i === 2 && (selectedProduct.logisticsStatus === 'shipped' || selectedProduct.logisticsStatus === 'delivered')) ||
                                  (i === 3 && selectedProduct.logisticsStatus === 'delivered');
                  
                  return (
                    <div key={label} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white border-2 border-zinc-200 text-zinc-300'}`}>
                        {i === 0 && <ShoppingBag size={14} />}
                        {i === 1 && <Package size={14} />}
                        {i === 2 && <Truck size={14} />}
                        {i === 3 && <MapPin size={14} />}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-zinc-900' : 'text-zinc-300'}`}>{label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Timeline */}
              <div className="space-y-6 pl-4">
                {(selectedProduct.logisticsTimeline || [
                  { status: '已下单', time: '2026-03-10 10:00', icon: 'ShoppingBag' },
                  { status: '待发货', time: '2026-03-10 14:00', icon: 'Package' },
                  { status: '运输中', time: '2026-03-11 09:00', icon: 'Truck' },
                  { status: '派送中', time: '预计今日送达', icon: 'MapPin' }
                ]).map((step, i, arr) => (
                  <div key={i} className="relative flex gap-6">
                    {i !== arr.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-zinc-100" />
                    )}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${i === arr.length - 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-zinc-100 text-zinc-400'}`}>
                      {i === arr.length - 1 ? <Truck size={12} /> : <div className="w-2 h-2 bg-current rounded-full" />}
                    </div>
                    <div className="space-y-1">
                      <p className={`text-sm font-bold ${i === arr.length - 1 ? 'text-zinc-900' : 'text-zinc-400'}`}>{step.status}</p>
                      <p className="text-xs text-zinc-400">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    // In a real app, this would navigate to Chat with the expert
                    console.log(`正在连接职业导师: ${selectedProduct.sellerName}`);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                >
                  <UserIcon size={18} /> 咨询职业导师
                </button>
                <button className="flex-1 py-4 bg-zinc-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">
                  确认收货
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
