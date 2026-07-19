import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import Container from '@/components/layout/backoffice/Container';
import { useTranslation } from 'react-i18next';

export default function BackofficeDashboard() {
  const { t } = useTranslation();
  useDocumentTitle(t('backoffice_header.dashboard'));

  
  return (
    <Container>
      <h1>{t('backoffice_header.dashboard')}</h1>
    </Container>
  );
}
