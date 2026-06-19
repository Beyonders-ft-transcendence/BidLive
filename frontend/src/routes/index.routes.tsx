import { Routes, Route } from "react-router-dom"
import {
    SigninPage
} from "@/pages/index"
import AuthCallbackHandler from "@/components/auth/AuthCallbackHandler"

export default function IndexRoot()
{
    return (
        <>
            <AuthCallbackHandler />
            <Routes>
                <Route path="/" element={<SigninPage />} />
            </Routes>
        </>
    )
}