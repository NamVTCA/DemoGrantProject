import React, { createContext, useState, useEffect, useContext } from 'react';

interface AuthUser {
  _id: string;
  // Add other user properties you need
}

interface IAuthContext {
  user: AuthUser | null;
  // You can add login/logout functions here later
}

export const AuthContext = createContext<IAuthContext>({ user: null });

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Check localStorage when the app starts to see if a user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the context
export const useAuth = () => {
    return useContext(AuthContext);
}