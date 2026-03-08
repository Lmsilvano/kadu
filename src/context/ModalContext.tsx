import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Modal, { ModalType } from '../components/Modal';

interface ModalOptions {
    title: string;
    message: string | ReactNode;
    type?: ModalType;
    confirmLabel?: string;
    cancelLabel?: string;
}

interface ModalContextType {
    confirm: (options: ModalOptions) => Promise<boolean>;
    alert: (options: ModalOptions) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        options: ModalOptions;
        resolve: (value: boolean) => void;
    } | null>(null);

    const showModal = useCallback((options: ModalOptions) => {
        return new Promise<boolean>((resolve) => {
            setModalState({
                isOpen: true,
                options,
                resolve
            });
        });
    }, []);

    const handleClose = useCallback(() => {
        if (modalState) {
            modalState.resolve(false);
            setModalState(null);
        }
    }, [modalState]);

    const handleConfirm = useCallback(() => {
        if (modalState) {
            modalState.resolve(true);
            setModalState(null);
        }
    }, [modalState]);

    const confirm = useCallback(async (options: ModalOptions) => {
        return showModal(options);
    }, [showModal]);

    const alert = useCallback(async (options: ModalOptions) => {
        await showModal({ ...options, cancelLabel: 'Ok' });
    }, [showModal]);

    return (
        <ModalContext.Provider value={{ confirm, alert }}>
            {children}
            {modalState && (
                <Modal
                    isOpen={modalState.isOpen}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    {...modalState.options}
                />
            )}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
