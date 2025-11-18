### Sistema de Permissões PEX

#### Visão Geral
O sistema implementa controle de acesso baseado em dois níveis:

- **Nível 0 - Franqueado**: Acesso restrito aos dados da sua unidade/franquia
- **Nível 1 - Franqueadora**: Acesso a todas as unidades

#### Estrutura da Planilha

A coluna **L** (`nvl_acesso_unidade`) na planilha de controle de acessos deve conter:
- `0` para franqueados
- `1` para franqueadora

Colunas obrigatórias:
- **Coluna C**: `nm_unidade` (nome da unidade/franquia)
- **Coluna D**: Nome completo do usuário
- **Coluna E**: Username (único identificador)
- **Coluna L**: `nvl_acesso_unidade` (0 ou 1)

### Implementação Técnica

##### 1. Tipos de Permissão (`src/types/permissions.types.ts`)

```typescript
export type AccessLevel = 0 | 1;

export interface UserPermissions {
  username: string;
  firstName: string;
  accessLevel: AccessLevel;
  unitName?: string; // Preenchido apenas para franqueados
}

export interface PermissionContext {
  user: UserPermissions;
  isFranchisee: boolean;  // accessLevel === 0
  isFranchiser: boolean;  // accessLevel === 1
  canViewAllUnits: boolean; // accessLevel === 1
}
```

##### 2. Hook de Permissões (`src/utils/auth.tsx`)

```typescript
export function usePermissions(): PermissionContext | null {
  const { user, isLoading } = useAuth();
  // Retorna contexto com informações de permissão do usuário
}
```

##### 3. HOCs de Proteção de Rota (`src/utils/auth.tsx`)

**`withAuth`** - Proteção básica (requer autenticação)
- Redireciona para `/login` se não autenticado
- Acessível por: Qualquer usuário autenticado

**`withAuthAndFranchiser`** - Proteção restrita (apenas Franqueadora)
- Redireciona para `/login` se não autenticado
- Redireciona para `/resultados` se Franqueado (accessLevel = 0)
- Acessível por: Apenas Franqueadora (accessLevel = 1)
- Usado em: `/parametros`

```typescript
export function withAuthAndFranchiser(Component: React.ComponentType<any>) {
  // Verifica accessLevel === 1
  // Redireciona franqueados (0) para /resultados
}
```

```typescript
// Filtra dados baseado na permissão do usuário
export function filterDataByPermission<T extends { nm_unidade?: string }>(
  data: T[],
  permissions: UserPermissions
): T[]

// Retorna unidades disponíveis para o usuário
export function getAvailableUnits(
  allUnits: string[],
  permissions: UserPermissions
): string[]

// Verifica se usuário tem acesso a uma unidade específica
export function hasAccessToUnit(
  unitName: string,
  permissions: UserPermissions
): boolean
```

##### 4. Endpoint de Login (`src/pages/api/auth/login.ts`)

Agora retorna as permissões:

```typescript
interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    username: string;
    firstName: string;
    accessLevel: 0 | 1;
    unitName?: string;
  };
}
```

#### Uso em Componentes

##### Exemplo 1: Usando `usePermissions()` em um Componente

```typescript
import { usePermissions } from '@/utils/auth';

export function MeuComponente() {
  const permissions = usePermissions();

  if (!permissions) {
    return <div>Carregando...</div>;
  }

  const { user, isFranchisee, canViewAllUnits } = permissions;

  return (
    <div>
      {isFranchisee && (
        <p>Você pode ver apenas dados de {user.unitName}</p>
      )}
      {canViewAllUnits && (
        <p>Você pode ver dados de todas as unidades</p>
      )}
    </div>
  );
}
```

##### Exemplo 2: Filtrando Dados em `useMemo`

```typescript
import { usePermissions } from '@/utils/auth';
import { filterDataByPermission } from '@/utils/permissoes';

function meuComponente() {
  const { dados: dadosBrutos } = useSheetsData();
  const permissions = usePermissions();

  const dadosFiltrados = useMemo(() => {
    if (!dadosBrutos || !permissions) return [];
    
    // Filtra automaticamente: franqueados veem só sua unidade
    return filterDataByPermission(dadosBrutos, permissions.user);
  }, [dadosBrutos, permissions]);

  return <div>{/* Usar dadosFiltrados */}</div>;
}
```

##### Exemplo 3: Verificar Acesso a Recurso Específico

```typescript
import { hasAccessToUnit } from '@/utils/permissoes';

function acessarUnidade(unitName: string, permissions: UserPermissions) {
  if (hasAccessToUnit(unitName, permissions)) {
    // Permitir acesso
  } else {
    // Negar acesso
  }
}
```

#### Páginas com Permissões Implementadas

As seguintes páginas já têm filtro de permissões aplicado:

1. **`/resultados`** - Dashboard de resultados
   - Filtra quarters, clusters, consultores por permissão
   - Calcula rankings apenas com dados acessíveis
   - Acessível para: Franqueado (0) e Franqueadora (1)

2. **`/ranking`** - Página de rankings
   - Mostra apenas rankings de unidades acessíveis ao usuário
   - Acessível para: Franqueado (0) e Franqueadora (1)

3. **`/dashboard`** - Protegido com withAuth
   - Acessível para: Franqueado (0) e Franqueadora (1)

4. **`/parametros`** - Gerenciamento de Parâmetros
   - ⛔ **ACESSO RESTRITO APENAS PARA FRANQUEADORA**
   - Acessível para: Franqueadora (1) APENAS
   - Franqueado (0) é automaticamente redirecionado para `/resultados`

#### Fluxo de Autenticação Atualizado

1. Usuário entra em `/login`
2. Submete username
3. API valida contra Google Sheets, extrai:
   - `accessLevel` (coluna L)
   - `unitName` (coluna C, apenas se franqueado)
   - `firstName` (coluna D)
4. Token armazenado com todas as informações
5. localStorage recebe:
   - `auth_token`
   - `username`
   - `firstName`
   - `accessLevel`
   - `unitName` (se franqueado)

#### Exemplo de Dados no localStorage

**Franqueadora (accessLevel=1):**
```javascript
localStorage.getItem('accessLevel')  // "1"
localStorage.getItem('unitName')     // null/undefined
```

**Franqueado (accessLevel=0):**
```javascript
localStorage.getItem('accessLevel')  // "0"
localStorage.getItem('unitName')     // "Unidade Alpha"
```

#### Boas Práticas

1. **Sempre filtrar no servidor quando possível** - Reduz dados transferidos
2. **Use `usePermissions()` para verificações condiccionais** - Melhor legibilidade
3. **Aplicar `filterDataByPermission()` nos useMemos** - Garante reatividade
4. **Validar permissões no backend** - Nunca confie só no frontend

#### Segurança

- ✅ Validação exata de username (case-sensitive)
- ✅ Dados de permissão inclusos no token
- ✅ Todas as páginas protegidas com `withAuth`
- ✅ Dados filtrados em todos os useMemos
- ✅ Token verificado em cada carregamento de página
