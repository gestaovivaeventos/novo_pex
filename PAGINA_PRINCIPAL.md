# 📊 Documentação - Página Principal (index.tsx)

## Visão Geral

A página principal (`index.tsx`) é um dashboard interativo que permite visualizar a pontuação de unidades/franquias filtradas por Onda.

## 🎯 Funcionalidades

### 1. **Filtros Interativos**

Dois filtros em cascata:

- **Filtro de Onda**: Seleciona qual onda visualizar (valores extraídos da Coluna V)
- **Filtro de Unidade**: Seleciona qual unidade visualizar (valores da Coluna A, filtrados pela onda selecionada)

### 2. **Gráfico de Rosca (Gauge)**

- Mostra a pontuação sem bônus (Coluna E) em formato de gauge circular
- Cores:
  - 🔵 Azul (`#0ea5e9`) - Pontuação atingida
  - ⚪ Cinza (`#e5e7eb`) - Pontuação restante até 100
- Label centralizado mostrando o valor numérico

### 3. **Card de Detalhes**

Exibe informações do item selecionado:
- Nome da Unidade
- Onda
- Pontuação sem Bônus
- Cluster (se disponível)

### 4. **Estatísticas Gerais**

Três cards mostrando:
- Total de Registros
- Ondas Disponíveis
- Unidades na Onda selecionada

## 🔧 Estrutura de Dados

### Dados Esperados do Google Sheets

A API retorna dados da aba `DEVERIA` com as seguintes colunas principais:

| Coluna | Campo | Descrição |
|--------|-------|-----------|
| A | `nm_unidade` | Nome da unidade/franquia |
| E | `Pontuação sem Bonus` | Pontuação sem bônus (0-100) |
| V | `Onda` | Número da onda |
| - | `cluster` | Cluster da unidade (opcional) |

### Exemplo de Dados

```json
[
  {
    "nm_unidade": "Unidade Alpha",
    "cluster": "POS_GRADUADO",
    "Pontuação sem Bonus": "95.5",
    "Onda": "1"
  },
  {
    "nm_unidade": "Unidade Beta",
    "cluster": "GRADUADO",
    "Pontuação sem Bonus": "87.3",
    "Onda": "1"
  }
]
```

## 🎨 Componentes Utilizados

### Importados

- `useState`, `useMemo` de `react` - Gerenciamento de estado e otimização
- `PieChart`, `Pie`, `Cell`, `ResponsiveContainer`, `Label` de `recharts` - Gráficos
- `useSheetsData` de `@/hooks/useSheetsData` - Hook customizado
- `Card`, `Header` de `@/components` - Componentes visuais

### Lógica com useMemo

```typescript
// Lista única de ondas disponíveis
const listaOndas = useMemo(() => {
  // Extrai valores únicos da coluna 'Onda'
}, [dadosBrutos]);

// Unidades filtradas pela onda selecionada
const listaUnidadesFiltradas = useMemo(() => {
  // Filtra unidades que correspondem à onda
}, [dadosBrutos, filtroOnda]);

// Item que combina ambos filtros
const itemSelecionado = useMemo(() => {
  // Encontra item com onda E unidade corretas
}, [dadosBrutos, filtroOnda, filtroUnidade]);

// Pontuação extraída e convertida para número
const pontuacao = useMemo(() => {
  // Converte string "95,5" para número 95.5
}, [itemSelecionado]);
```

## 🔄 Fluxo de Uso

1. **Carregamento**: Página carrega dados do Google Sheets via API
2. **Auto-seleção**: Automaticamente seleciona primeira onda e primeira unidade
3. **Interação**: Usuário pode mudar os filtros
4. **Atualização**: Gráfico e detalhes são atualizados instantaneamente
5. **Visualização**: Gauge mostra pontuação de forma visual e intuitiva

## 🧪 Testando com Dados Mockados

Se você ainda não configurou o Google Sheets, pode testar com dados mockados:

### 1. Importe os dados mock

```typescript
import { dadosMock } from '@/utils/dadosMock';
```

### 2. Modifique temporariamente a linha do hook

**Antes:**
```typescript
const { dados: dadosBrutos, loading, error } = useSheetsData();
```

**Depois (para testes):**
```typescript
const dadosBrutos = dadosMock;
const loading = false;
const error = null;
```

### 3. Teste localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🎨 Customização

### Alterar Cores do Gráfico

No arquivo `index.tsx`, localize:

```typescript
<Cell fill="#0ea5e9" />  {/* Score - Azul */}
<Cell fill="#e5e7eb" />  {/* Restante - Cinza */}
```

### Alterar Tamanho do Gauge

```typescript
innerRadius={60}  // Raio interno (aumentar = rosca mais fina)
outerRadius={80}  // Raio externo (aumentar = gauge maior)
```

### Alterar Ângulos

```typescript
startAngle={90}   // Começa no topo
endAngle={-270}   // Volta completa no sentido horário
```

## 📱 Responsividade

A página é totalmente responsiva:

- **Desktop**: Grid de 2 colunas para gráfico e detalhes
- **Tablet**: Grid adapta-se automaticamente
- **Mobile**: Empilha verticalmente

## 🔐 Segurança

- Dados carregados do servidor via API Route
- Nenhuma credencial exposta no cliente
- Tratamento de erros adequado

## 🚀 Performance

- `useMemo` para evitar recálculos desnecessários
- Filtros otimizados
- Renderização condicional

## ❓ Troubleshooting

### Gráfico não aparece

**Possíveis causas:**
1. Dados não carregados
2. Coluna "Pontuação sem Bonus" com nome diferente
3. Valor não numérico na pontuação

**Solução:**
Verifique o console do navegador e ajuste o nome da coluna no código se necessário.

### Filtros vazios

**Causa:** Dados não têm a coluna 'Onda' ou 'nm_unidade'

**Solução:** Verifique a estrutura da planilha Google Sheets

### Pontuação zerada

**Causa:** Nome da coluna está diferente ou valor não pode ser convertido para número

**Solução:** Ajuste a lógica de extração:

```typescript
const pontuacao = useMemo(() => {
  if (!itemSelecionado) return 0;
  
  // Tente diferentes variações do nome da coluna
  const valor = itemSelecionado['Pontuação sem Bonus'] || 
                itemSelecionado['pontuacao'] ||
                '0';
  
  return parseFloat(valor.toString().replace(',', '.')) || 0;
}, [itemSelecionado]);
```

---

**Desenvolvido para o PEX Dashboard 2026**
