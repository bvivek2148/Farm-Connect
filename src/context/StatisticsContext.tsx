import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the statistics type
type Statistics = {
  totalFarms: number;
  totalCustomers: number;
  activeUsers: number;
  uniqueVisitors: number;
};

// Statistics context type
interface StatisticsContextType {
  statistics: Statistics;
  incrementFarms: () => void;
  incrementCustomers: () => void;
  incrementActiveUsers: () => void;
  incrementUniqueVisitors: (userId: string) => void;
}

// Create the context
const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

// Create the provider component
export const StatisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial statistics state
  const [statistics, setStatistics] = useState<Statistics>({
    totalFarms: 248,
    totalCustomers: 5842,
    activeUsers: 3127,
    uniqueVisitors: 15749
  });
  
  // Track visitors to avoid duplicate counting
  const [visitedUsers, setVisitedUsers] = useState<Set<string>>(new Set());
  
  // Load statistics from localStorage on initial render
  useEffect(() => {
    const savedStats = localStorage.getItem('farmConnectStatistics');
    const savedVisitors = localStorage.getItem('farmConnectVisitors');
    
    if (savedStats) {
      try {
        setStatistics(JSON.parse(savedStats));
      } catch (error) {
        console.error('Failed to parse statistics data:', error);
        localStorage.removeItem('farmConnectStatistics');
      }
    }
    
    if (savedVisitors) {
      try {
        setVisitedUsers(new Set(JSON.parse(savedVisitors)));
      } catch (error) {
        console.error('Failed to parse visitors data:', error);
        localStorage.removeItem('farmConnectVisitors');
      }
    }
    
    // Track unique visitor on page load (using a random ID for demo)
    const userId = localStorage.getItem('farmConnectUserId') || 
                  Math.random().toString(36).substring(2, 15);
    localStorage.setItem('farmConnectUserId', userId);
    incrementUniqueVisitors(userId);
  }, []);
  
  // Save statistics to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('farmConnectStatistics', JSON.stringify(statistics));
  }, [statistics]);
  
  // Save visited users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('farmConnectVisitors', JSON.stringify([...visitedUsers]));
  }, [visitedUsers]);
  
  // Increment functions
  const incrementFarms = () => {
    setStatistics(prev => ({ ...prev, totalFarms: prev.totalFarms + 1 }));
  };
  
  const incrementCustomers = () => {
    setStatistics(prev => ({ ...prev, totalCustomers: prev.totalCustomers + 1 }));
  };
  
  const incrementActiveUsers = () => {
    setStatistics(prev => ({ ...prev, activeUsers: prev.activeUsers + 1 }));
  };
  
  const incrementUniqueVisitors = (userId: string) => {
    if (!visitedUsers.has(userId)) {
      setVisitedUsers(prev => new Set(prev).add(userId));
      setStatistics(prev => ({ ...prev, uniqueVisitors: prev.uniqueVisitors + 1 }));
    }
  };
  
  // Context value
  const value = {
    statistics,
    incrementFarms,
    incrementCustomers,
    incrementActiveUsers,
    incrementUniqueVisitors
  };
  
  return (
    <StatisticsContext.Provider value={value}>
      {children}
    </StatisticsContext.Provider>
  );
};

// Hook for using the statistics context
export function useStatistics() {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
}