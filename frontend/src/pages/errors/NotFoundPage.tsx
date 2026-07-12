import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  useDocumentTitle("Página Não Encontrada");

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-9xl font-extrabold text-primary tracking-tighter">404</h1>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mt-4 sm:text-4xl">
                Página não encontrada
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-md">
                Desculpe, não conseguimos encontrar a página que você está procurando.
                Ela pode ter sido movida ou não existe mais.
            </p>
            <div className="mt-8 flex gap-4">
                <Button asChild variant="default" size="lg">
                    <Link to="/">Voltar ao Início</Link>
                </Button>
            </div>
        </div>
    );
}
