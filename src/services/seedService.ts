import { db, auth, collection, addDoc, getDocs, query, where } from '../firebase';
import { Article, Product, CareerRule } from '../types';

export const seedInitialData = async () => {
  try {
    const articlesCheck = await getDocs(collection(db, 'articles'));
    if (articlesCheck.empty) {
      const articles: Partial<Article>[] = [
        {
          title: '大模型时代的程序员生存指南',
          content: '在AI飞速发展的今天，程序员该如何保持竞争力？本文深度解析核心技能转型路径...',
          category: '程序员',
          authorName: 'AI 专家',
          imageUrl: 'https://picsum.photos/seed/code/800/600',
          likesCount: 1250,
          createdAt: new Date().toISOString()
        },
        {
          title: '新媒体运营：从零到一的爆款逻辑',
          content: '如何利用大模型辅助内容创作？掌握这三个核心公式，让你的内容更具吸引力...',
          category: '新媒体',
          authorName: '运营大咖',
          imageUrl: 'https://picsum.photos/seed/media/800/600',
          likesCount: 890,
          createdAt: new Date().toISOString()
        },
        {
          title: 'UI 设计师的 AI 转型之路',
          content: 'AI 绘画工具如何改变设计工作流？从 Midjourney 到 Stable Diffusion 的实战应用...',
          category: 'UI设计',
          authorName: '资深设计',
          imageUrl: 'https://picsum.photos/seed/design/800/600',
          likesCount: 560,
          createdAt: new Date().toISOString()
        },
        {
          title: '自由职业者的财务自由之路',
          content: '不坐班也能月入过万？揭秘自由职业者的多元化收入模型与风险管理...',
          category: '自由职业',
          authorName: '自由人',
          imageUrl: 'https://picsum.photos/seed/freelance/800/600',
          likesCount: 2100,
          createdAt: new Date().toISOString()
        }
      ];
      for (const a of articles) await addDoc(collection(db, 'articles'), a);
    }
  } catch (e) {
    console.warn('Failed to seed articles:', e);
  }

  try {
    const productsCheck = await getDocs(collection(db, 'products'));
    if (productsCheck.empty) {
      const products: Partial<Product>[] = [
        {
          name: '《大模型实战手册》精装版',
          description: '深度解析主流大模型架构与应用场景，附赠实战代码库。',
          price: 99,
          category: '书籍',
          imageUrl: 'https://picsum.photos/seed/book1/400/400',
          sellerId: 'system',
          sellerName: 'CareerAI 官方店',
          logisticsStatus: 'shipped',
          logisticsTimeline: [
            { status: '已下单', time: '2024-03-10 10:00', icon: 'CheckCircle' },
            { status: '已出库', time: '2024-03-10 14:00', icon: 'Package' },
            { status: '运输中', time: '2024-03-11 09:00', icon: 'Truck' }
          ],
          estimatedArrivalProb: '0.95',
          createdAt: new Date().toISOString(),
          stock: 100
        },
        {
          name: '1对1 职业规划咨询服务',
          description: '资深猎头提供专业职业诊断，定制化转型方案。',
          price: 499,
          category: '服务',
          imageUrl: 'https://picsum.photos/seed/service1/400/400',
          sellerId: 'system',
          sellerName: '职业导师团',
          logisticsStatus: 'delivered',
          logisticsTimeline: [
            { status: '已预约', time: '2024-03-11 10:00', icon: 'Calendar' },
            { status: '咨询中', time: '2024-03-12 14:00', icon: 'User' },
            { status: '已交付', time: '2024-03-12 16:00', icon: 'CheckCircle' }
          ],
          estimatedArrivalProb: '1.0',
          createdAt: new Date().toISOString(),
          stock: 10
        }
      ];
      for (const p of products) await addDoc(collection(db, 'products'), p);
    }
  } catch (e) {
    console.warn('Failed to seed products:', e);
  }

  try {
    const rulesCheck = await getDocs(collection(db, 'careerRules'));
    if (rulesCheck.empty) {
      const rules: Partial<CareerRule>[] = [
        {
          ruleName: "技术热情匹配",
          condition: "interests.includes('编程') && interests.includes('人工智能')",
          recommendation: "推荐关注：AI算法工程师、全栈开发工程师",
          weight: 0.9
        },
        {
          ruleName: "沟通能力匹配",
          condition: "interests.includes('沟通') || interests.includes('管理')",
          recommendation: "推荐关注：项目经理、销售总监、HRBP",
          weight: 0.8
        }
      ];
      for (const r of rules) await addDoc(collection(db, 'careerRules'), r);
    }
  } catch (e) {
    console.warn('Failed to seed career rules:', e);
  }

  try {
    // Seed Initial Chat Rooms if user is logged in
    if (auth.currentUser) {
      const roomsCheck = await getDocs(query(collection(db, 'chatRooms'), where('participants', 'array-contains', auth.currentUser.uid)));
      if (roomsCheck.empty) {
        const chatRooms = [
          {
            participants: [auth.currentUser.uid, 'expert_001'],
            lastMessage: '你好，关于我的职业规划有一些疑问...',
            lastTimestamp: new Date().toISOString(),
            order: 100
          },
          {
            participants: [auth.currentUser.uid, 'expert_002'],
            lastMessage: '您的简历我已经看过了，很有潜力。',
            lastTimestamp: new Date().toISOString(),
            order: 90
          }
        ];
        for (const room of chatRooms) await addDoc(collection(db, 'chatRooms'), room);
      }
    }
  } catch (e) {
    console.warn('Failed to seed chat rooms:', e);
  }
};
