import "@/assets/styles/App.css"
import IndexRoot from "./routes/index.routes"
import { Toaster } from "sonner"
import { useEffect } from "react"
import { useAuthStore } from "@/shared/stores/auth.store"

export default function App()
{
  const accessToken = useAuthStore((state) => state.accessToken);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const reset = useAuthStore((state) => state.reset);

  useEffect(() => {
    if (accessToken) {
      fetchMe().catch((err) => {
        console.error("Erro ao validar sessão do usuário. Redirecionando para login...", err);
        reset();
      });
    }
  }, [accessToken, fetchMe, reset]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <IndexRoot />
    </>
  )
}