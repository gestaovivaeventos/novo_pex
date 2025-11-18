/**
 * Módulo de Autenticação com Google Sheets
 * Gerencia busca e atualização de usuários na aba BASE MV
 */

export interface AcessoUser {
  username: string;
  senhaHash: string;
  tokenResetAdmin: string; // Novo campo para token
  nmAcessoAdmin: boolean;
  nmAcessoGestor: boolean;
  rowIndex: number;
}

export interface UserPasswordUpdate {
  rowIndex: number;
  username: string;
}

/**
 * Busca um usuário na aba BASE MV pelo username
 * Retorna a primeira ocorrência encontrada com o token de reset
 * @param username - Username do usuário
 * @returns AcessoUser com rowIndex e tokenResetAdmin ou null se não encontrado
 */
export async function findUserByUsername(username: string): Promise<AcessoUser | null> {
  try {
    const sheetId = process.env.GOOGLE_ACCESS_CONTROL_SHEET_ID;
    if (!sheetId) {
      console.error('GOOGLE_ACCESS_CONTROL_SHEET_ID não configurado');
      return null;
    }

    // URL para ler a planilha em formato CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

    const response = await fetch(csvUrl);
    const csvText = await response.text();

    // Parsear CSV
    const lines = csvText.split('\n');
    
    // Colunas esperadas na aba BASE MV:
    // E (índice 4) = username
    // F (índice 5) = Senha_Hash
    // G (índice 6) = nmAcessoAdmin (1 ou 0)
    // H (índice 7) = nmAcessoGestor (1 ou 0)
    // P (índice 15) = Senha_Hash (para atualizar múltiplas linhas)
    // Q (índice 16) = Token_Reset_Admin
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cells = line.split(',');
      if (cells.length > 16) {
        const currentUsername = cells[4]?.trim().replace(/^"|"$/g, ''); // Coluna E
        
        if (currentUsername === username) {
          // Tentar primeira a coluna P (Senha_Hash - atualizada), depois F como fallback
          let senhaHash = cells[15]?.trim().replace(/^"|"$/g, '') || ''; // Coluna P (nova)
          if (!senhaHash) {
            senhaHash = cells[5]?.trim().replace(/^"|"$/g, '') || ''; // Coluna F (antiga, fallback)
          }
          
          const tokenResetAdmin = cells[16]?.trim().replace(/^"|"$/g, '') || ''; // Coluna Q (token dinâmico)
          
          // Verificar admin/gestor
          const nmAcessoAdminStr = cells[6]?.trim().replace(/^"|"$/g, '') || '0'; // Coluna G
          const nmAcessoGestorStr = cells[7]?.trim().replace(/^"|"$/g, '') || '0'; // Coluna H
          
          const nmAcessoAdmin = nmAcessoAdminStr === '1' || nmAcessoAdminStr === 'TRUE';
          const nmAcessoGestor = nmAcessoGestorStr === '1' || nmAcessoGestorStr === 'TRUE';

          return {
            username,
            senhaHash,
            tokenResetAdmin,
            nmAcessoAdmin,
            nmAcessoGestor,
            rowIndex: i + 1 // Linha do Google Sheets (1 = header, 2 = primeira linha de dados)
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário da planilha:', error);
    return null;
  }
}

/**
 * Busca TODAS as linhas de um usuário na aba BASE MV
 * Retorna array com índices de todas as linhas onde o usuário aparece
 * @param username - Username do usuário
 * @returns Array de UserPasswordUpdate com todos os rowIndex do usuário
 */
export async function findAllUserRows(username: string): Promise<UserPasswordUpdate[]> {
  try {
    const sheetId = process.env.GOOGLE_ACCESS_CONTROL_SHEET_ID;
    if (!sheetId) {
      console.error('GOOGLE_ACCESS_CONTROL_SHEET_ID não configurado');
      return [];
    }

    // URL para ler a planilha em formato CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

    const response = await fetch(csvUrl);
    const csvText = await response.text();

    // Parsear CSV
    const lines = csvText.split('\n');
    const userRows: UserPasswordUpdate[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cells = line.split(',');
      if (cells.length > 4) {
        const currentUsername = cells[4]?.trim().replace(/^"|"$/g, ''); // Coluna E

        if (currentUsername === username) {
          userRows.push({
            rowIndex: i + 1, // Linha do Google Sheets (1 = header, 2 = primeira linha de dados)
            username
          });
        }
      }
    }

    return userRows;
  } catch (error) {
    console.error('Erro ao buscar todas as linhas do usuário:', error);
    return [];
  }
}

/**
 * Atualiza o hash da senha em TODAS as linhas de um usuário na coluna P
 * @param username - Username do usuário
 * @param newHash - Novo hash da senha (criptografado com bcrypt)
 * @returns true se atualizado com sucesso, false caso contrário
 */
export async function updateAllUserPasswordHashes(username: string, newHash: string): Promise<boolean> {
  try {
    // Buscar todas as linhas do usuário
    const userRows = await findAllUserRows(username);
    
    if (userRows.length === 0) {
      console.warn(`Nenhuma linha encontrada para o usuário: ${username}`);
      return false;
    }

    console.log(`Atualizando senha para ${username} em ${userRows.length} linha(s)`);

    // Implementação com Google Sheets API v4
    const { google } = require('googleapis');
    
    const sheetId = process.env.GOOGLE_ACCESS_CONTROL_SHEET_ID;
    const serviceAccountBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
    
    if (!sheetId || !serviceAccountBase64) {
      console.error('GOOGLE_ACCESS_CONTROL_SHEET_ID ou GOOGLE_SERVICE_ACCOUNT_BASE64 não configurados');
      return false;
    }

    // Decodificar a conta de serviço
    const serviceAccountJson = JSON.parse(
      Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
    );

    // Autenticar com Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountJson,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Preparar updates em batch para melhor performance
    const updates: any[] = [];
    for (const row of userRows) {
      // Usar apóstrofos para escapar nomes de abas com espaços
      updates.push({
        range: `'BASE MV'!P${row.rowIndex}`,
        values: [[newHash]]
      });
    }

    // Executar updates em batch
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    if (response.status === 200) {
      console.log(`✅ [SHEETS] Senha atualizada para ${username} em ${userRows.length} linha(s)`);
      return true;
    } else {
      console.error('Erro ao atualizar senhas via API:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Erro ao atualizar senhas de todas as linhas:', error);
    return false;
  }
}

/**
 * Valida o token de reset contra o token armazenado na coluna Q
 * @param providedToken - Token fornecido pelo usuário
 * @param storedToken - Token armazenado na planilha (coluna Q)
 * @returns true se os tokens correspondem
 */
export function validateResetToken(providedToken: string, storedToken: string): boolean {
  // Validação simples: verificar correspondência exata
  return providedToken === storedToken && storedToken.length > 0;
}

/**
 * Verifica se um usuário tem acesso de administrador
 */
export function isAdmin(user: AcessoUser): boolean {
  return user.nmAcessoAdmin === true;
}

/**
 * Verifica se um usuário tem acesso de gestor
 */
export function isGestor(user: AcessoUser): boolean {
  return user.nmAcessoGestor === true;
}
