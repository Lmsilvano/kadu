import { ShoppingCart, Users, type LucideIcon } from 'lucide-react';
import type { ListCategory } from './storage/db';
import { cleanOcrText, isValidName, normalizeName, parseMarketLine, type ParsedItem } from './parsing/cleanText';

export interface CategoryConfig {
    label: string;
    description: string;
    icon: LucideIcon;
    itemNoun: { one: string; many: string };
    checkedLabel: string;
    strikeChecked: boolean;
    features: { notes: boolean; pricing: boolean };
    noteSuggestions: string[];
    notePlaceholder: string;
    scanPrompt: string;
    scanHint: string;
    typedHint: string;
    typedPlaceholder: string;
    parseScannedLine: (line: string) => ParsedItem | null;
    parseTypedLine: (line: string) => ParsedItem | null;
    defaultTitle: (source: 'scan' | 'manual', date: Date) => string;
}

export const CATEGORIES: Record<ListCategory, CategoryConfig> = {
    padrao: {
        label: 'Padrão',
        description: 'Presença e observações',
        icon: Users,
        itemNoun: { one: 'pessoa', many: 'pessoas' },
        checkedLabel: 'Presentes',
        strikeChecked: false,
        features: { notes: true, pricing: false },
        noteSuggestions: ['Atrasado', 'Falta justificada', 'Saiu mais cedo'],
        notePlaceholder: 'Ex.: chegou às 9h, trouxe atestado…',
        scanPrompt: `Analise esta imagem de uma lista de presença/frequência.
Extraia TODOS os nomes de pessoas que aparecem na lista.
Retorne APENAS os nomes, um por linha, sem numeração, sem pontuação, sem cabeçalhos.
Ignore textos como "MASCULINO", "FEMININO", "LISTA DE RESIDENTES", datas, e cabeçalhos.
Se um nome estiver riscado ou ilegível, tente ler mesmo assim.
Não inclua linhas vazias.`,
        scanHint: 'Garanta uma boa iluminação e capture a página inteira.',
        typedHint: 'Cole ou digite os nomes, um por linha.',
        typedPlaceholder: 'Exemplo:\nJoão Silva\nMaria Souza\nPedro Costa',
        parseScannedLine: line => {
            const name = cleanOcrText(line);
            return isValidName(name) ? { name } : null;
        },
        parseTypedLine: line => line.trim().length >= 2 ? { name: normalizeName(line) } : null,
        defaultTitle: (source, date) => source === 'scan'
            ? 'Escaneado em ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : 'Lista Manual ' + date.toLocaleDateString('pt-BR'),
    },
    mercado: {
        label: 'Mercado',
        description: 'Itens, preços e total',
        icon: ShoppingCart,
        itemNoun: { one: 'item', many: 'itens' },
        checkedLabel: 'No carrinho',
        strikeChecked: true,
        features: { notes: true, pricing: true },
        noteSuggestions: [],
        notePlaceholder: 'Ex.: marca, tamanho, sem lactose…',
        scanPrompt: `Analise esta imagem de uma lista de compras.
Extraia TODOS os itens da lista, um por linha.
Se o item tiver quantidade, escreva a quantidade no início da linha (ex.: "2 Leite integral").
Mantenha detalhes do produto como marca, tamanho ou peso (ex.: "Arroz 5kg").
Não inclua numeração da lista, preços, datas, cabeçalhos ou títulos como "Lista de compras".
Se um item estiver riscado ou pouco legível, tente ler mesmo assim.
Não inclua linhas vazias.`,
        scanHint: 'Fotografe a lista de compras inteira, com boa iluminação.',
        typedHint: 'Cole ou digite os itens, um por linha. Para indicar quantidade, comece com o número (ex.: 2 Leite).',
        typedPlaceholder: 'Exemplo:\nArroz 5kg\nFeijão\n2 Leite',
        parseScannedLine: parseMarketLine,
        parseTypedLine: parseMarketLine,
        defaultTitle: (_source, date) =>
            'Compras ' + date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    },
};
