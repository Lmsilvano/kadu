import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Download, EllipsisVertical, Share, SquarePlus, X } from 'lucide-react';
import { useInstallPrompt, type InstallPlatform } from '../hooks/useInstallPrompt';

interface Props {
    onClose: () => void;
}

function Step({ number, children }: { number: number; children: ReactNode }) {
    return (
        <li className="flex gap-3">
            <span className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {number}
            </span>
            <span className="text-sm text-gray-700 leading-relaxed">{children}</span>
        </li>
    );
}

const inlineIcon = 'inline-block align-text-bottom mx-0.5 text-blue-600';

const STEPS: Record<InstallPlatform, ReactNode[]> = {
    ios: [
        <>Toque em Compartilhar <Share size={16} className={inlineIcon} /> na barra do Safari.</>,
        <>Role a lista e toque em <strong>Adicionar à Tela de Início</strong> <SquarePlus size={16} className={inlineIcon} />.</>,
        <>Confirme em <strong>Adicionar</strong>, no canto superior direito.</>,
    ],
    android: [
        <>Toque no menu <EllipsisVertical size={16} className={inlineIcon} /> do navegador.</>,
        <>Escolha <strong>Instalar aplicativo</strong> (ou <strong>Adicionar à tela inicial</strong>).</>,
        <>Confirme em <strong>Instalar</strong>.</>,
    ],
    desktop: [
        <>Clique no ícone de instalar <Download size={16} className={inlineIcon} /> no fim da barra de endereço.</>,
        <>Se ele não aparecer, abra o menu do navegador e procure <strong>Instalar Kadu</strong>.</>,
    ],
};

export default function InstallSheet({ onClose }: Props) {
    const { platform, canPrompt, promptInstall } = useInstallPrompt();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleInstall = async () => {
        const accepted = await promptInstall();
        if (accepted) onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="install-sheet-title"
                className="relative w-full sm:max-w-md max-h-[90dvh] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl motion-safe:animate-sheet-up"
            >
                <div className="flex justify-center pt-2 sm:hidden" aria-hidden="true">
                    <div className="w-10 h-1.5 rounded-full bg-gray-200" />
                </div>

                <div className="flex items-center justify-between px-5 pt-2 pb-1">
                    <h2 id="install-sheet-title" className="text-lg font-bold text-gray-900">Instalar o Kadu</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="w-11 h-11 -mr-2 flex items-center justify-center text-gray-400 rounded-full active:bg-gray-100 transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="px-5 pb-5 pt-1 space-y-4 overflow-y-auto">
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Instalado, o Kadu abre direto da tela inicial, em tela cheia e sem a barra do navegador.
                        Ele continua funcionando sem internet.
                    </p>

                    {canPrompt ? (
                        <button
                            type="button"
                            onClick={handleInstall}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-bold rounded-2xl active:bg-blue-700 transition-colors"
                        >
                            <Download size={20} />
                            Instalar agora
                        </button>
                    ) : (
                        <ol className="space-y-3">
                            {STEPS[platform].map((step, index) => (
                                <Step key={index} number={index + 1}>{step}</Step>
                            ))}
                        </ol>
                    )}

                    {platform === 'ios' && (
                        <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl p-3 leading-relaxed">
                            No iPhone, só o <strong>Safari</strong> instala o app. Se você abriu este link dentro de outro
                            aplicativo, toque em <strong>⋯</strong> e escolha <strong>Abrir no Safari</strong> antes de começar.
                        </p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
