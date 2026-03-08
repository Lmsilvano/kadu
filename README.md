# 📋 Kadu - Scanner de Presença Inteligente

Kadu é um Aplicativo Web Progressivo (PWA) projetado para digitalizar e gerenciar listas de presença de forma rápida, eficiente e com suporte total a funcionamento offline. Utilizando o poder da IA e OCR, o Kadu transforma fotos de documentos em dados estruturados instantaneamente.

![Status](https://img.shields.io/badge/Status-Development-orange)
![PWA](https://img.shields.io/badge/PWA-Ready-success)
![Vite](https://img.shields.io/badge/Vite-6.0-blue)

## ✨ Funcionalidades

- **📸 OCR de Alta Precisão**: Integração com **Groq Cloud API** (Llama 3-Vision) e **Tesseract.js** para extração inteligente de nomes em listas de presença.
- **🔌 Offline First**: Funciona sem internet através de Service Workers e armazenamento local robusto.
- **💾 Banco de Dados Local**: Utiliza **Dexie.js** (IndexedDB) para garantir que seus dados nunca se percam, mesmo sem conexão.
- **🌐 PWA**: Instale no seu celular ou desktop como um aplicativo nativo.
- **🎨 Interface Moderna**: Desenvolvida com **React** e **Tailwind CSS**, focada em usabilidade mobile-first.

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **OCR**: [Groq Vision](https://groq.com/) & [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Banco de Dados**: [Dexie.js](https://dexie.org/)
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

## 🚀 Como Começar

### Pré-requisitos
- Node.js (v18+)
- NPM ou Yarn

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/kadu.git
   cd kadu
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   VITE_GROQ_API_KEY=sua_chave_aqui
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 📦 Deploy na Vercel

O projeto está configurado para deploy automático na Vercel. O roteamento de SPA e os assets de PWA são tratados através do arquivo `vercel.json` e do plugin `vite-plugin-pwa`.


## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
Desenvolvido com ❤️ para simplificar a gestão de presença.
