/**
 * Dados mockados para testes locais
 * Use este arquivo caso não tenha configurado o Google Sheets ainda
 */

export const dadosMock = [
  {
    nm_unidade: "Unidade Alpha",
    cluster: "POS_GRADUADO",
    "Pontuação sem Bonus": "95.5",
    Onda: "1"
  },
  {
    nm_unidade: "Unidade Beta",
    cluster: "GRADUADO",
    "Pontuação sem Bonus": "87.3",
    Onda: "1"
  },
  {
    nm_unidade: "Unidade Gamma",
    cluster: "CALOURO",
    "Pontuação sem Bonus": "72.8",
    Onda: "1"
  },
  {
    nm_unidade: "Unidade Delta",
    cluster: "CALOURO_INICIANTE",
    "Pontuação sem Bonus": "68.2",
    Onda: "1"
  },
  {
    nm_unidade: "Unidade Alpha",
    cluster: "POS_GRADUADO",
    "Pontuação sem Bonus": "92.1",
    Onda: "2"
  },
  {
    nm_unidade: "Unidade Beta",
    cluster: "GRADUADO",
    "Pontuação sem Bonus": "89.5",
    Onda: "2"
  },
  {
    nm_unidade: "Unidade Gamma",
    cluster: "CALOURO",
    "Pontuação sem Bonus": "75.3",
    Onda: "2"
  },
  {
    nm_unidade: "Unidade Delta",
    cluster: "CALOURO_INICIANTE",
    "Pontuação sem Bonus": "71.0",
    Onda: "2"
  },
  {
    nm_unidade: "Unidade Epsilon",
    cluster: "GRADUADO",
    "Pontuação sem Bonus": "84.7",
    Onda: "1"
  },
  {
    nm_unidade: "Unidade Epsilon",
    cluster: "GRADUADO",
    "Pontuação sem Bonus": "86.2",
    Onda: "2"
  }
];

/**
 * Para usar os dados mockados, modifique temporariamente o hook useSheetsData
 * para retornar: { dados: dadosMock, loading: false, error: null, refetch: () => {} }
 */
