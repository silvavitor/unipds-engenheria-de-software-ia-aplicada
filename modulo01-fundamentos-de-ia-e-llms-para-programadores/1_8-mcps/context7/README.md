# Demo: Next.js + Better Auth + GitHub OAuth + SQLite

Demo mínimo de autenticação social com GitHub usando Better Auth, Next.js App Router e SQLite local.

## Pré-requisitos

- Node.js 18+
- Uma **GitHub OAuth App** (gratuita)

## 1. Criar OAuth App no GitHub

1. Acesse <https://github.com/settings/developers> → **New OAuth App**
2. Preencha:
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Copie o **Client ID** e gere um **Client Secret**

## 2. Configurar variáveis de ambiente

Edite o arquivo `.env.local` com os valores reais:

```env
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
BETTER_AUTH_SECRET=string_aleatoria_longa
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Gere o secret com: `openssl rand -base64 32`

## 3. Instalar dependências

```bash
npm install
```

## 4. Criar as tabelas do banco

```bash
npx @better-auth/cli migrate
```

> Isso cria o arquivo `better-auth.sqlite` na raiz do projeto.

## 5. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse <http://localhost:3000>

## Estrutura de arquivos

```
├── lib/
│   ├── auth.ts           # Configuração do Better Auth (SQLite + GitHub)
│   └── auth-client.ts    # Client-side auth client
├── app/
│   ├── api/auth/[...all]/route.ts  # Route handler
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx          # Home (mostra sessão)
│   ├── sign-out-button.tsx
│   └── login/
│       └── page.tsx      # Página de login com botão GitHub
├── .env.local            # Variáveis de ambiente (editar antes de rodar)
└── README.md
```

## Fluxo

1. Acesse `/login` → clique **Entrar com GitHub**
2. Autorize no GitHub → redirecionado para `/`
3. Home exibe: **Logado como \<nome>**
4. Clique **Sair** para encerrar a sessão
