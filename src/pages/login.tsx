/**
 * Página de Login - Autenticação simples com usuário/senha
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';

interface LoginFormState {
  username: string;
  password: string;
  loading: boolean;
  error: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<LoginFormState>({
    username: '',
    password: '',
    loading: false,
    error: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
      error: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formState.username.trim()) {
      setFormState(prev => ({
        ...prev,
        error: 'Por favor, informe seu usuário'
      }));
      return;
    }

    if (!formState.password.trim()) {
      setFormState(prev => ({
        ...prev,
        error: 'Por favor, informe sua senha'
      }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username: formState.username,
          password: formState.password
        })
      });

      const data = await response.json();

        if (response.ok && data.success) {
        // Salvar token e dados de permissão no localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('firstName', data.user.firstName);
        localStorage.setItem('accessLevel', String(data.user.accessLevel));
        if (data.user.unitNames && data.user.unitNames.length > 0) {
          localStorage.setItem('unitNames', JSON.stringify(data.user.unitNames));
        }
        
        // Redirecionar para dashboard
        router.push('/ranking');
      } else {
        setFormState(prev => ({
          ...prev,
          error: data.message || 'Erro ao realizar login'
        }));
      }
    } catch (err) {
      setFormState(prev => ({
        ...prev,
        error: 'Erro de conexão. Tente novamente.'
      }));
      console.error('Login error:', err);
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <>
      <Head>
        <title>Login - PEX Dashboard</title>
        <meta name="description" content="Acesso ao PEX Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: '#212529' }}>
        {/* Container Central */}
        <div className="flex items-center justify-center min-h-screen px-4">
          <div
            className="w-full max-w-md rounded-lg shadow-2xl p-8 md:p-10"
            style={{ backgroundColor: '#343A40', border: '1px solid #555' }}
          >
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div
                className="text-4xl font-bold mb-2"
                style={{ color: '#FF6600' }}
              >
                PEX
              </div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ color: '#F8F9FA' }}
              >
                Dashboard
              </h1>
              <p style={{ color: '#adb5bd' }} className="text-sm">
                Programa de Excelência
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#adb5bd' }}
                >
                  Usuário
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formState.username}
                  onChange={handleInputChange}
                  placeholder="Informe seu usuário"
                  disabled={formState.loading}
                  className="w-full px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#495057',
                    color: '#F8F9FA'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px #FF6600';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Campo Senha */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#adb5bd' }}
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formState.password}
                    onChange={handleInputChange}
                    placeholder="Informe sua senha"
                    disabled={formState.loading}
                    className="w-full px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 pr-12"
                    style={{
                      backgroundColor: '#495057',
                      color: '#F8F9FA'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 0 2px #FF6600';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold transition-colors"
                    style={{ color: '#adb5bd' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#FF6600';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#adb5bd';
                    }}
                  >
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              {/* Mensagem de Erro */}
              {formState.error && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    border: '1px solid #dc3545',
                    color: '#ff6b6b'
                  }}
                >
                  {formState.error}
                </div>
              )}

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={formState.loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200"
                style={{
                  backgroundColor: formState.loading ? '#666' : '#FF6600',
                  opacity: formState.loading ? 0.8 : 1,
                  cursor: formState.loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!formState.loading) {
                    e.currentTarget.style.backgroundColor = '#ff7a33';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!formState.loading) {
                    e.currentTarget.style.backgroundColor = '#FF6600';
                  }
                }}
              >
                {formState.loading ? 'Autenticando...' : 'Entrar'}
              </button>

              {/* Link Redefinir Senha */}
              <div className="text-center pt-2">
                <a
                  href="/reset-password"
                  className="text-sm font-medium transition-colors"
                  style={{ color: '#adb5bd' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FF6600';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#adb5bd';
                  }}
                >
                  Esqueceu sua senha?
                </a>
              </div>
            </form>

            {/* Rodapé */}
            <div className="mt-8 text-center">
              <p style={{ color: '#6c757d' }} className="text-xs">
                © 2025 Gestão Viva Eventos. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
