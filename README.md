# 🛰️ Monitoramento SEIA

Sistema web de monitoramento de resultados via API, com autenticação de usuários e dashboard de cards informativos em tempo real.

---

## 📋 Sobre o Projeto

O **Monitoramento SEIA** é uma aplicação frontend desenvolvida para centralizar e visualizar dados provenientes de APIs externas. A interface conta com:

- 🔐 **Login seguro** com autenticação de usuários
- 📊 **Dashboard com cards** para monitoramento de indicadores e resultados
- 🔄 **Integração com API** para atualização dinâmica dos dados
- 💅 **Interface moderna** e responsiva

---

## 🚀 Tecnologias Utilizadas

| Tecnologia | Descrição |
|---|---|
| [Vite](https://vitejs.dev/) | Build tool e dev server ultrarrápido |
| [React](https://react.dev/) | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org/) | Superset tipado do JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | Framework de estilização utilitária |
| [shadcn/ui](https://ui.shadcn.com/) | Componentes de UI acessíveis e customizáveis |

---

## 🗂️ Estrutura do Projeto

```
monitoramento-seia/
├── public/
├── src/
│   ├── assets/         # Imagens e recursos estáticos
│   ├── components/     # Componentes reutilizáveis
│   ├── data/           # Dados estáticos ou mocks
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitários e configurações
│   ├── pages/          # Páginas da aplicação
│   ├── test/           # Testes unitários e de integração
│   ├── App.tsx
│   └── main.tsx
├── .env                # Variáveis de ambiente (não versionar)
├── package.json
└── vite.config.ts
```

---

## ⚙️ Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18.x
- [npm](https://www.npmjs.com/) ou [bun](https://bun.sh/)

> Recomendamos usar o [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) para gerenciar versões do Node.

### Passo a passo

```sh
# 1. Clone o repositório
git clone <YOUR_GIT_URL>

# 2. Acesse o diretório do projeto
cd monitoramento-seia

# 3. Instale as dependências
npm install
# ou
bun install

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais e URLs de API

# 5. Inicie o servidor de desenvolvimento
npm run dev
# ou
bun dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_API_URL=https://sua-api.com
VITE_API_KEY=sua_chave_aqui
```

> ⚠️ Nunca suba o arquivo `.env` para o repositório. Ele já está listado no `.gitignore`.

---

## 🧪 Testes

```sh
# Executar testes unitários
npm run test

# Executar testes com cobertura
npm run test:coverage
```

---

## 📦 Build para Produção

```sh
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
3. Commit suas alterações: `git commit -m 'feat: minha nova feature'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

