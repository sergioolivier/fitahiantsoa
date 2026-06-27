import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getStoredUser());
  const [loading, setLoading] = useState(true);

  // Au chargement de l'app, on verifie que la session stockee est toujours valide
  // en interrogeant /auth/me. Si le token est invalide, l'intercepteur axios
  // redirigera automatiquement vers /connexion.
  useEffect(() => {
    const token = localStorage.getItem('fitahiantsoa_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem('fitahiantsoa_user', JSON.stringify(freshUser));
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    authService.saveSession(result);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (payload) => {
    const result = await authService.register(payload);
    authService.saveSession(result);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    authService.clearSession();
    setUser(null);
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit etre utilise a l\'interieur de AuthProvider.');
  }
  return ctx;
}
