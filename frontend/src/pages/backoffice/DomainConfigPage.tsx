import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@/components/layout/backoffice/Container';
import PageHeader from '@/components/layout/backoffice/PageHeader';
import { useDomainQuery, useUpdateDomainMutation } from '@/hooks/useDomain';
import type { DomainStatus } from '@/shared/types/domain.types';
import { Save, Globe, Settings, DollarSign, ShieldAlert } from 'lucide-react';

type Tab = 'general' | 'budget' | 'danger';

export default function DomainConfigPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const domainId = Number(id);

  const { data: domain, isLoading } = useDomainQuery(domainId);
  const { mutate: updateDomain, isPending: isUpdating } = useUpdateDomainMutation();

  const [activeTab, setActiveTab] = useState<Tab>('general');

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

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateDomain({ id: domainId, payload: { name: formData.name, description: formData.description } });
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    updateDomain({ id: domainId, payload: { status: formData.status, budget: formData.budget } });
  };

  const handleToggleArchive = () => {
    const newValue = !formData.is_archived;
    setFormData(prev => ({ ...prev, is_archived: newValue }));
    updateDomain({ id: domainId, payload: { is_archived: newValue } });
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
        </div>
      </Container>
    );
  }

  if (!domain && !isLoading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-zinc-500">Domínio não encontrado.</p>
          <button 
            onClick={() => navigate('/backoffice/domains')}
            className="text-zinc-300 hover:text-zinc-50 hover:underline"
          >
            Voltar para a lista
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader 
        title="Configurar Domínio"
        description="Faça a gestão das definições avançadas, orçamento e estado operacional do seu domínio."
        icon={<Globe size={20} />}
        backUrl="/backoffice/domains"
        actions={
           <button 
             onClick={() => navigate('/backoffice/domains')}
             className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-50 transition-colors border border-zinc-800 rounded-md hover:bg-zinc-800/50"
           >
             Concluído
           </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full">
        
        {/* Left Nav (Settings Tabs Style) */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col gap-1 sticky top-24">
            <button 
              onClick={() => setActiveTab('general')}
              className={`px-3 py-2 text-sm font-medium rounded-md flex items-center justify-start gap-2 transition-colors w-full ${activeTab === 'general' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <Settings size={16} className={activeTab === 'general' ? 'text-zinc-50' : 'text-zinc-500'} />
              Geral
            </button>
            <button 
              onClick={() => setActiveTab('budget')}
              className={`px-3 py-2 text-sm font-medium rounded-md flex items-center justify-start gap-2 transition-colors w-full ${activeTab === 'budget' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <DollarSign size={16} className={activeTab === 'budget' ? 'text-zinc-50' : 'text-zinc-500'} />
              Controlo & Orçamento
            </button>
            <button 
              onClick={() => setActiveTab('danger')}
              className={`px-3 py-2 text-sm font-medium rounded-md flex items-center justify-start gap-2 transition-colors w-full ${activeTab === 'danger' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <ShieldAlert size={16} className={activeTab === 'danger' ? 'text-zinc-50' : 'text-zinc-500'} />
              Zona de Perigo
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-8 pb-20 relative">
          
          {/* Section: General */}
          {activeTab === 'general' && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Configurações Gerais</h2>
              <form onSubmit={handleSaveGeneral} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-medium text-zinc-300">Nome do Domínio</label>
                    <p className="text-xs text-zinc-500 mb-1">O identificador principal do projeto.</p>
                    <input 
                      id="name"
                      name="name"
                      type="text" 
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="max-w-md px-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="description" className="text-sm font-medium text-zinc-300">Descrição</label>
                    <p className="text-xs text-zinc-500 mb-1">Uma breve explicação do propósito deste domínio.</p>
                    <textarea 
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="max-w-lg px-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                    />
                  </div>
                </div>
                <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="px-4 py-2 bg-zinc-100 text-zinc-900 text-sm rounded-lg font-medium hover:bg-zinc-300 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'A Guardar...' : 'Guardar Alterações'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Section: Budget & Status */}
          {activeTab === 'budget' && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Controlo & Orçamento</h2>
              <form onSubmit={handleSaveBudget} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="status" className="text-sm font-medium text-zinc-300">Estado Operacional</label>
                    <p className="text-xs text-zinc-500 mb-1">Define o ciclo de vida atual do projeto.</p>
                    <select 
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="max-w-[200px] px-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 appearance-none"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="active">Ativo</option>
                      <option value="paused">Pausado</option>
                      <option value="completed">Concluído</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="budget" className="text-sm font-medium text-zinc-300">Orçamento Máximo</label>
                    <p className="text-xs text-zinc-500 mb-1">O limite de alocação financeira (opcional).</p>
                    <div className="relative max-w-[200px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                      <input 
                        id="budget"
                        name="budget"
                        type="number" 
                        step="0.01"
                        value={formData.budget}
                        onChange={handleChange}
                        className="pl-8 pr-3 py-2 w-full bg-black border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="px-4 py-2 bg-zinc-100 text-zinc-900 text-sm rounded-lg font-medium hover:bg-zinc-300 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'A Guardar...' : 'Guardar Alterações'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Section: Danger Zone */}
          {activeTab === 'danger' && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-semibold text-red-500 mb-4">Zona de Perigo</h2>
              <div className="border border-red-900/50 rounded-xl overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-red-950/10">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-100">Arquivar Domínio</h3>
                    <p className="text-xs text-zinc-400 mt-1">Oculta o domínio das listagens principais, mas não apaga os dados.</p>
                  </div>
                  <button 
                    type="button" 
                    disabled={isUpdating}
                    onClick={handleToggleArchive}
                    className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors border disabled:opacity-50 ${
                      formData.is_archived 
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' 
                        : 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20'
                    }`}
                  >
                    {isUpdating ? 'A Processar...' : (formData.is_archived ? 'Desarquivar Domínio' : 'Arquivar Domínio')}
                  </button>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </Container>
  );
}
