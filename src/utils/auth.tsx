'use client';

import { useRouter } from 'next/router';
import { useEffect, useState, ReactNode } from 'react';

export function withAuth(Component: React.ComponentType<any>) {
  return function ProtectedComponent(props: any) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      if (!token) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }

      setIsLoading(false);
    }, [router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212529' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto" style={{ borderColor: '#FF6600' }}></div>
            <p className="mt-4" style={{ color: '#adb5bd' }}>Carregando...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

export function useAuth() {
  const [user, setUser] = useState<{ username: string; firstName: string } | null>(null);

  useEffect(() => {
    const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
    const firstName = typeof window !== 'undefined' ? localStorage.getItem('firstName') : null;
    
    if (username && firstName) {
      setUser({ username, firstName });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    localStorage.removeItem('firstName');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return { user, logout };
}
