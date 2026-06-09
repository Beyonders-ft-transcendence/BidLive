"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Modal from "@/components/common/Modal";
import type { Category } from "@/types/category.types";
import { ItemCondition } from "@/types/auction.types";
import auctionService from "@/services/auction.service";
import { createAuctionSchema, type CreateAuctionInput } from "@/schema/auction.schema";

interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
}

export default function CreateAuctionModal({
  isOpen,
  onClose,
  categories,
  onSuccess,
}: CreateAuctionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
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

  const onSubmit = async (data: CreateAuctionInput) => {
    try {
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
      };

      const res = await auctionService.create(payload);
      if (res.success) {
        toast.success("Rascunho do leilão criado com sucesso!");
        onClose();
        reset();
        onSuccess();
      } else {
        toast.error(res.message || "Erro ao criar leilão.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro de rede ao criar leilão.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Criar Novo Lote de Leilão"
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 select-none text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Título do Item</label>
            <input
              type="text"
              {...register("title")}
              className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                errors.title ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-primary"
              }`}
              placeholder="Ex: BMW X6 M Competition 2023"
            />
            {errors.title && <p className="text-[10px] text-red-500 font-semibold">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Categoria</label>
            <select
              {...register("category_id")}
              className={`w-full px-3 py-2 border rounded-sm text-xs bg-white outline-none transition h-[34px] ${
                errors.category_id ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-primary"
              }`}
            >
              <option value="">Selecione a Categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="text-[10px] text-red-500 font-semibold">{errors.category_id.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase">Descrição do Lote</label>
          <textarea
            rows={3}
            {...register("description")}
            className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none resize-none transition"
            placeholder="Descreva detalhes como estado, documentação, especificações técnicas..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Condição</label>
            <select
              {...register("condition_type")}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs bg-white focus:ring-1 focus:ring-primary outline-none transition h-[34px]"
            >
              <option value={ItemCondition.NEW}>Novo (NEW)</option>
              <option value={ItemCondition.USED}>Usado (USED)</option>
              <option value={ItemCondition.REFURBISHED}>Recondicionado (REFURBISHED)</option>
              <option value={ItemCondition.DAMAGED}>Danificado (DAMAGED)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Preço Inicial (AOA)</label>
            <input
              type="text"
              {...register("starting_price")}
              className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                errors.starting_price ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-primary"
              }`}
              placeholder="Ex: 500000"
            />
            {errors.starting_price && (
              <p className="text-[10px] text-red-500 font-semibold">{errors.starting_price.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Incremento Mínimo (AOA)</label>
            <input
              type="text"
              {...register("minimum_increment")}
              className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                errors.minimum_increment ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-primary"
              }`}
              placeholder="Ex: 1000"
            />
            {errors.minimum_increment && (
              <p className="text-[10px] text-red-500 font-semibold">{errors.minimum_increment.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Preço de Reserva (Opcional)</label>
            <input
              type="text"
              {...register("reserve_price")}
              className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                errors.reserve_price ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-primary"
              }`}
              placeholder="Preço mínimo para venda de fato"
            />
            {errors.reserve_price && (
              <p className="text-[10px] text-red-500 font-semibold">{errors.reserve_price.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Compra Imediata (Opcional)</label>
            <input
              type="text"
              {...register("buy_now_price")}
              className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                errors.buy_now_price ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-primary"
              }`}
              placeholder="Valor para arremate imediato"
            />
            {errors.buy_now_price && (
              <p className="text-[10px] text-red-500 font-semibold">{errors.buy_now_price.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Início do Leilão</label>
            <input
              type="datetime-local"
              {...register("start_time")}
              className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                errors.start_time ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-primary"
              }`}
            />
            {errors.start_time && (
              <p className="text-[10px] text-red-500 font-semibold">{errors.start_time.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Término do Leilão</label>
            <input
              type="datetime-local"
              {...register("end_time")}
              className={`w-full px-3 py-2 border rounded-sm text-xs outline-none transition ${
                errors.end_time ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:ring-1 focus:ring-primary"
              }`}
            />
            {errors.end_time && (
              <p className="text-[10px] text-red-500 font-semibold">{errors.end_time.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              reset();
            }}
            className="px-5 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-sm uppercase cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold bg-primary hover:bg-primary/95 text-white rounded-sm uppercase disabled:opacity-50 flex items-center gap-1 cursor-pointer"
          >
            {isSubmitting ? "Cadastrando..." : "Confirmar Rascunho"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
