# 🚀 Guia de Execução - PEX Dashboard

Este guia contém as instruções para executar o projeto pela primeira vez.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** v18 ou superior
- **npm** v9 ou superior
- **Git** para controle de versão

## 🔧 Instalação

### 1. Navegue até a pasta do projeto

```powershell
cd "C:\Users\gabrielbraz\Desktop\REP NOVO PEX\novo_pex"
```

### 2. Instale todas as dependências

```powershell
npm install
```

Isso instalará:
- Next.js 14
- React 18
- TypeScript 5.3
- Tailwind CSS
- Firebase & Firebase Admin
- Google APIs
- Recharts (gráficos)
- E todas as outras dependências

### 3. Configure as Variáveis de Ambiente

1. **Copie o arquivo de exemplo:**
   ```powershell
   Copy-Item .env.example .env.local
   ```

2. **Abra o arquivo `.env.local` e preencha as variáveis:**
   
   Consulte o **Cofre Central de Credenciais** para obter os valores corretos.

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=sua_key_aqui
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
   
   # Google Sheets API
   GOOGLE_SHEET_ID=id_da_planilha
   GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@projeto.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_BASE64=base64_do_json
   ```

3. **Para configurar o Google Sheets**, siga o guia em [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)

## ▶️ Executar o Projeto

### Modo Desenvolvimento

```powershell
npm run dev
```

Acesse: **http://localhost:3000**

O servidor irá:
- ✅ Iniciar em modo de desenvolvimento
- ✅ Hot reload (recarrega automaticamente ao salvar arquivos)
- ✅ Mostrar erros detalhados no navegador

### Build de Produção

```powershell
# Criar build otimizado
npm run build

# Executar build em produção
npm start
```

## 📱 Estrutura de Páginas

- **/** (index) → Redireciona para `/dashboard`
- **/dashboard** → Página principal com:
  - Visão geral (total de franquias, metas, clusters)
  - Gráfico de distribuição por cluster (Pizza)
  - Ranking mockado das franquias
- **/api/sheets** → Endpoint para buscar dados do Google Sheets

## 🧪 Testar a API do Google Sheets

### Via navegador:
```
http://localhost:3000/api/sheets
```

### Via PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/sheets" | Select-Object -ExpandProperty Content
```

### Via curl (se instalado):
```bash
curl http://localhost:3000/api/sheets
```

**Resposta esperada:**
```json
{
  "franquias": [
    ["ID", "Nome", "Cluster", "..."],
    ["1", "Franquia A", "GRADUADO", "..."]
  ],
  "metas": [
    ["Cluster", "Indicador", "Meta"],
    ["GRADUADO", "VVR", "500000"]
  ]
}
```

## ❗ Solução de Problemas Comuns

### Erro: "Cannot find module"

**Solução:**
```powershell
# Limpe o cache e reinstale
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Erro: "Port 3000 is already in use"

**Solução 1 - Usar outra porta:**
```powershell
$env:PORT=3001; npm run dev
```

**Solução 2 - Matar o processo:**
```powershell
# Encontrar o processo
netstat -ano | findstr :3000

# Matar o processo (substitua PID)
taskkill /PID <numero_do_pid> /F
```

### Erro: TypeScript/Lint errors

Os erros de TypeScript mostrados antes da instalação das dependências são normais. Execute:

```powershell
npm install
```

Se os erros persistirem após instalação:

```powershell
# Limpe o cache do TypeScript
Remove-Item -Recurse -Force .next
npm run dev
```

### Erro: "Google Sheets API - The caller does not have permission"

**Solução:**
1. Verifique se compartilhou a planilha com o email da Service Account
2. Confirme que o ID da planilha no `.env.local` está correto
3. Verifique se o Service Account Base64 está completo

### Erro: "process is not defined"

**Solução:**
1. Confirme que o arquivo `.env.local` existe na raiz do projeto
2. Reinicie o servidor de desenvolvimento:
   ```powershell
   # Pressione Ctrl+C para parar
   npm run dev
   ```

## 📊 Estrutura de Dados do Google Sheets

### Aba: `Dados_Franquias`

Colunas mínimas esperadas:
- **ID**: Identificador único
- **Nome**: Nome da franquia
- **Cluster**: CALOURO_INICIANTE, CALOURO, GRADUADO, POS_GRADUADO

### Aba: `Metas_Clusters`

Colunas mínimas esperadas:
- **Cluster**: Nome do cluster
- **Indicador**: Nome do indicador (VVR, MAC, etc)
- **Meta**: Valor da meta

## 🔒 Segurança - Checklist

Antes de commitar no Git, verifique:

- [ ] `.env.local` está no `.gitignore`
- [ ] Nenhuma credencial está hardcoded no código
- [ ] `.env.example` está atualizado (sem valores reais)
- [ ] Service Account JSON não está no repositório

## 📚 Recursos Adicionais

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação React](https://react.dev)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação Recharts](https://recharts.org)
- [Configuração Google Sheets](./GOOGLE_SHEETS_SETUP.md)

## 🆘 Suporte

Para dúvidas ou problemas:
1. Consulte este guia
2. Verifique o README.md principal
3. Contacte a equipe de desenvolvimento

---

**Última atualização:** Novembro 2025
