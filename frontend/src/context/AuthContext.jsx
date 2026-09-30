import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('procureai_user');
    const savedOrg = localStorage.getItem('procureai_org');
    const token = localStorage.getItem('procureai_token');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        if (savedOrg) setOrganization(JSON.parse(savedOrg));
      } catch (e) {
        api.clearAuth();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, is_supplier = false) => {
    const response = await api.login({ email, password, is_supplier });
    if (response.success && response.data) {
      api.setAuth(response.data);
      setUser(response.data.user);
      setOrganization(response.data.organization);
      return response.data;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (formData) => {
    const response = await api.register(formData);
    if (response.success && response.data) {
      api.setAuth(response.data);
      setUser(response.data.user);
      setOrganization(response.data.organization);
      return response.data;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    api.clearAuth();
    setUser(null);
    setOrganization(null);
  };

  // Quick Persona switcher for immediate testing and evaluation of all roles
  const quickSwitchUser = async (roleName) => {
    const personaMap = {
      'Admin': { email: 'admin@apexglobal.com', isSupplier: false },
      'Procurement Manager': { email: 'manager@apexglobal.com', isSupplier: false },
      'Finance Manager': { email: 'finance@apexglobal.com', isSupplier: false },
      'Warehouse Manager': { email: 'warehouse@apexglobal.com', isSupplier: false },
      'Supplier Admin (Titan Alloys)': { email: 'supplier1@titanalloys.com', isSupplier: true }
    };

    const target = personaMap[roleName] || personaMap['Admin'];
    return await login(target.email, 'Password123!', target.isSupplier);
  };

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      loading,
      login,
      register,
      logout,
      quickSwitchUser,
      isAuthenticated: !!user,
      isSupplier: !!user?.is_supplier
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
