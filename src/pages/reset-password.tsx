/**
 * Página de Redefinição de Senha
 * Permite que usuários redefinam sua senha usando um token fornecido pelo admin
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface ResetPasswordFormState {
  username: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  error: string;
  success: boolean;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formState, setFormState] = useState<ResetPasswordFormState>({
    username: '',
    resetToken: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    error: '',
    success: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Validações
    if (!formState.username.trim()) {
      setFormState(prev => ({
        ...prev,
        error: 'Por favor, informe seu usuário'
      }));
      return;
    }

    if (!formState.resetToken.trim()) {
      setFormState(prev => ({
        ...prev,
        error: 'Por favor, informe o token de redefinição'
      }));
      return;
    }

    if (!formState.newPassword.trim()) {
      setFormState(prev => ({
        ...prev,
        error: 'Por favor, informe a nova senha'
      }));
      return;
    }

    if (formState.newPassword.length < 8) {
      setFormState(prev => ({
        ...prev,
        error: 'A senha deve ter no mínimo 8 caracteres'
      }));
      return;
    }

    if (formState.newPassword !== formState.confirmPassword) {
      setFormState(prev => ({
        ...prev,
        error: 'As senhas não conferem'
      }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const response = await fetch('/api/auth/reset-password-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formState.username,
          resetToken: formState.resetToken,
          newPassword: formState.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormState(prev => ({
          ...prev,
          success: true,
          error: ''
        }));
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setFormState(prev => ({
          ...prev,
          error: data.message || 'Erro ao redefinir senha'
        }));
      }
    } catch (err) {
      setFormState(prev => ({
        ...prev,
        error: 'Erro de conexão. Tente novamente.'
      }));
      console.error('Reset password error:', err);
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <>
      <Head>
        <title>Redefinir Senha - PEX Dashboard</title>
        <meta name="description" content="Redefinir senha do PEX Dashboard" />
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
                Redefinir Senha
              </h1>
              <p style={{ color: '#adb5bd' }} className="text-sm">
                Digite o token que você recebeu do administrador
              </p>
            </div>

            {/* Mensagem de Sucesso */}
            {formState.success && (
              <div
                className="p-4 rounded-lg text-sm mb-6 text-center"
                style={{
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  border: '1px solid #28a745',
                  color: '#6fd97c'
                }}
              >
                ✓ Senha redefinida com sucesso! Redirecionando para login...
              </div>
            )}

            {/* Formulário */}
            {!formState.success && (
              <form onSubmit={handleSubmit} className="space-y-5">
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

                {/* Campo Token de Redefinição */}
                <div>
                  <label
                    htmlFor="resetToken"
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#adb5bd' }}
                  >
                    Token de Redefinição
                  </label>
                  <input
                    id="resetToken"
                    name="resetToken"
                    type="text"
                    value={formState.resetToken}
                    onChange={handleInputChange}
                    placeholder="Cole o token fornecido pelo admin"
                    disabled={formState.loading}
                    className="w-full px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 font-mono text-sm"
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
                  <p style={{ color: '#6c757d' }} className="text-xs mt-2">
                    O token deve ser fornecido por um administrador
                  </p>
                </div>

                {/* Campo Nova Senha */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#adb5bd' }}
                  >
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formState.newPassword}
                      onChange={handleInputChange}
                      placeholder="Mínimo 8 caracteres"
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

                {/* Campo Confirmar Senha */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#adb5bd' }}
                  >
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formState.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirme a nova senha"
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold transition-colors"
                      style={{ color: '#adb5bd' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FF6600';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#adb5bd';
                      }}
                    >
                      {showConfirmPassword ? 'Ocultar' : 'Ver'}
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

                {/* Botão de Redefinir */}
                <button
                  type="submit"
                  disabled={formState.loading}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 mt-6"
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
                  {formState.loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </button>
              </form>
            )}

            {/* Link para Login */}
            <div className="mt-8 text-center">
              <a
                href="/login"
                className="text-sm font-medium transition-colors"
                style={{ color: '#adb5bd', cursor: 'pointer', display: 'inline-block' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FF6600';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#adb5bd';
                }}
              >
                Voltar para Login
              </a>
            </div>

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
