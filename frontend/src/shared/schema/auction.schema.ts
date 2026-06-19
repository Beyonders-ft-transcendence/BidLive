import { z } from "zod";
import { ItemCondition } from "@/types/auction.types";

export const createAuctionSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "O título do lote deve ter pelo menos 3 caracteres." }),
    description: z
      .string()
      .optional(),
    category_id: z
      .string()
      .min(1, { message: "Selecione uma categoria válida." }),
    condition_type: z
      .nativeEnum(ItemCondition, { message: "Condição inválida." }),
    starting_price: z
      .string()
      .min(1, { message: "O preço inicial é obrigatório." })
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "O preço inicial deve ser um número maior ou igual a 0.",
      }),
    minimum_increment: z
      .string()
      .min(1, { message: "O incremento mínimo é obrigatório." })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "O incremento mínimo deve ser maior que 0.",
      }),
    reserve_price: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: "O preço de reserva deve ser um número maior ou igual a 0.",
      }),
    buy_now_price: z
      .string()
      .optional()
      .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: "O preço de compra imediata deve ser um número maior ou igual a 0.",
      }),
    start_time: z
      .string()
      .min(1, { message: "A data e hora de início são obrigatórias." }),
    end_time: z
      .string()
      .min(1, { message: "A data e hora de término são obrigatórias." }),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_time).getTime();
      const end = new Date(data.end_time).getTime();
      return end > start;
    },
    {
      message: "A data de término deve ser posterior à data de início.",
      path: ["end_time"],
    }
  )
  .refine(
    (data) => {
      if (data.buy_now_price && Number(data.buy_now_price) < Number(data.starting_price)) {
        return false;
      }
      return true;
    },
    {
      message: "O preço de compra imediata deve ser maior ou igual ao preço inicial.",
      path: ["buy_now_price"],
    }
  )
  .refine(
    (data) => {
      if (data.reserve_price && Number(data.reserve_price) < Number(data.starting_price)) {
        return false;
      }
      return true;
    },
    {
      message: "O preço de reserva deve ser maior ou igual ao preço inicial.",
      path: ["reserve_price"],
    }
  );

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
