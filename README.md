# 📋 Kadu - Listas de presença e compras

Kadu é um Aplicativo Web Progressivo (PWA) para digitalizar e gerenciar listas de **presença** e de **compras**. Com OCR e funcionamento offline, transforma fotos de listas impressas em dados estruturados e editáveis no próprio navegador.

![Status](https://img.shields.io/badge/Status-Development-orange)
![PWA](https://img.shields.io/badge/PWA-Ready-success)
![Vite](https://img.shields.io/badge/Vite-6.0-blue)

## ✨ Funcionalidades

- **📂 Categorias**
  - **Padrão**: lista de presença com presente/ausente, observações por pessoa e chips rápidos (Atrasado, Falta justificada, Saiu mais cedo).
  - **Mercado**: lista de compras com quantidade, preço unitário (digitado ou lido da etiqueta pela câmera), observações e totais **no carrinho** / **estimado**.
- **📸 Escanear ou digitar**: fotografe a lista ou cole/digite os itens, um por linha.
- **🔎 OCR**: tenta **Gemini → OpenAI → Groq**; se nada servir, usa **Tesseract.js** no dispositivo.
- **✏️ Renomear listas**: altere o título depois de criar.
- **📱 Instalar na tela inicial**: abre em tela cheia e funciona como app.
- **🔌 Offline**: Service Workers e **Dexie.js** (IndexedDB) guardam as listas no dispositivo.
- **📤 CSV**: exportação com colunas de acordo com a categoria (presença ou compras).

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **OCR**: Gemini, OpenAI, Groq e [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Banco de Dados**: [Dexie.js](https://dexie.org/)
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

## 🚀 Como Começar

### Pré-requisitos
- Node.js (v18+)
- NPM ou Yarn

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Lmsilvano/kadu.git
   cd kadu
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

As chaves de OCR (Gemini, OpenAI, Groq) são informadas em **Configurações**, no próprio app.

## 📦 Deploy na Vercel

O projeto está configurado para deploy automático na Vercel. O roteamento de SPA e os assets de PWA são tratados através do arquivo `vercel.json` e do plugin `vite-plugin-pwa`.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
Desenvolvido com ❤️ para escanear e organizar listas, online ou offline.
