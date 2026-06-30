import "@/assets/styles/App.css"
import IndexRoot from "./routes/index.routes"
import { Toaster } from "sonner"

export default function App()
{
  return (
    <>
      <Toaster position="top-right" richColors />
      <IndexRoot />
    </>
  )
}