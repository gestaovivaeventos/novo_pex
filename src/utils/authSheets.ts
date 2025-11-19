/**
 * Módulo de Autenticação com Google Sheets
 * Gerencia busca e atualização de usuários na aba SENHAS
 * Aba SENHAS: B=username, C=Senha_Hash, D=Token_Reset_Admin
 */

export interface PasswordUser {
  username: string;
  senhaHash: string;
  tokenResetAdmin: string;
  rowIndex: number;
}

/**
 * Busca um usuário na aba SENHAS pelo username
 * @param username - Username do usuário
 * @returns PasswordUser com rowIndex e tokenResetAdmin ou null se não encontrado
 */
export async function findUserByUsername(username: string): Promise<PasswordUser | null> {
  try {
    const sheetId = process.env.GOOGLE_ACCESS_CONTROL_SHEET_ID;
    if (!sheetId) {
      console.error('GOOGLE_ACCESS_CONTROL_SHEET_ID não configurado');
      return null;
    }

    // Obter todos os gids das abas usando Google Sheets API
    const { google } = require('googleapis');
    const serviceAccountBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
    
    if (!serviceAccountBase64) {
      console.error('GOOGLE_SERVICE_ACCOUNT_BASE64 não configurado');
      return null;
    }

    const serviceAccountJson = JSON.parse(
      Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
    );

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountJson,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Obter metadados da planilha para encontrar o gid da aba SENHAS
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: sheetId
    });

    let senhasGid: number | null = null;
    for (const sheet of metadata.data.sheets || []) {
      if (sheet.properties?.title?.toUpperCase() === 'SENHAS') {
        senhasGid = sheet.properties.sheetId;
        console.log(`✅ Encontrou aba SENHAS com gid=${senhasGid}`);
        break;
      }
    }

    if (senhasGid === null) {
      console.error('❌ Aba SENHAS não encontrada na planilha');
      return null;
    }

    // Agora buscar os dados da aba SENHAS usando o gid correto
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${senhasGid}`;
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      console.error(`❌ Erro ao baixar CSV da aba SENHAS: ${response.status}`);
      return null;
    }

    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headerLine = lines[0].split(',');
    
    console.log(`[SENHAS] Headers = ${headerLine.join(' | ')}`);

    // Encontrar os índices das colunas
    const usernameIdx = headerLine.findIndex(h => h.trim().toLowerCase().includes('username'));
    const senhaIdx = headerLine.findIndex(h => h.trim().toLowerCase().includes('senha'));
    const tokenIdx = headerLine.findIndex(h => h.trim().toLowerCase().includes('token_reset'));
    
    console.log(`[SENHAS] Indices - username=${usernameIdx}, senha=${senhaIdx}, token=${tokenIdx}`);

    if (usernameIdx === -1 || senhaIdx === -1) {
      console.error('❌ Colunas requeridas (username, senha) não encontradas na aba SENHAS');
      return null;
    }

    // Procurar o usuário nesta aba
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cells = line.split(',');
      const currentUsername = cells[usernameIdx]?.trim().replace(/^"|"$/g, '');
      
      if (currentUsername === username) {
        const senhaHash = cells[senhaIdx]?.trim().replace(/^"|"$/g, '') || '';
        const tokenResetAdmin = cells[tokenIdx]?.trim().replace(/^"|"$/g, '') || '';
        const rowIndex = i + 1; // Linha no Google Sheets (1-indexed)

        console.log(`✅ Usuário ${username} encontrado na linha ${rowIndex}`);
        console.log(`Token: ${tokenResetAdmin}, Senha: ${senhaHash ? '(hash presente)' : '(vazio)'}`);

        return {
          username,
          senhaHash,
          tokenResetAdmin,
          rowIndex
        };
      }
    }
    
    console.warn(`❌ Usuário ${username} não encontrado na aba SENHAS`);
    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

/**
 * Atualiza o hash da senha na linha específica do usuário
 * @param rowIndex - Linha no Google Sheets onde atualizar
 * @param newHash - Novo hash da senha (criptografado com bcrypt)
 * @returns true se atualizado com sucesso, false caso contrário
 */
export async function updateUserPassword(rowIndex: number, newHash: string): Promise<boolean> {
  try {
    const { google } = require('googleapis');
    
    const sheetId = process.env.GOOGLE_ACCESS_CONTROL_SHEET_ID;
    const serviceAccountBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
    
    if (!sheetId || !serviceAccountBase64) {
      console.error('Variáveis de ambiente não configuradas');
      return false;
    }

    // Decodificar Service Account
    const serviceAccountJson = JSON.parse(
      Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
    );

    // Autenticar
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountJson,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Atualizar coluna C (Senha_Hash) na linha específica
    const range = `'SENHAS'!C${rowIndex}`;
    console.log(`📝 Atualizando senha na linha ${rowIndex} (range: ${range})`);

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newHash]]
      }
    });

    if (response.status === 200) {
      console.log(`✅ Senha atualizada com sucesso na linha ${rowIndex}`);
      return true;
    } else {
      console.error('Erro ao atualizar senha:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return false;
  }
}

/**
 * Valida o token de reset contra o token armazenado na coluna D
 * @param providedToken - Token fornecido pelo usuário
 * @param storedToken - Token armazenado na planilha (coluna D)
 * @returns true se os tokens correspondem
 */
export function validateResetToken(providedToken: string, storedToken: string): boolean {
  // Validação simples: verificar correspondência exata
  return providedToken === storedToken && storedToken.length > 0;
}

/**
 * Interface legada para compatibilidade
 */
export interface AcessoUser {
  username: string;
  senhaHash: string;
  tokenResetAdmin: string;
  nmAcessoAdmin: boolean;
  nmAcessoGestor: boolean;
  rowIndex: number;
}
