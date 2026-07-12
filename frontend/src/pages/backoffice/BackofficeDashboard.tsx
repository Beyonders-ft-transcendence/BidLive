import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import Container from '@/components/layout/backoffice/Container';

export default function BackofficeDashboard() {
  useDocumentTitle("Dashboard Backoffice");

  
  return (
    <Container>
      <h1>Dashboard</h1>
    </Container>
  );
}
