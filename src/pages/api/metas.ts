import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('=== API METAS - Método:', req.method, '===');
    
    // Validar variáveis de ambiente
    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_BASE64) {
      console.error('Variáveis de ambiente faltando!');
      console.error('GOOGLE_SHEET_ID:', !!GOOGLE_SHEET_ID);
      console.error('GOOGLE_SERVICE_ACCOUNT_EMAIL:', !!GOOGLE_SERVICE_ACCOUNT_EMAIL);
      console.error('GOOGLE_SERVICE_ACCOUNT_BASE64:', !!GOOGLE_SERVICE_ACCOUNT_BASE64);
      
      return res.status(500).json({
        error: 'Configuração incompleta',
        message: 'Variáveis de ambiente do Google não configuradas',
      });
    }

    // Decodificar as credenciais do Base64
    const credentialsJson = Buffer.from(GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
    const credentials = JSON.parse(credentialsJson);

    // Autenticação
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // GET - Buscar dados de metas
    if (req.method === 'GET') {
      console.log('=== INICIANDO BUSCA DE METAS POR CLUSTER ===');
      console.log('GOOGLE_SHEET_ID:', GOOGLE_SHEET_ID);
      console.log('Range solicitado: METAS POR CLUSTER!A:H');

      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_SHEET_ID,
          range: 'METAS POR CLUSTER!A:H',
        });

        const rows = response.data.values || [];
        console.log('Total de linhas recebidas:', rows.length);
        console.log('Primeira linha (headers):', rows[0]);
        console.log('Segunda linha (primeiro dado):', rows[1]);

        return res.status(200).json(rows);
      } catch (sheetError: any) {
        console.error('Erro ao buscar aba METAS POR CLUSTER:', sheetError.message);
        
        // Tentar range alternativo sem espaços
        console.log('Tentando range alternativo...');
        try {
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'METASPORCLUSTER!A:H',
          });
          
          const rows = response.data.values || [];
          console.log('Range alternativo funcionou! Linhas:', rows.length);
          return res.status(200).json(rows);
        } catch (altError: any) {
          console.error('Range alternativo também falhou:', altError.message);
          throw sheetError; // Lança o erro original
        }
      }
    }

    // POST - Atualizar meta
    if (req.method === 'POST') {
      const { cluster, coluna, valor } = req.body;

      console.log('Recebido POST para atualizar meta:', { cluster, coluna, valor });

      if (!cluster || !coluna || valor === undefined) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'cluster, coluna e valor são obrigatórios',
        });
      }

      // Buscar todos os dados
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: 'METAS POR CLUSTER!A:H',
      });

      const rows = response.data.values || [];
      
      if (rows.length === 0) {
        return res.status(404).json({
          error: 'Planilha vazia',
          message: 'A planilha METAS POR CLUSTER está vazia',
        });
      }

      // Encontrar a linha do cluster (coluna A)
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === cluster) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === -1) {
        return res.status(404).json({
          error: 'Cluster não encontrado',
          message: `O cluster "${cluster}" não foi encontrado na planilha`,
        });
      }

      // Mapeamento de colunas
      // VVR=B, % ATIGIMENTO MAC=C, % ENDIVIDAMENTO=D, NPS=E, % MC ENTREGA=F, E-NPS=G, CONFORMIDADE=H
      const colunaMap: Record<string, string> = {
        'VVR': 'B',
        '% ATIGIMENTO MAC': 'C',
        '% ENDIVIDAMENTO': 'D',
        'NPS': 'E',
        '% MC ENTREGA': 'F',
        'E-NPS': 'G',
        'CONFORMIDADE': 'H'
      };

      const columnLetter = colunaMap[coluna];
      
      if (!columnLetter) {
        return res.status(400).json({
          error: 'Coluna inválida',
          message: `A coluna "${coluna}" não é válida`,
        });
      }

      const sheetRowNumber = rowIndex + 1;
      const updateRange = `METAS POR CLUSTER!${columnLetter}${sheetRowNumber}`;

      console.log('Atualizando range:', updateRange);
      console.log('Novo valor (recebido):', valor);

      // Formatar valor baseado no tipo de coluna
      let valorFormatado: string;
      
      if (coluna === 'VVR') {
        // Formatar como moeda: R$ 1.000.000,00
        const numero = parseFloat(String(valor).replace(',', '.'));
        
        // Separar parte inteira e decimal
        const valorFixo = numero.toFixed(2); // Garante 2 casas decimais
        const [parteInteira, parteDecimal] = valorFixo.split('.');
        
        // Adicionar pontos de milhar
        const parteInteiraFormatada = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        valorFormatado = `R$ ${parteInteiraFormatada},${parteDecimal}`;
      } else if (coluna.includes('%')) {
        // Formatar como percentual: 60,00%
        const numero = parseFloat(String(valor).replace(',', '.'));
        const valorFixo = numero.toFixed(2); // Garante 2 casas decimais
        const valorComVirgula = valorFixo.replace('.', ',');
        valorFormatado = `${valorComVirgula}%`;
      } else {
        // NPS e E-NPS: apenas número inteiro
        const numero = parseFloat(String(valor).replace(',', '.'));
        valorFormatado = String(Math.round(numero));
      }

      console.log('Valor formatado para salvar:', valorFormatado);

      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: updateRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[valorFormatado]],
        },
      });

      console.log('Atualização concluída com sucesso');

      return res.status(200).json({
        success: true,
        message: `Meta atualizada com sucesso para ${cluster} na coluna ${coluna}`,
      });
    }

    // Método não permitido
    return res.status(405).json({
      error: 'Método não permitido',
      message: 'Apenas GET e POST são permitidos',
    });

  } catch (error: any) {
    console.error('=== ERRO NA API DE METAS ===');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Erros específicos do Google API
    if (error.code) {
      console.error('Código do erro Google:', error.code);
      console.error('Detalhes:', error.errors);
    }

    return res.status(500).json({
      error: 'Erro ao processar requisição',
      message: error.message || 'Ocorreu um erro ao processar a requisição',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
