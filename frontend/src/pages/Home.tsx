import { useDocumentTitle } from "@/hooks/useDocumentTitle";

import Header from "@/components/layout/Header";

export default function HomePage() {
  useDocumentTitle("Início");

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      {/* Reused Global Header */}
      <Header />

  
    </div>
  );
}