# Guia de Migração RBAC - Removendo MembershipRole Enum

## 📋 Visão Geral

Este guia explica como migrar de `MembershipRole` (ADMIN/MEMBER) para um sistema completo de RBAC com roles customizados.

## 🎯 O Que Mudou

### Antes
- `MembershipRole` enum com valores ADMIN e MEMBER
- Permissões baseadas em enum fixo
- Sem flexibilidade para criar roles customizados

### Depois
- Sistema RBAC completo com tabela `Role`
- Roles customizados por organização
- Permissões mínimas obrigatórias para todos os membros
- Roles padrão: Admin, Member, Editor, Viewer

## 🔧 Passos de Migração

### 1. Backup do Banco de Dados

```bash
# PostgreSQL
pg_dump -U your_user -d your_database > backup_before_rbac.sql
```

### 2. Gerar Cliente Prisma

```bash
npx prisma generate
```

### 3. Criar e Aplicar Migration

```bash
npx prisma migrate dev --name remove_membership_role_add_rbac
```

Esta migration irá:
- Remover o campo `membershipRole` da tabela `Membership`
- Remover o enum `MembershipRole`
- Manter o campo `roleId` (já existente)

### 4. Executar Seed dos Roles Padrão

```bash
npx tsx prisma/seed-roles.ts
```

Este script irá:
- ✅ Criar 4 roles padrão em cada organização:
  - **Admin**: Acesso total (todas as permissões)
  - **Member**: Acesso básico (ler e criar tickets/comentários)
  - **Editor**: Criar e editar conteúdo
  - **Viewer**: Somente leitura
- ✅ Atribuir role "Member" para membros sem role

### 5. Migrar Dados Manualmente (Se Necessário)

Se você tinha lógica específica baseada em ADMIN/MEMBER, execute:

```sql
-- Criar role Admin para organizações (se ainda não existe)
-- Atribuir role Admin aos antigos ADMINs
-- Você pode fazer isso via script ou manualmente

-- Exemplo de query para identificar quem era admin:
-- SELECT * FROM "Membership" WHERE "membershipRole" = 'ADMIN';
```

## 📊 Estrutura dos Roles Padrão

### Admin Role
**Permissões**: Todas (15 permissões)
- Gerenciar tickets (criar, ler, editar, deletar, mudar status)
- Gerenciar comentários (criar, ler, editar, deletar)
- Gerenciar organização (editar, deletar, gerenciar membros)
- Gerenciar membros (convidar, remover, atualizar roles/permissões)

### Member Role (Padrão)
**Permissões Mínimas Obrigatórias**:
- ✅ `ticket:read` - Ver tickets
- ✅ `ticket:create` - Criar tickets
- ✅ `comment:read` - Ver comentários
- ✅ `comment:create` - Criar comentários

> **Nota**: Todo membro DEVE ter pelo menos `ticket:read` e `comment:read` para usar o app.

### Editor Role
**Permissões**:
- Criar, ler e editar tickets
- Mudar status de tickets
- Criar, ler e editar comentários

### Viewer Role
**Permissões**:
- Apenas leitura de tickets e comentários

## 🔐 Sistema de Permissões

### Hierarquia de Permissões
1. **Permissões Diretas** - Maior prioridade (definidas por membro)
2. **Permissões do Role** - Herdadas do role atribuído
3. **Permissões Mínimas** - Sempre aplicadas: `ticket:read`, `comment:read`

### Verificação de Permissões

```typescript
// Antes (com MembershipRole)
if (membership.membershipRole === "ADMIN") {
  // fazer algo
}

// Depois (com RBAC)
import { hasPermission } from "@/features/permission/utils/has-permission";
import { PERMISSIONS } from "@/features/permission/constants";

const canManage = await hasPermission(
  userId,
  organizationId,
  PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS
);

if (canManage) {
  // fazer algo
}
```

## 🎨 Componentes Atualizados

### MembershipList
- ❌ Removido `MembershipRoleButton`
- ✅ Mostra nome do role customizado
- ✅ Botão "Manage" para gerenciar permissões

### Member Permissions Page
- ✅ Seleção de role via dropdown
- ✅ Toggle de permissões diretas
- ✅ Mostra permissões herdadas do role

### Roles Page (Nova)
- ✅ Lista todos os roles da organização
- ✅ Criar novos roles
- ✅ Editar permissões dos roles
- ✅ Deletar roles

## 📝 Tarefas Pós-Migração

### 1. Verificar Roles Criados
```bash
# No psql ou client PostgreSQL
SELECT o.name as org_name, r.name as role_name, COUNT(m.userId) as members
FROM "Organization" o
LEFT JOIN "Role" r ON r."organizationId" = o.id
LEFT JOIN "Membership" m ON m."roleId" = r.id
GROUP BY o.name, r.name
ORDER BY o.name, r.name;
```

### 2. Verificar Membros Sem Role
```bash
SELECT o.name, u.username, m."joinedAt"
FROM "Membership" m
JOIN "Organization" o ON m."organizationId" = o.id
JOIN "User" u ON m."userId" = u.id
WHERE m."roleId" IS NULL;
```

Se houver membros sem role, atribua manualmente:
```sql
-- Atribuir role "Member" para todos sem role
UPDATE "Membership" m
SET "roleId" = (
  SELECT r.id FROM "Role" r 
  WHERE r."organizationId" = m."organizationId" 
  AND r.name = 'Member'
)
WHERE m."roleId" IS NULL;
```

### 3. Atualizar Código Legado

Procure e substitua todas as referências:

```bash
# Encontrar código que usa membershipRole
grep -r "membershipRole" src/

# Encontrar verificações de ADMIN
grep -r "ADMIN" src/ | grep -v "DEFAULT_ROLES"

# Encontrar verificações de MEMBER
grep -r "MEMBER" src/ | grep -v "DEFAULT_ROLES"
```

### 4. Testar Funcionalidades

- [ ] Login e navegação básica
- [ ] Criar ticket
- [ ] Ver tickets
- [ ] Editar ticket (se tiver permissão)
- [ ] Deletar ticket (se tiver permissão)
- [ ] Gerenciar membros (se tiver permissão)
- [ ] Criar role customizado
- [ ] Atribuir role a membro
- [ ] Modificar permissões diretas

## 🚨 Troubleshooting

### Erro: "Cannot read property 'membershipRole' of undefined"
**Solução**: Código ainda usa `membershipRole`. Substituir por verificação de permissão.

### Erro: "Role not found for organization"
**Solução**: Executar seed novamente: `npx tsx prisma/seed-roles.ts`

### Membros sem acesso
**Solução**: Verificar se possuem role ou permissões mínimas.

```typescript
// Verificar permissões de um usuário
const permissions = await getUserPermissions(userId, organizationId);
console.log("User permissions:", permissions);
```

### Ninguém consegue gerenciar membros
**Solução**: Atribuir role "Admin" para pelo menos um membro:

```sql
-- Via SQL
UPDATE "Membership" m
SET "roleId" = (
  SELECT r.id FROM "Role" r 
  WHERE r."organizationId" = m."organizationId" 
  AND r.name = 'Admin'
  LIMIT 1
)
WHERE m."userId" = 'USER_ID_AQUI' 
AND m."organizationId" = 'ORG_ID_AQUI';
```

## 📚 Recursos Adicionais

- [PERMISSION_SYSTEM.md](./PERMISSION_SYSTEM.md) - Documentação completa do sistema
- [PERMISSION_SYSTEM_QUICKSTART.md](./PERMISSION_SYSTEM_QUICKSTART.md) - Guia rápido
- [PERMISSION_PAGES.md](./PERMISSION_PAGES.md) - Documentação das páginas

## ✅ Checklist de Migração

- [ ] Backup do banco de dados
- [ ] `npx prisma generate`
- [ ] `npx prisma migrate dev`
- [ ] `npx tsx prisma/seed-roles.ts`
- [ ] Verificar roles criados
- [ ] Verificar membros têm roles
- [ ] Atualizar código legado
- [ ] Testar funcionalidades principais
- [ ] Testar permissões
- [ ] Deploy para produção

## 🎉 Benefícios do Sistema RBAC

✅ **Flexibilidade**: Criar roles customizados por organização  
✅ **Escalabilidade**: Adicionar permissões sem migrations  
✅ **Granularidade**: Controle fino sobre o que cada membro pode fazer  
✅ **Auditoria**: Rastrear mudanças de permissões com timestamps  
✅ **Multi-tenant**: Roles isolados por organização  

---

**Versão**: 1.0.0  
**Data**: 2024  
**Status**: ✅ Pronto para produção