---
description: Regras Mestre e Arquitetura - Attendance Scanner PWA
tags: [architecture, frontend, pwa, react, opencv, tesseract]
---

# Regras do Projeto - Attendance Scanner PWA

Este documento é a **Bíblia Arquitetural** do aplicativo. Qualquer agente de IA ou desenvolvedor humano que atue neste projeto **deve** seguir estritamente as diretrizes abaixo.

## 1. Regra de Ouro (Inviolável)
- **100% Frontend**: Nenhum código de backend (Node.js, Python, bancos SQL etc) é permitido.
- **Grátis para Hospedar**: Apenas arquivos estáticos (HTML/CSS/JS/WASM).
- **Processamento Local**: Todas as imagens e OCRs rodam no navegador do usuário.
- **Offline First**: Assim que o Service Worker fizer o cache, o app tem que rodar em Modo Avião.

## 2. Tecnologias Aprovadas
- **Core**: React 18+ (Vite), TypeScript.
- **Estilo**: TailwindCSS v3/v4.
- **Armazenamento**: IndexedDB (com dexie.js ou abstrato puro).
- **Visão Computacional**: OpenCV.js (carregado via CDN em lazy load).
- **OCR**: Tesseract.js (Worker dinâmico, também lazy loaded).
- **PWA**: `vite-plugin-pwa` (geração de manifesto e service worker).

## 3. Diretrizes de Performance
- **Tamanho do Bundle Inicial**: Mínimo absoluto (React + PWA + Tailwind). Bibliotecas pesadas como OpenCV e Tesseract **NÃO PODEM** estar no bundle de carregamento inicial (HomePage).
- **Carregamento Assíncrono**: O módulo de Scanner deve carregar dinamicamente seus binários grandes enquanto mostra uma tela de "Preparando Scanner" ou fazer o prefetch em plano de fundo no Service Worker.
- **Processamento Off-Thread**: O OCR deve *obrigatoriamente* rodar usando Web Workers (padrão do Tesseract.js) para não bloquear/congelar a interface do usuário.

## 4. Pipeline de Processamento (O Flow Obrigatório)
Todo componente responsável por ler a lista de presença deve respeitar o pipeline:
1. **Captura/Upload**: Componente `CameraInput` (ideal) ou Upload de Arquivo.
2. **OpenCV - Isolamento do Documento**: Converter P&B -> Blur -> Canny Edges -> Maior Retângulo (Contorno).
3. **OpenCV - Transformação e Recorte (Warp Perspective)**: Ajeita a imagem como uma folha A4 plana.
4. **Fatiamento de Linhas**: Usar kernel morfológico horizontal para identificar e exportar múltiplas imagens (uma por linha da lista).
5. **Tesseract - Processamento por Linha**: Rodar Tesseract em *Single Line Mode* (PSM 7).
6. **Limpeza**: Regex para remover prefixos numéricos (ex: "1. ", "02 -") e lixos.

## 5. Estrutura do Estado e Banco de Dados (IndexedDB)
Uma tabela/collection base chamada `attendance_lists`:
```typescript
interface Participant {
  id: string; // uuid
  name: string;
  present: boolean;
}

interface AttendanceList {
  id: string; // uuid
  title: string; // Ex: "Aula 101"
  date: string;  // ISO Date
  participants: Participant[];
}
```

## 6. Fases de Desenvolvimento para o Agente
Se você (IA) for acionada para desenvolver, siga a ordem:
- **FASE 1 - Base App**: Setup do Vite, React, Tailwind, Vite-PWA (Manifesto / Ícones provisórios) e Roteamento simples.
- **FASE 2 - Banco e UI**: Crud no IndexedDB (Dexie), telas de Histórico e Edição Manual de Nomes, sem imagem ainda.
- **FASE 3 - Visão Módulo**: Integração OpenCV, componentes de preview de câmera e canvas oculto para fatiamento de blocos horizontais.
- **FASE 4 - OCR e Integração**: Pipeline Tesseract.js com Worker, lendo o Canvas fatiado, gerando array de strings, Regex de limpeza, e populando o IndexedDB.
- **FASE 5 - Exportação e Refinos**: Botão "Download CSV", checagem PWA Offline, polimento TailwindCSS Mobile UX.

## 7. Controle de Qualidade
- **Sem Warnings de Typescript**: O Typescript deve ser rigoroso (StrictMode activado).
- **Mobile First**: Hover state não funciona com dedo. O design deve considerar áreas de toque grandes (botões de pelo menos 44x44px min).

---
*Atualize ou expanda este arquivo sempre que houver mudanças arquiteturais ou a entrada de novas bibliotecas primárias.*
