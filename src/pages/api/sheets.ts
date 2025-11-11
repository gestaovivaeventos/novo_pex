/**
 * API Handler para buscar dados do Google Sheets
 * Busca dados das abas de Franquias e Metas dos Clusters
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

interface SheetsData {
  franquias: any[][];
  metas: any[][];
}

interface ErrorResponse {
  error: string;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SheetsData | ErrorResponse>
) {
  try {
    // 1. Ler variáveis de ambiente do servidor
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

    // Validar que as variáveis existem
    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_BASE64) {
      console.error('Variáveis de ambiente não configuradas');
      return res.status(500).json({
        error: 'Configuração incompleta',
        message: 'Variáveis de ambiente do Google Sheets não configuradas corretamente',
      });
    }

    // 2. Decodificar a string Base64 de volta para objeto JSON
    const serviceAccountBuffer = Buffer.from(GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64');
    const serviceAccount = JSON.parse(serviceAccountBuffer.toString('utf-8'));

    // Extrair client_email e private_key
    const { client_email, private_key } = serviceAccount;

    if (!client_email || !private_key) {
      console.error('Service Account JSON inválido');
      return res.status(500).json({
        error: 'Configuração inválida',
        message: 'Service Account não contém client_email ou private_key',
      });
    }

    // 3. Autenticar usando JWT
    const auth = new google.auth.JWT(
      client_email,
      undefined,
      private_key,
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    // 4. Inicializar o cliente do Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });

    // 5. Buscar dados de múltiplas abas usando batchGet
    const ranges = [
      'Dados_Franquias!A:Z',
      'Metas_Clusters!A:Z'
    ];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: GOOGLE_SHEET_ID,
      ranges: ranges,
    });

    // 6. Extrair os dados das respostas
    const valueRanges = response.data.valueRanges;

    if (!valueRanges || valueRanges.length < 2) {
      console.error('Dados não encontrados nas abas especificadas');
      return res.status(500).json({
        error: 'Dados não encontrados',
        message: 'Não foi possível encontrar dados nas abas especificadas',
      });
    }

    // Dados da aba 'Dados_Franquias!A:Z'
    const dadosFranquias = valueRanges[0].values || [];
    
    // Dados da aba 'Metas_Clusters!A:Z'
    const dadosMetas = valueRanges[1].values || [];

    // 7. Retornar os dados em formato JSON
    return res.status(200).json({
      franquias: dadosFranquias,
      metas: dadosMetas,
    });

  } catch (error: any) {
    // Logar erro detalhado no console do servidor
    console.error('Erro ao buscar dados do Google Sheets:', error);
    console.error('Stack trace:', error.stack);

    // Retornar erro genérico ao cliente (sem expor detalhes internos)
    return res.status(500).json({
      error: 'Erro ao buscar dados',
      message: error.message || 'Ocorreu um erro ao tentar buscar os dados do Google Sheets',
    });
  }
}
