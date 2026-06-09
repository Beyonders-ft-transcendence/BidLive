"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "@/components/common/Modal";
import type { Category } from "@/types/category.types";
import { ItemCondition } from "@/types/auction.types";
import auctionService from "@/services/auction.service";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  const [form, setForm] = useState({
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setIsSubmitting(true);

    const {
      title,
      description,
      category_id,
      condition_type,
      starting_price,
      minimum_increment,
      reserve_price,
      buy_now_price,
      start_time,
      end_time,
    } = form;

    if (!title || !starting_price || !minimum_increment || !start_time || !end_time) {
      setCreateError("Os campos Título, Preço Inicial, Incremento e Datas são obrigatórios.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title,
        description,
        category_id: category_id ? Number(category_id) : null,
        condition_type,
        starting_price: Number(starting_price),
        minimum_increment: Number(minimum_increment),
        reserve_price: reserve_price ? Number(reserve_price) : null,
        buy_now_price: buy_now_price ? Number(buy_now_price) : null,
        start_time: new Date(start_time).toISOString(),
        end_time: new Date(end_time).toISOString(),
        is_draft: true, // starts as draft by default
      };

      const res = await auctionService.create(payload);
      if (res.success) {
        onClose();
        // Reset form
        setForm({
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
        });
        onSuccess();
      } else {
        setCreateError(res.message || "Erro ao criar leilão.");
      }
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || "Erro de rede ao criar leilão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Novo Lote de Leilão"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6 select-none text-left">
        {createError && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-sm flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{createError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Título do Item</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              placeholder="Ex: BMW X6 M Competition 2023"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Categoria</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs bg-white focus:ring-1 focus:ring-primary outline-none transition h-[34px]"
            >
              <option value="">Selecione a Categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase">Descrição do Lote</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none resize-none transition"
            placeholder="Descreva detalhes como estado, documentação, especificações técnicas..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Condição</label>
            <select
              value={form.condition_type}
              onChange={(e) => setForm({ ...form, condition_type: e.target.value as ItemCondition })}
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
              type="number"
              value={form.starting_price}
              onChange={(e) => setForm({ ...form, starting_price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              placeholder="Ex: 500000"
              min="0"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Incremento Mínimo (AOA)</label>
            <input
              type="number"
              value={form.minimum_increment}
              onChange={(e) => setForm({ ...form, minimum_increment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              placeholder="Ex: 1000"
              min="1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Preço de Reserva (Opcional)</label>
            <input
              type="number"
              value={form.reserve_price}
              onChange={(e) => setForm({ ...form, reserve_price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              placeholder="Preço mínimo para venda de fato"
              min="0"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Compra Imediata (Opcional)</label>
            <input
              type="number"
              value={form.buy_now_price}
              onChange={(e) => setForm({ ...form, buy_now_price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              placeholder="Valor para arremate imediato"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Início do Leilão</label>
            <input
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Término do Leilão</label>
            <input
              type="datetime-local"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-sm text-xs focus:ring-1 focus:ring-primary outline-none transition"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-sm uppercase"
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
