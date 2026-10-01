import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      try {
        const data = await api.getUsers();
        if (isMounted) {
          setUsers(data);
          if (data.length > 0 && !currentUser) {
            // Restore saved user or default to first demo user
            const savedId = localStorage.getItem('eventpulse_user_id');
            const found = data.find((u) => u._id === savedId);
            setCurrentUser(found || data[0]);
          }
        }
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetUser = (user: User) => {
    setCurrentUser(user);
    if (user._id) {
      localStorage.setItem('eventpulse_user_id', user._id);
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser: handleSetUser,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
