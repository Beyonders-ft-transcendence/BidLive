import { Routes, Route } from "react-router-dom"
import {
    SigninPage
} from "@/pages/index"

export default function IndexRoot()
{
    return (
        <Routes>
            <Route path="/" element={<SigninPage />} />
        </Routes>
    )
}