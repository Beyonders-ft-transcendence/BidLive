import { useEffect } from "react";

/**
 * Hook para alterar o título da página (aba do navegador) dinamicamente.
 * Ele restaura o título original quando o componente é desmontado,
 * a menos que preserveOnUnmount seja definido como true.
 * 
 * @param title O título que será exibido.
 * @param preserveOnUnmount Se for verdadeiro, o título não voltará ao estado anterior ao sair da página.
 */
export function useDocumentTitle(title: string, preserveOnUnmount: boolean = false) {
    useEffect(() => {
        const previousTitle = document.title;
        
        // Define o novo título com o nome da plataforma
        document.title = title ? `${title} | BidLive` : "BidLive";

        return () => {
            if (!preserveOnUnmount) {
                document.title = previousTitle;
            }
        };
    }, [title, preserveOnUnmount]);
}

export default useDocumentTitle;
