import { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface PageViewData {
  path: string;
  pageTitle: string;
  enterTime: number;
  exitTime?: number;
  duration: number;
  clicks: number;
  referrer?: string;
}

export interface ProductViewData {
  productId: string;
  productName: string;
  enterTime: number;
  exitTime?: number;
  duration: number;
  clicks: number;
}

export interface SessionData {
  sessionId: string;
  startTime: number;
  endTime?: number;
  userId?: string;
  pageViews: PageViewData[];
  productViews: ProductViewData[];
  totalClicks: number;
  totalDuration: number;
  device: 'mobile' | 'tablet' | 'desktop';
  isActive: boolean;
  visitorEmail?: string;
  isEmailCollected?: boolean;
}

export interface AnalyticsStats {
  totalSessions: number;
  totalPageViews: number;
  totalProductViews: number;
  totalClicks: number;
  averageSessionDuration: number;
  averageProductDuration: number;
  bounceRate: number;
  activeVisitors: number;
  todaySessions: number;
  todayPageViews: number;
  addToCartCounts: Record<string, number>;
  pageStats: {
    path: string;
    title: string;
    views: number;
    avgDuration: number;
    totalClicks: number;
    bounceRate: number;
  }[];
  productStats: {
    productId: string;
    productName: string;
    views: number;
    avgDuration: number;
    totalClicks: number;
    conversionRate: number;
  }[];
  hourlyTraffic: { hour: string; views: number; sessions: number }[];
  deviceBreakdown: { device: string; count: number; percentage: number }[];
}

interface AnalyticsContextType {
  currentSession: SessionData | null;
  trackPageView: (path: string, title: string) => void;
  trackPageExit: (path: string) => void;
  trackProductView: (productId: string, productName: string) => void;
  trackProductExit: (productId: string) => void;
  trackClick: (path: string, productId?: string) => void;
  trackAddToCart: (productId: string) => void;
  collectVisitorEmail: (email: string) => void;
  getAllSessions: () => SessionData[];
  getAnalyticsStats: () => AnalyticsStats;
  clearAnalytics: () => void;
  refreshTick: number;
  startSession: (userId?: string) => void;
  endSession: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// ============================================================================
// HELPERS
// ============================================================================

const STORAGE_KEY = 'rayha_analytics_sessions';
const SESSION_KEY = 'rayha_current_session';
const ADD_TO_CART_KEY = 'rayha_analytics_add_to_cart';

const getStoredAddToCartCounts = (): Record<string, number> => {
  try {
    const saved = localStorage.getItem(ADD_TO_CART_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const getStoredSessions = (): SessionData[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getSavedSession = (): SessionData | null => {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    const session = JSON.parse(saved) as SessionData;
    // Reprendre si session < 30 min
    if (Date.now() - session.startTime < 30 * 60 * 1000) {
      return { ...session, isActive: true };
    }
    return null;
  } catch {
    return null;
  }
};

const generateSessionId = (): string =>
  `s_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

const detectDevice = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop'; // Default for SSR
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
};

const isToday = (timestamp: number): boolean => {
  const d = new Date(timestamp);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
};

// ============================================================================
// PROVIDER
// ============================================================================

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<SessionData[]>(getStoredSessions);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(getSavedSession);
  const [addToCartCounts, setAddToCartCounts] = useState<Record<string, number>>(getStoredAddToCartCounts);
  const [refreshTick, setRefreshTick] = useState(0);

  const sessionRef = useRef<SessionData | null>(currentSession);

  // Keep ref in sync
  useEffect(() => {
    sessionRef.current = currentSession;
  }, [currentSession]);

  // Auto-start session
  useEffect(() => {
    if (!currentSession) {
      const existing = getSavedSession();
      if (existing) {
        setCurrentSession(existing);
      } else {
        setCurrentSession({
          sessionId: generateSessionId(),
          startTime: Date.now(),
          pageViews: [],
          productViews: [],
          totalClicks: 0,
          totalDuration: 0,
          device: detectDevice(),
          isActive: true,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist completed sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(-500)));
    } catch { /* full */ }
  }, [sessions]);

  // Persist current session
  useEffect(() => {
    if (currentSession) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
      } catch { /* full */ }
    }
  }, [currentSession]);

  // Refresh tick (3s) for live durations
  useEffect(() => {
    const id = setInterval(() => setRefreshTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  // Save on beforeunload
  useEffect(() => {
    const handle = () => {
      if (sessionRef.current) {
        const ended: SessionData = {
          ...sessionRef.current,
          endTime: Date.now(),
          totalDuration: Date.now() - sessionRef.current.startTime,
          isActive: false,
        };
        const prev = getStoredSessions();
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, ended].slice(-500)));
        localStorage.removeItem(SESSION_KEY);
      }
    };
    window.addEventListener('beforeunload', handle);
    return () => window.removeEventListener('beforeunload', handle);
  }, []);

  // ========== TRACKING ==========

  const startSession = useCallback((userId?: string) => {
    if (sessionRef.current) {
      const ended: SessionData = {
        ...sessionRef.current,
        endTime: Date.now(),
        totalDuration: Date.now() - sessionRef.current.startTime,
        isActive: false,
      };
      setSessions(prev => [...prev, ended]);
    }
    setCurrentSession({
      sessionId: generateSessionId(),
      startTime: Date.now(),
      userId,
      pageViews: [],
      productViews: [],
      totalClicks: 0,
      totalDuration: 0,
      device: detectDevice(),
      isActive: true,
    });
  }, []);

  const endSession = useCallback(() => {
    if (sessionRef.current) {
      const ended: SessionData = {
        ...sessionRef.current,
        endTime: Date.now(),
        totalDuration: Date.now() - sessionRef.current.startTime,
        isActive: false,
      };
      setSessions(prev => [...prev, ended]);
      setCurrentSession(null);
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const trackPageView = useCallback((path: string, title: string) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      // Skip duplicate
      const last = prev.pageViews[prev.pageViews.length - 1];
      if (last && last.path === path && !last.exitTime) return prev;
      // Close previous page
      const updated = prev.pageViews.map((pv, i) => {
        if (i === prev.pageViews.length - 1 && !pv.exitTime) {
          return { ...pv, exitTime: Date.now(), duration: Date.now() - pv.enterTime };
        }
        return pv;
      });
      return {
        ...prev,
        pageViews: [...updated, {
          path,
          pageTitle: title,
          enterTime: Date.now(),
          duration: 0,
          clicks: 0,
          referrer: document.referrer || undefined,
        }],
      };
    });
  }, []);

  const trackPageExit = useCallback((path: string) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pageViews: prev.pageViews.map(pv => {
          if (pv.path === path && !pv.exitTime) {
            return { ...pv, exitTime: Date.now(), duration: Date.now() - pv.enterTime };
          }
          return pv;
        }),
      };
    });
  }, []);

  const trackProductView = useCallback((productId: string, productName: string) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      const last = prev.productViews[prev.productViews.length - 1];
      if (last && last.productId === productId && !last.exitTime) return prev;
      return {
        ...prev,
        productViews: [...prev.productViews, {
          productId,
          productName,
          enterTime: Date.now(),
          duration: 0,
          clicks: 0,
        }],
      };
    });
  }, []);

  const trackProductExit = useCallback((productId: string) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        productViews: prev.productViews.map(pv => {
          if (pv.productId === productId && !pv.exitTime) {
            return { ...pv, exitTime: Date.now(), duration: Date.now() - pv.enterTime };
          }
          return pv;
        }),
      };
    });
  }, []);

  const trackClick = useCallback((path: string, productId?: string) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      const newViews = [...prev.pageViews];
      if (newViews.length > 0) {
        const last = newViews[newViews.length - 1];
        if (last.path === path) {
          newViews[newViews.length - 1] = { ...last, clicks: last.clicks + 1 };
        }
      }
      const newProdViews = [...prev.productViews];
      if (productId && newProdViews.length > 0) {
        const last = newProdViews[newProdViews.length - 1];
        if (last.productId === productId) {
          newProdViews[newProdViews.length - 1] = { ...last, clicks: last.clicks + 1 };
        }
      }
      return {
        ...prev,
        totalClicks: prev.totalClicks + 1,
        pageViews: newViews,
        productViews: newProdViews,
      };
    });
  }, []);

  const collectVisitorEmail = useCallback((email: string) => {
    setCurrentSession(prev => prev ? { ...prev, visitorEmail: email, isEmailCollected: true } : prev);
  }, []);

  const trackAddToCart = useCallback((productId: string) => {
    setAddToCartCounts(prev => {
      const updated = { ...prev, [productId]: (prev[productId] || 0) + 1 };
      try { localStorage.setItem(ADD_TO_CART_KEY, JSON.stringify(updated)); } catch { /* full */ }
      return updated;
    });
    setRefreshTick(t => t + 1);
  }, []);

  // ========== STATS ==========

  const getAllSessions = useCallback((): SessionData[] => {
    const all = [...sessions];
    if (currentSession) {
      all.push({
        ...currentSession,
        totalDuration: Date.now() - currentSession.startTime,
      });
    }
    return all;
  }, [sessions, currentSession]);

  const getAnalyticsStats = useCallback((): AnalyticsStats => {
    const allSessions = getAllSessions();
    const now = Date.now();

    const pageMap = new Map<string, { title: string; views: number; durations: number[]; clicks: number; singlePage: number; total: number }>();
    const prodMap = new Map<string, { name: string; views: number; durations: number[]; clicks: number }>();
    let totalClicks = 0;
    let todaySessions = 0;
    let todayPageViews = 0;
    let activeVisitors = 0;

    // Device breakdown
    const deviceCount: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0 };

    // Hourly traffic
    const hourly = new Map<string, { views: number; sessions: number }>();
    for (let i = 0; i < 24; i++) {
      hourly.set(i.toString().padStart(2, '0') + 'h', { views: 0, sessions: 0 });
    }

    allSessions.forEach(session => {
      const hourKey = new Date(session.startTime).getHours().toString().padStart(2, '0') + 'h';
      const hd = hourly.get(hourKey);
      if (hd) hd.sessions += 1;

      deviceCount[session.device || 'desktop'] = (deviceCount[session.device || 'desktop'] || 0) + 1;

      if (isToday(session.startTime)) todaySessions++;
      if (session.isActive || (now - session.startTime < 5 * 60 * 1000 && !session.endTime)) {
        activeVisitors++;
      }

      session.pageViews.forEach(pv => {
        const key = pv.path;
        const ex = pageMap.get(key) || { title: pv.pageTitle, views: 0, durations: [], clicks: 0, singlePage: 0, total: 0 };
        ex.views += 1;
        ex.total += 1;
        const dur = pv.duration > 0 ? pv.duration : (pv.exitTime ? pv.exitTime - pv.enterTime : now - pv.enterTime);
        ex.durations.push(dur);
        ex.clicks += pv.clicks;
        pageMap.set(key, ex);

        if (isToday(pv.enterTime)) {
          todayPageViews++;
          if (hd) hd.views += 1;
        }
      });

      if (session.pageViews.length === 1) {
        const key = session.pageViews[0].path;
        const ex = pageMap.get(key);
        if (ex) ex.singlePage += 1;
      }

      session.productViews.forEach(prv => {
        const key = prv.productId;
        const ex = prodMap.get(key) || { name: prv.productName, views: 0, durations: [], clicks: 0 };
        ex.views += 1;
        const dur = prv.duration > 0 ? prv.duration : (prv.exitTime ? prv.exitTime - prv.enterTime : now - prv.enterTime);
        ex.durations.push(dur);
        ex.clicks += prv.clicks;
        prodMap.set(key, ex);
      });

      totalClicks += session.totalClicks;
    });

    const pageStats = Array.from(pageMap).map(([path, d]) => ({
      path,
      title: d.title || path,
      views: d.views,
      avgDuration: d.durations.length > 0 ? d.durations.reduce((a, b) => a + b, 0) / d.durations.length : 0,
      totalClicks: d.clicks,
      bounceRate: d.total > 0 ? (d.singlePage / d.total) * 100 : 0,
    }));

    const productStats = Array.from(prodMap).map(([id, d]) => ({
      productId: id,
      productName: d.name,
      views: d.views,
      avgDuration: d.durations.length > 0 ? d.durations.reduce((a, b) => a + b, 0) / d.durations.length : 0,
      totalClicks: d.clicks,
      conversionRate: d.views > 0 ? (d.clicks / d.views) * 100 : 0,
    }));

    const totalPV = allSessions.reduce((s, ss) => s + ss.pageViews.length, 0);
    const totalProdV = allSessions.reduce((s, ss) => s + ss.productViews.length, 0);
    const totalDur = allSessions.reduce((s, ss) => s + (ss.totalDuration || (now - ss.startTime)), 0);
    const singlePage = allSessions.filter(s => s.pageViews.length <= 1).length;
    const totalDevices = Object.values(deviceCount).reduce((a, b) => a + b, 0);

    return {
      totalSessions: allSessions.length,
      totalPageViews: totalPV,
      totalProductViews: totalProdV,
      totalClicks,
      averageSessionDuration: allSessions.length > 0 ? totalDur / allSessions.length : 0,
      averageProductDuration: productStats.length > 0 ? productStats.reduce((s, p) => s + p.avgDuration, 0) / productStats.length : 0,
      bounceRate: allSessions.length > 0 ? (singlePage / allSessions.length) * 100 : 0,
      activeVisitors,
      todaySessions,
      todayPageViews,
      pageStats: pageStats.sort((a, b) => b.views - a.views),
      productStats: productStats.sort((a, b) => b.views - a.views),
      addToCartCounts,
      hourlyTraffic: Array.from(hourly).map(([hour, d]) => ({ hour, ...d })),
      deviceBreakdown: Object.entries(deviceCount).map(([device, count]) => ({
        device: device === 'mobile' ? 'Mobile' : device === 'tablet' ? 'Tablette' : 'Desktop',
        count,
        percentage: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0,
      })),
    };
  }, [getAllSessions]);

  const clearAnalytics = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ADD_TO_CART_KEY);
    setAddToCartCounts({});
    setCurrentSession({
      sessionId: generateSessionId(),
      startTime: Date.now(),
      pageViews: [],
      productViews: [],
      totalClicks: 0,
      totalDuration: 0,
      device: detectDevice(),
      isActive: true,
    });
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        currentSession,
        startSession,
        endSession,
        trackPageView,
        trackPageExit,
        trackProductView,
        trackProductExit,
        trackClick,
        trackAddToCart,
        collectVisitorEmail,
        getAllSessions,
        getAnalyticsStats,
        clearAnalytics,
        refreshTick,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
