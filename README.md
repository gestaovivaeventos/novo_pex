# PEX Dashboard 2026

> Dashboard para gestão do Programa de Excelência (PEX) da rede de franquias - Ciclo 2026

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação e Execução](#instalação-e-execução)
- [Configuração](#configuração)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Segurança](#segurança)
- [Troubleshooting](#troubleshooting)
- [Contribuidores / Suporte](#contribuidores--suporte)

## 🎯 Visão Geral

O **PEX Dashboard 2026** é uma plataforma web desenvolvida para gerenciar e acompanhar o Programa de Excelência da rede de franquias. O sistema permite monitorar a performance das franquias através de indicadores-chave, clusterização por momento de maturidade, e acompanhamento de ondas trimestrais.

Este projeto resolve o problema de acompanhamento descentralizado e manual da performance das franquias, oferecendo uma visão unificada, automatizada e em tempo real do desempenho de cada unidade em relação às suas metas.

### 📊 Sobre o Programa PEX

O PEX é um programa anual (de conviva a conviva) que visa reconhecer e premiar a excelência na gestão das franquias através de:

- **Clusterização**: Classificação das franquias em 4 clusters (Calouro Iniciante, Calouro, Graduado, Pós Graduado)
- **Indicadores-Chave**: 7 indicadores principais (VVR, MAC, Endividamento, NPS, MC%, E-NPS, Conformidades)
- **Ondas**: 4 ondas trimestrais com pesos variáveis por indicador
- **Bonificações**: Sistema de bônus por ações extras (até 3 por onda)
- **Ranking**: Competição dentro de cada cluster

**Principais características:**

- ✅ Sistema de autenticação seguro com Firebase
- ✅ Dashboard interativo com visualização de indicadores em tempo real
- ✅ Cálculo automático de pontuações por onda e ranking geral
- ✅ Gestão de clusters e metas personalizadas
- ✅ Sistema de bonificações e reconhecimento
- ✅ Exportação de relatórios e histórico de performance

## ✨ Funcionalidades

### 1. Gestão de Clusters

- Categorização automática de franquias em 4 clusters baseado em VVR dos últimos 12 meses
- Definição de metas específicas por cluster para cada indicador
- Visualização de distribuição de franquias por cluster

### 2. Monitoramento de Indicadores

- **VVR (Valor de Vendas Realizadas)**: Soma dos últimos 12 meses vs meta
- **MAC (Meta de Ativação de Clientes)**: Média de atingimento mensal
- **Endividamento**: Controle de saúde financeira
- **NPS**: Satisfação de clientes
- **MC%**: Margem de contribuição percentual
- **E-NPS**: Satisfação de colaboradores
- **Conformidades**: Média de 4 sub-indicadores (Pipefy, Financeira, Estrutura, Reclame Aqui)

### 3. Sistema de Ondas

- Configuração de 4 ondas por ciclo anual
- Distribuição de pesos (0-5) por indicador em cada onda
- Soma total de pesos sempre igual a 10
- Acompanhamento de performance por onda

### 4. Bonificações

- Registro de ações extras realizadas pelas franquias
- Pontos bônus (0,5 ou 1 ponto) por ação
- Limite de 3 bonificações por franquia por onda
- Histórico de bonificações recebidas

### 5. Ranking e Resultados

- Cálculo automático de pontuação final (média das ondas)
- Ranking dentro de cada cluster
- Visualização de evolução ao longo das ondas
- Exportação de relatórios detalhados

## 🛠 Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript 5.3
- **Estilização**: Tailwind CSS 3.3, PostCSS
- **Backend**: Next.js API Routes, Firebase Admin
- **Banco de Dados**: Firebase Firestore (Conta Principal Corporativa)
- **Autenticação**: Firebase Authentication
- **Integração**: Google Sheets API (googleapis)
- **Analytics**: Google Analytics 4
- **Hospedagem**: Vercel
- **Ferramentas**: Git, npm, ESLint

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js v18 ou superior
- npm v9 ou superior
- Acesso ao repositório GitHub da organização
- Credenciais do Firebase (consultar Cofre Central de Credenciais)

### Passos

1. **Clone o repositório**
   ```bash
   git clone https://github.com/gestaovivaeventos/novo_pex.git
   cd novo_pex
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   - Copie o arquivo `.env.example` para `.env`
   - Consulte o Cofre Central de Credenciais para obter as chaves
   - Preencha todas as variáveis necessárias

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   - Abra seu navegador em `http://localhost:3000`

### Build para Produção

```bash
npm run build
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis. Para uma lista completa, consulte `.env.example`.

```env
# Firebase Configuration (Conta Principal)
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Firebase Admin (Backend)
FIREBASE_ADMIN_PROJECT_ID=project_id
FIREBASE_ADMIN_CLIENT_EMAIL=service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=private_key

# Google Sheets API (Backend)
GOOGLE_SHEET_ID=id_da_planilha
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@projeto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_BASE64=base64_encoded_json

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=GA_ID

# Environment
NODE_ENV=production
```

**⚠️ Importante**: 
- **NUNCA** commit o arquivo `.env` no Git
- Todas as credenciais devem ser obtidas do **Cofre Central de Credenciais**
- Chaves sensíveis (Admin) devem ser acessadas apenas no servidor (não no cliente)
- O arquivo `.env.example` deve ser mantido atualizado sem valores reais

### Configuração do Google Sheets

Para configurar a integração com Google Sheets, consulte o guia completo em [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md).

**Resumo:**
1. Criar Service Account no Google Cloud Platform
2. Ativar Google Sheets API
3. Compartilhar planilha com o e-mail da Service Account
4. Codificar o JSON da Service Account em Base64
5. Configurar as 3 variáveis de ambiente

## 📁 Estrutura do Projeto

```
novo_pex/
├── public/                    # Arquivos estáticos
│   └── index.html            # HTML principal
├── src/
│   ├── components/           # Componentes React reutilizáveis
│   │   ├── Card.tsx         # Card genérico
│   │   ├── Header.tsx       # Cabeçalho da aplicação
│   │   ├── ClusterBadge.tsx # Badge de cluster
│   │   ├── IndicadorCard.tsx # Card de indicador
│   │   ├── TabelaRanking.tsx # Tabela de ranking
│   │   └── ResumoOnda.tsx   # Resumo de onda
│   ├── pages/               # Páginas Next.js
│   │   └── api/            # API Routes
│   │       └── sheets.ts   # Handler Google Sheets API
│   ├── hooks/              # React Hooks customizados
│   │   └── useSheetsData.ts # Hook para buscar dados do Sheets
│   ├── styles/             # Estilos globais
│   │   └── globals.css     # CSS global com Tailwind
│   ├── utils/              # Funções utilitárias
│   │   ├── calculosPex.ts  # Cálculos dos indicadores PEX
│   │   ├── formatacao.ts   # Formatação de dados
│   │   └── validacao.ts    # Validações
│   ├── config/             # Configurações
│   │   ├── firebase.ts     # Configuração Firebase
│   │   └── app.config.ts   # Configurações da aplicação
│   └── types/              # TypeScript types
│       └── pex.types.ts    # Tipos do PEX
├── .env                    # Variáveis de ambiente (NÃO COMMITAR)
├── .env.example            # Template de variáveis
├── .gitignore              # Arquivos ignorados pelo Git
├── GOOGLE_SHEETS_SETUP.md  # Guia de configuração Google Sheets
├── package.json            # Dependências
├── tsconfig.json           # Configuração TypeScript
├── next.config.js          # Configuração Next.js
├── tailwind.config.js      # Configuração Tailwind
├── postcss.config.js       # Configuração PostCSS
├── vercel.json             # Configuração Vercel
└── README.md               # Este arquivo
```

## 🔐 Segurança

### Autenticação
- Sistema de login com e-mail/senha utilizando Firebase Authentication
- Senhas armazenadas com hash seguro gerenciado pelo Firebase
- Tokens de autenticação renovados automaticamente

### Chaves de API
- Todas as credenciais são gerenciadas via **variáveis de ambiente**
- Chaves sensíveis (Firebase Admin) acessadas apenas no backend
- Frontend utiliza apenas chaves públicas seguras (NEXT_PUBLIC_*)
- Nenhuma chave exposta diretamente no código (hardcode)

### Banco de Dados
- **Conta Principal Corporativa** do Firebase gerenciada pelo Comitê
- Regras de Segurança do Firestore aplicadas para controle de acesso
- Acesso aos dados restrito por autenticação e autorização

### Conformidade com Diretrizes
Este projeto foi desenvolvido seguindo rigorosamente o **Documento de Diretrizes e Boas Práticas para o Desenvolvimento de Ferramentas de IA**:
- ✅ Código modular e reutilizável (princípio DRY)
- ✅ Separação de responsabilidades
- ✅ Comentários explicando "o porquê"
- ✅ Variáveis de ambiente para credenciais
- ✅ GitFlow com branches e code review
- ✅ Conventional Commits

## 🐛 Troubleshooting

### Erro: "Cannot find module 'firebase/app'"
**Solução**: Certifique-se de ter instalado todas as dependências:
```bash
npm install
```

### Erro: "process is not defined"
**Solução**: Este erro ocorre quando variáveis de ambiente não estão configuradas. Verifique:
1. Arquivo `.env` existe na raiz do projeto
2. Todas as variáveis estão preenchidas
3. Reinicie o servidor de desenvolvimento após criar/editar o `.env`

### Página não carrega ou erro 404
**Solução**: 
- Limpe o cache do Next.js: `rm -rf .next`
- Execute `npm run dev` novamente

### Erro de autenticação Firebase
**Solução**:
- Verifique se as credenciais no `.env` estão corretas
- Confirme que está usando a conta principal corporativa
- Consulte o Cofre Central de Credenciais para chaves atualizadas

### Erros de TypeScript/Lint
**Solução**: Os erros mostrados são esperados antes da instalação das dependências. Execute `npm install` para resolvê-los.

## 👥 Contribuidores / Suporte

**Desenvolvedor Principal**: Gabriel Braz  
**Equipe**: Gestão Viva Eventos  
**Organização**: gestaovivaeventos

### Suporte
- Para dúvidas técnicas, consulte a documentação no Drive do projeto
- Para acesso a credenciais, contacte o Comitê
- Para reportar bugs ou sugerir melhorias, abra uma issue no GitHub

### Processo de Contribuição

1. **Nunca edite a branch main diretamente**
2. Crie uma branch para sua feature: `git checkout -b feat/nova-funcionalidade`
3. Faça commits seguindo Conventional Commits:
   - `feat:` para novas funcionalidades
   - `fix:` para correções de bugs
   - `docs:` para documentação
   - `refactor:` para refatorações
4. Solicite code review antes do merge
5. Abra um Pull Request para a main

---

**Versão**: 1.0.0  
**Última Atualização**: Novembro 2025  
**Licença**: Proprietário - Gestão Viva Eventos