import axios from "axios";
import Env from "@/shared/utils/env.utils";

export const api = axios.create({
  baseURL: Env.API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});