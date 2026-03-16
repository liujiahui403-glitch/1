// Mock Firebase implementation for offline Android Studio usage
export const auth = {
  currentUser: {
    uid: 'mock-user-123',
    displayName: '测试用户',
    photoURL: 'https://picsum.photos/seed/user/200/200',
    email: 'test@example.com'
  },
  onAuthStateChanged: (callback: any) => {
    callback({ uid: 'mock-user-123', displayName: '测试用户' });
    return () => {};
  },
  signOut: async () => {}
} as any;

export const db = {
  type: 'firestore',
  app: {},
  toJSON: () => ({})
} as any;

// Mock Firestore functions
export const collection = (db: any, path: string) => ({ path }) as any;
export const query = (col: any, ...args: any[]) => ({ ...col, queries: args }) as any;
export const orderBy = (field: string, direction: string) => ({ field, direction }) as any;
export const where = (field: string, op: string, value: any) => ({ field, op, value }) as any;
export const onSnapshot = (ref: any, callback: any) => {
  // Return some mock data based on path
  if (ref.path === 'chatRooms') {
    callback({
      docs: [
        { id: 'room1', data: () => ({ name: '职业规划交流群', lastMessage: '欢迎加入！', updatedAt: { toDate: () => new Date() }, participants: ['mock-user-123', 'expert1'], order: 10 }) },
        { id: 'room2', data: () => ({ name: '技术大咖面对面', lastMessage: '明晚有直播。', updatedAt: { toDate: () => new Date() }, participants: ['mock-user-123', 'expert2'], order: 5 }) }
      ]
    });
  } else if (ref.path?.includes('messages')) {
    callback({
      docs: [
        { id: 'm1', data: () => ({ text: '你好，有什么可以帮你的吗？', senderId: 'system', createdAt: { toDate: () => new Date() }, senderName: 'AI助手' }) }
      ]
    });
  } else if (ref.path === 'users' || ref.path?.includes('users/')) {
    if (ref.queries?.some((q: any) => q.field === 'role' && q.value === 'admin')) {
      callback({
        docs: [
          { id: 'expert1', data: () => ({ displayName: '张导师', bio: '资深职业规划师', careerInterests: ['互联网', '金融'], photoURL: 'https://picsum.photos/seed/expert1/200/200' }) },
          { id: 'expert2', data: () => ({ displayName: '李专家', bio: 'AI领域技术专家', careerInterests: ['人工智能', '大数据'], photoURL: 'https://picsum.photos/seed/expert2/200/200' }) }
        ]
      });
    } else {
      callback({
        exists: () => true,
        id: 'mock-user-123',
        data: () => ({
          displayName: '测试用户',
          bio: '专注于AI与职业发展的探索者',
          careerInterests: ['人工智能', '产品经理', '数据分析'],
          medals: ['Python 精通', '算法专家'],
          followingCount: 128,
          followersCount: 1024,
          likesReceived: 512
        })
      });
    }
  } else if (ref.path === 'articles') {
    callback({
      docs: [
        { id: 'a1', data: () => ({ title: '2026年AI行业就业指南', content: 'AI行业正在经历前所未有的变革...', authorName: 'AI周刊', category: '人工智能', likesCount: 1200, imageUrl: 'https://picsum.photos/seed/ai/800/600', createdAt: new Date() }) },
        { id: 'a2', data: () => ({ title: '如何从零开始成为产品经理', content: '产品经理不仅是画原型图...', authorName: '职场达人', category: '产品经理', likesCount: 850, imageUrl: 'https://picsum.photos/seed/pm/800/600', createdAt: new Date() }) },
        { id: 'a3', data: () => ({ title: '程序员的职业天花板在哪里？', content: '很多程序员在35岁时会感到焦虑...', authorName: '码农之家', category: '程序员', likesCount: 2300, imageUrl: 'https://picsum.photos/seed/code/800/600', createdAt: new Date() }) }
      ]
    });
  } else if (ref.path === 'products') {
    callback({
      docs: [
        { id: 'p1', data: () => ({ name: '《AI时代的职业突围》', price: 59, description: '深度解析AI如何重塑职场竞争力', category: '书籍', sellerName: 'CareerAI书店', logisticsStatus: 'shipped', imageUrl: 'https://picsum.photos/seed/book1/400/300' }) },
        { id: 'p2', data: () => ({ name: '高级产品经理实战课', price: 199, description: '从需求分析到上线全流程实战', category: '课程', sellerName: '职场学院', logisticsStatus: 'delivered', imageUrl: 'https://picsum.photos/seed/course1/400/300' }) }
      ]
    });
  }
  return () => {};
};
export const addDoc = async (col: any, data: any) => ({ id: Math.random().toString() }) as any;
export const getDocs = async (q: any) => ({ docs: [] }) as any;
export const getDoc = async (ref: any) => ({ exists: () => true, data: () => ({}) }) as any;
export const getDocFromServer = async (ref: any) => ({ exists: () => true, data: () => ({}) }) as any;
export const doc = (db: any, path: string, id?: string) => ({ path: id ? `${path}/${id}` : path }) as any;
export const updateDoc = (async (ref: any, data: any) => {}) as any;
export const setDoc = (async (ref: any, data: any) => {}) as any;
export const serverTimestamp = () => new Date() as any;

// Mock Auth functions
export const onAuthStateChanged = (auth: any, callback: any) => {
  callback({ uid: 'mock-user-123', displayName: '测试用户', email: 'test@example.com' });
  return () => {};
};
export const signOut = async (auth: any) => {};
export const signInWithEmailAndPassword = async (auth: any, email: string, pass: string) => {};
export const createUserWithEmailAndPassword = async (auth: any, email: string, pass: string) => {};

export default { auth, db };
