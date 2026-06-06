import Container from "@/components/layout/backoffice/Container";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto">
        {children}
      </main>
    </Container>
  );
}
