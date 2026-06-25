import { Routes, Route } from "react-router-dom";
import {
    SigninPage,
    HomePage,
    AuctionsPage,
    NotFoundPage,
    UserDashboard,
    BackofficeDashboard,
} from "@/pages/index";
import { UserRole } from "@/shared/types/auth.types";
import AuthLayout from "@/components/layout/AuthLayout";
import PublicLayout from "@/components/layout/PublicLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthCallbackHandler from "@/components/auth/AuthCallbackHandler";

export default function IndexRoot() {
    return (
        <>
            <AuthCallbackHandler />
            <Routes>
                {/* Rotas Públicas */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/leiloes" element={<AuctionsPage />} />
                    <Route path="/signin" element={<SigninPage />} />
                </Route>

                {/* Rotas Autenticadas (Plataforma/Backoffice) */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AuthLayout />}>
                        {/* Dashboards Base */}
                        <Route path="/user" element={<UserDashboard />} />
                        <Route path="/explore" element={<div>Explorar (Em Breve)</div>} />
                        
                        {/* Rotas exclusivas de Backoffice (SUPER_ADMIN / MONITOR) */}
                        <Route 
                            element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.MONITOR]} />}
                        >
                            <Route path="/backoffice/dashboard" element={<BackofficeDashboard />} />
                        </Route>
                    </Route>
                </Route>

                {/* Fallback 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    );
}