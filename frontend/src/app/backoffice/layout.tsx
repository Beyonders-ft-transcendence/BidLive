import Container from "@/components/layout/backoffice/Container";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <main className="flex-1 px-2 py-4 w-full">
        {children}
      </main>
    </Container>
  );
}
