/**
 * POST /api/auth/login - Valida credenciais contra a planilha de controle de acessos
 * Retorna um token JWT ou erro de autenticação
 */

import type { NextApiRequest, NextApiResponse } from 'next';

interface LoginRequestBody {
  username: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    username: string;
    firstName: string;
  };
}

// Função para buscar usuários autorizados da planilha Google Sheets
async function getAuthorizedUsers(): Promise<Array<{ username: string; name: string }>> {
  try {
    const sheetId = process.env.GOOGLE_ACCESS_CONTROL_SHEET_ID;
    if (!sheetId) {
      console.error('GOOGLE_ACCESS_CONTROL_SHEET_ID não configurado');
      return [];
    }

    // URL para ler a planilha em formato CSV (mais simples que API)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

    const response = await fetch(csvUrl);
    const csvText = await response.text();

    // Parsear CSV simples
    const lines = csvText.split('\n');
    
    // Encontrar as colunas D (nome - índice 3) e E (username - índice 4)
    // Assumindo que a primeira linha é header
    const users: Array<{ username: string; name: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cells = line.split(',');
      if (cells.length > 4) {
        // Coluna D é índice 3 (nome), Coluna E é índice 4 (username)
        const name = cells[3]?.trim().replace(/^"|"$/g, ''); // Remove aspas se houver
        const username = cells[4]?.trim().replace(/^"|"$/g, '');
        
        if (username && name) {
          users.push({ username, name });
        }
      }
    }

    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários da planilha:', error);
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { username } = req.body as LoginRequestBody;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ success: false, message: 'Username é obrigatório' });
  }

  try {
    // Buscar usuários autorizados da planilha
    const authorizedUsers = await getAuthorizedUsers();

    // Encontrar o usuário com o username fornecido
    const user = authorizedUsers.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário não autorizado' });
    }

    // Extrair primeiro nome e formatar: primeira letra maiúscula, resto minúsculo
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();

    // Gerar token com o username exato
    const token = Buffer.from(username).toString('base64');

    // Salvar no cookie de sessão
    res.setHeader(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24}` // 24 horas
    );

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        username: username,
        firstName: firstName
      }
    });
  } catch (error) {
    console.error('Erro ao processar login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar login. Tente novamente.'
    });
  }
}
