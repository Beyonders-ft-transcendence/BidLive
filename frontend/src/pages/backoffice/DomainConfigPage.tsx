import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Container from '@/components/layout/backoffice/Container';
import { useDomainQuery, useUpdateDomainMutation } from '@/hooks/useDomain';
import type { DomainStatus } from '@/shared/types/domain.types';
import { ArrowLeft, Save, Globe } from 'lucide-react';

export default function DomainConfigPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const domainId = Number(id);

  const { data: domain, isLoading } = useDomainQuery(domainId);
  const { mutate: updateDomain, isPending: isUpdating } = useUpdateDomainMutation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft' as DomainStatus,
    budget: '',
    is_archived: false,
  });

  useEffect(() => {
    if (domain) {
      setFormData({
        name: domain.name || '',
        description: domain.description || '',
        status: domain.status || 'draft',
        budget: domain.budget ? String(domain.budget) : '',
        is_archived: domain.is_archived || false,
      });
    }
  }, [domain]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDomain(
      { id: domainId, payload: formData },
      {
        onSuccess: () => {
          navigate('/backoffice/domains');
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }

  if (!domain && !isLoading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Domínio não encontrado.</p>
          <button 
            onClick={() => navigate('/backoffice/domains')}
            className="text-primary hover:underline"
          >
            Voltar para a lista
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Link 
            to="/backoffice/domains"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Globe size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurar Domínio</h1>
              <p className="text-sm text-muted-foreground">{domain?.name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">Nome</label>
            <input 
              id="name"
              name="name"
              type="text" 
              value={formData.name}
              onChange={handleChange}
              required
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">Descrição</label>
            <textarea 
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-sm font-medium text-foreground">Estado</label>
              <select 
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary appearance-none"
              >
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="completed">Concluído</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="budget" className="text-sm font-medium text-foreground">Orçamento</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input 
                  id="budget"
                  name="budget"
                  type="number" 
                  step="0.01"
                  value={formData.budget}
                  onChange={handleChange}
                  className="pl-8 pr-4 py-2 w-full bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
            <input 
              id="is_archived"
              name="is_archived"
              type="checkbox" 
              checked={formData.is_archived}
              onChange={handleChange}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="is_archived" className="text-sm font-medium text-foreground">
              Arquivar Domínio
            </label>
            <span className="text-xs text-muted-foreground ml-2">(Oculta o domínio das listagens principais)</span>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Link 
              to="/backoffice/domains"
              className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit" 
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {isUpdating ? 'A Guardar...' : 'Guardar Alterações'}
            </button>
          </div>

        </form>

      </div>
    </Container>
  );
}
