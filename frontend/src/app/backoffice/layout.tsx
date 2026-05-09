import Header from "@/components/layout/backoffice/Header";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        {children}
      </main>
    </div>
  );
}
