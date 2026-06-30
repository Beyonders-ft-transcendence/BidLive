import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemCondition } from "@/shared/types/auction.types";
import type { Category } from "@/shared/types/category.types";
import { useCreateAuctionMutation } from "@/hooks/useAuction";
import { uploadImageToCloudinary } from "@/shared/utils/cloudinary.utils";
import { createAuctionSchema, type CreateAuctionInput } from "@/shared/schema/auction.schema";
import { Image as ImageIcon, Upload, X, Save, AlertCircle, Calendar } from "lucide-react";

interface CreateAuctionTabProps {
  categories: Category[];
  onSuccess: () => void;
}

interface SelectedFile {
  file: File;
  previewUrl: string;
}

export default function CreateAuctionTab({ categories, onSuccess }: CreateAuctionTabProps) {
  const createAuctionMutation = useCreateAuctionMutation();

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreateAuctionInput>({
    resolver: zodResolver(createAuctionSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      condition_type: ItemCondition.NEW,
      starting_price: "",
      minimum_increment: "1000",
      reserve_price: "",
      buy_now_price: "",
      start_time: "",
      end_time: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: SelectedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error(`O arquivo "${file.name}" não é uma imagem válida.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`A imagem "${file.name}" ultrapassa o limite de 5MB.`);
        continue;
      }
      newFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof CreateAuctionInput)[] = [];
    if (step === 1) {
      fieldsToValidate = ['title', 'category_id', 'description', 'condition_type'];
    } else if (step === 2) {
      fieldsToValidate = ['starting_price', 'minimum_increment', 'reserve_price', 'buy_now_price'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: CreateAuctionInput) => {
    if (selectedFiles.length === 0) {
      toast.error("Por favor, adicione pelo menos uma imagem para o lote.");
      return;
    }

    try {
      setUploadProgress("Enviando imagens para o servidor...");
      const uploadedUrls: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress(`Enviando imagem ${i + 1} de ${selectedFiles.length}...`);
        const url = await uploadImageToCloudinary(selectedFiles[i].file);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      if (uploadedUrls.length === 0) {
        toast.error("Falha ao carregar as imagens do lote.");
        setUploadProgress(null);
        return;
      }

      setUploadProgress("Salvando detalhes do leilão...");

      const payload = {
        title: data.title,
        description: data.description,
        category_id: Number(data.category_id),
        condition_type: data.condition_type,
        starting_price: Number(data.starting_price),
        minimum_increment: Number(data.minimum_increment),
        reserve_price: data.reserve_price ? Number(data.reserve_price) : undefined,
        buy_now_price: data.buy_now_price ? Number(data.buy_now_price) : undefined,
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
        image_urls: uploadedUrls,
      };

      await createAuctionMutation.mutateAsync(payload);
      toast.success("Leilão criado com sucesso!");
      reset();
      setSelectedFiles([]);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || err?.response?.data?.message || "Erro ao processar criação de leilão.");
    } finally {
      setUploadProgress(null);
    }
  };

  const STEPS = [
    { id: 1, title: 'Detalhes do Lote', icon: AlertCircle },
    { id: 2, title: 'Valores e Regras', icon: Save },
    { id: 3, title: 'Mídias e Datas', icon: Calendar },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none max-w-4xl mx-auto text-foreground">
      {/* Header and Stepper */}
      <div className="bg-card border border-border p-6 rounded-sm shadow-sm">
        <h2 className="text-xl font-black tracking-tight mb-6">Criar Novo Lote</h2>
        
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-muted z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((s) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className={`w-9 h-9 rounded-sm flex items-center justify-center font-bold text-xs transition-colors duration-300 border-2 border-card shadow-sm ${
                    isActive 
                      ? 'bg-primary text-primary-foreground scale-105' 
                      : isCompleted 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Save size={14} /> : <span>{s.id}</span>}
                </div>
                <span className={`text-[9px] uppercase font-bold tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-sm shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
          
          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Título do Lote</label>
                  <input
                    type="text"
                    {...register("title")}
                    className={`w-full px-3.5 py-2.5 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 ${
                      errors.title
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Ex: iPhone 15 Pro Max 256GB - Selado"
                  />
                  {errors.title && <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.title.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Categoria</label>
                  <select
                    {...register("category_id")}
                    className={`w-full px-3.5 py-2.5 border rounded-sm text-xs bg-background text-foreground outline-none transition duration-150 h-[38px] ${
                      errors.category_id
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                  >
                    <option value="">Selecione uma Categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.category_id.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estado de Conservação</label>
                  <select
                    {...register("condition_type")}
                    className="w-full px-3.5 py-2.5 border border-border bg-background text-foreground rounded-sm text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition duration-150 h-[38px]"
                  >
                    <option value={ItemCondition.NEW}>Novo (NEW)</option>
                    <option value={ItemCondition.USED}>Usado (USED)</option>
                    <option value={ItemCondition.REFURBISHED}>Recondicionado (REFURBISHED)</option>
                    <option value={ItemCondition.DAMAGED}>Avariado/Danificado (DAMAGED)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Descrição Geral</label>
                <textarea
                  rows={4}
                  {...register("description")}
                  className={`w-full px-3.5 py-2.5 border rounded-sm bg-background text-foreground text-xs outline-none resize-none transition duration-150 ${
                    errors.description
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                  }`}
                  placeholder="Forneça especificações do lote, estado físico, detalhes de envio, garantia..."
                />
                {errors.description && <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.description.message}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: Pricing */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Preço Inicial (Kz)</label>
                  <input
                    type="text"
                    {...register("starting_price")}
                    className={`w-full px-3.5 py-2.5 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 ${
                      errors.starting_price
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Ex: 150000"
                  />
                  {errors.starting_price && (
                    <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.starting_price.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Incremento Mínimo (Kz)</label>
                  <input
                    type="text"
                    {...register("minimum_increment")}
                    className={`w-full px-3.5 py-2.5 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 ${
                      errors.minimum_increment
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Ex: 5000"
                  />
                  {errors.minimum_increment && (
                    <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.minimum_increment.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Preço de Reserva (Opcional)</label>
                  <input
                    type="text"
                    {...register("reserve_price")}
                    className={`w-full px-3.5 py-2.5 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 ${
                      errors.reserve_price
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Preço mínimo exigido para vender o lote"
                  />
                  {errors.reserve_price && (
                    <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.reserve_price.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Preço Compra Imediata (Opcional)</label>
                  <input
                    type="text"
                    {...register("buy_now_price")}
                    className={`w-full px-3.5 py-2.5 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 ${
                      errors.buy_now_price
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Valor para arrematar o lote imediatamente"
                  />
                  {errors.buy_now_price && (
                    <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.buy_now_price.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Schedule & Media */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Data/Hora de Início</label>
                  <input
                    type="datetime-local"
                    {...register("start_time")}
                    className={`w-full px-3.5 py-2.5 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 ${
                      errors.start_time
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                  />
                  {errors.start_time && (
                    <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.start_time.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Data/Hora de Término</label>
                  <input
                    type="datetime-local"
                    {...register("end_time")}
                    className={`w-full px-3.5 py-2.5 border rounded-sm bg-background text-foreground text-xs outline-none transition duration-150 ${
                      errors.end_time
                        ? "border-destructive focus:ring-1 focus:ring-destructive focus:border-destructive"
                        : "border-border focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                  />
                  {errors.end_time && (
                    <p className="text-[10px] text-destructive font-semibold mt-0.5">{errors.end_time.message}</p>
                  )}
                </div>
              </div>

              {/* Media upload zone */}
              <div className="space-y-3 pt-2 text-left">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Galeria de Mídias do Lote
                </h3>

                <label className="border border-dashed border-border hover:border-primary/50 rounded-sm flex flex-col items-center justify-center p-6 cursor-pointer bg-muted/10 hover:bg-muted/30 transition duration-150 text-center w-full min-h-[140px] col-span-full select-none">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2 animate-bounce" style={{ animationDuration: '2.5s' }} />
                  <span className="text-xs font-bold text-foreground">Selecionar Imagens do Lote</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Formatos aceitos: PNG, JPG, WEBP • Máx 5MB por arquivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-4 w-full">
                    {selectedFiles.map((fileObj, idx) => (
                      <div key={idx} className="relative aspect-square border border-border bg-muted rounded-sm overflow-hidden group">
                        <img src={fileObj.previewUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-destructive text-white rounded-sm p-1 transition cursor-pointer border-none"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center border-t border-border pt-6 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-sm transition uppercase cursor-pointer border-none"
              >
                Voltar
              </button>
            ) : (
              <div></div> // spacer
            )}

            <div className="flex items-center gap-4">
              {uploadProgress && (
                <div className="flex items-center gap-2 text-xs text-primary font-bold animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full border border-primary border-t-transparent animate-spin"></span>
                  {uploadProgress}
                </div>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-sm shadow-md shadow-primary/20 transition uppercase cursor-pointer border-none"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !!uploadProgress}
                  className="flex items-center justify-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-sm shadow-md shadow-green-600/20 transition uppercase disabled:opacity-50 cursor-pointer border-none"
                >
                  <Save size={14} />
                  {isSubmitting || uploadProgress ? "Processando..." : "Salvar Rascunho"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
