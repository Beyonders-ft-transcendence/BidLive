"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemCondition } from "@/types/auction.types";
import type { Category } from "@/types/category.types";
import { useCreateAuctionMutation } from "@/hooks/useAuction";
import { uploadImageToCloudinary } from "@/utils/cloudinary.utils";
import { createAuctionSchema, type CreateAuctionInput } from "@/schema/auction.schema";
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
    setUploadProgress(null);
    try {
      const urls: string[] = [];
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgress(`Carregando imagem ${i + 1} de ${selectedFiles.length}...`);
          const url = await uploadImageToCloudinary(selectedFiles[i].file);
          if (url) {
            urls.push(url);
          } else {
            throw new Error(`Falha no upload do arquivo: ${selectedFiles[i].file.name}`);
          }
        }
      }

      setUploadProgress("Registrando lote no servidor...");

      const payload = {
        ...data,
        category_id: data.category_id ? Number(data.category_id) : null,
        starting_price: Number(data.starting_price),
        minimum_increment: Number(data.minimum_increment),
        reserve_price: data.reserve_price ? Number(data.reserve_price) : null,
        buy_now_price: data.buy_now_price ? Number(data.buy_now_price) : null,
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
        is_draft: true, // starts as draft by default
        image_urls: urls,
      };

      const res = await createAuctionMutation.mutateAsync(payload);
      if (res.success) {
        toast.success("Lote criado e salvo como rascunho!");
        reset();
        // Clear files
        selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
        setSelectedFiles([]);
        setStep(1);
        onSuccess();
      } else {
        toast.error(res.message || "Erro ao criar leilão.");
      }
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 select-none max-w-4xl mx-auto">
      {/* Header and Stepper */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 tracking-tight font-sans mb-6">Criar Novo Lote</h2>
        
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-4 border-white shadow-sm ${
                    isActive 
                      ? 'bg-primary text-white scale-110' 
                      : isCompleted 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Save size={16} /> : <span>{s.id}</span>}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
          
          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título do Lote</label>
                  <input
                    type="text"
                    {...register("title")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none transition duration-150 ${
                      errors.title
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Ex: iPhone 15 Pro Max 256GB - Selado"
                  />
                  {errors.title && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.title.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                  <select
                    {...register("category_id")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs bg-white outline-none transition duration-150 h-[38px] ${
                      errors.category_id
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                  >
                    <option value="">Selecione uma Categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.category_id.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado de Conservação</label>
                  <select
                    {...register("condition_type")}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition duration-150 h-[38px]"
                  >
                    <option value={ItemCondition.NEW}>Novo (NEW)</option>
                    <option value={ItemCondition.USED}>Usado (USED)</option>
                    <option value={ItemCondition.REFURBISHED}>Recondicionado (REFURBISHED)</option>
                    <option value={ItemCondition.DAMAGED}>Avariado/Danificado (DAMAGED)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">Descrição Geral</label>
                <textarea
                  rows={4}
                  {...register("description")}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none resize-none transition duration-150 ${
                    errors.description
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary"
                  }`}
                  placeholder="Forneça especificações do lote, estado físico, detalhes de envio, garantia..."
                />
                {errors.description && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.description.message}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: Pricing */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preço Inicial (Kz)</label>
                  <input
                    type="text"
                    {...register("starting_price")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none transition duration-150 ${
                      errors.starting_price
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Ex: 150000"
                  />
                  {errors.starting_price && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.starting_price.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Incremento Mínimo (Kz)</label>
                  <input
                    type="text"
                    {...register("minimum_increment")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none transition duration-150 ${
                      errors.minimum_increment
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Ex: 5000"
                  />
                  {errors.minimum_increment && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.minimum_increment.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preço de Reserva (Opcional)</label>
                  <input
                    type="text"
                    {...register("reserve_price")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none transition duration-150 ${
                      errors.reserve_price
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Preço mínimo exigido para vender o lote"
                  />
                  {errors.reserve_price && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.reserve_price.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preço Compra Imediata (Opcional)</label>
                  <input
                    type="text"
                    {...register("buy_now_price")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none transition duration-150 ${
                      errors.buy_now_price
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                    placeholder="Valor para arrematar o lote imediatamente"
                  />
                  {errors.buy_now_price && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.buy_now_price.message}</p>
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data/Hora de Início</label>
                  <input
                    type="datetime-local"
                    {...register("start_time")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none transition duration-150 ${
                      errors.start_time
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                  />
                  {errors.start_time && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.start_time.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data/Hora de Término</label>
                  <input
                    type="datetime-local"
                    {...register("end_time")}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none transition duration-150 ${
                      errors.end_time
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary"
                    }`}
                  />
                  {errors.end_time && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.end_time.message}</p>
                  )}
                </div>
              </div>

              {/* Media upload zone */}
              <div className="space-y-2.5 pt-2 text-left">
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Galeria de Mídias do Lote
                </h3>
                <p className="text-[10px] text-gray-400">Suporta múltiplas imagens de até 5MB cada.</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {selectedFiles.map((fileObj, idx) => (
                    <div key={idx} className="relative aspect-square border border-gray-150 bg-gray-50 rounded-xl overflow-hidden group">
                      <img src={fileObj.previewUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  <label className="border-2 border-dashed border-gray-250 hover:border-primary rounded-xl flex flex-col items-center justify-center aspect-square cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[9px] font-bold uppercase text-slate-500">Adicionar</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center border-t border-gray-50 pt-6 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition uppercase cursor-pointer"
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
                  className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 transition uppercase cursor-pointer"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !!uploadProgress}
                  className="flex items-center justify-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-md shadow-green-600/20 transition uppercase disabled:opacity-50 cursor-pointer"
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
