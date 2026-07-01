import { Routes, Route } from "react-router-dom";
import {
    SigninPage,
    SignupPage,
    HomePage,
    AuctionsPage,
    AuctionDetailPage,
    NotFoundPage,
    UserDashboard,
    BackofficeDashboard,
    UsersPage,
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
                    <Route path="/auction/:id" element={<AuctionDetailPage />} />
                    <Route path="/signin" element={<SigninPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                </Route>

                {/* Rotas Autenticadas (Plataforma/Backoffice) */}
                <Route element={<ProtectedRoute />}>
                    {/* Portal do Usuário (Usa o Header Global) */}
                    <Route path="/user" element={<UserDashboard />} />

                    <Route element={<AuthLayout />}>
                        {/* Dashboards Base */}
                        <Route path="/explore" element={<div>Explorar (Em Breve)</div>} />
                    </Route>

                    {/* Rotas exclusivas de Backoffice (SUPER_ADMIN / MONITOR) */}
                    {/* Não usam AuthLayout porque têm o seu próprio Container (Sidebar + Header) */}
                    <Route 
                        element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.MONITOR]} />}
                    >
                        <Route path="/backoffice" element={<BackofficeDashboard />} />
                        <Route path="/backoffice/users" element={<UsersPage />} />
                    </Route>
                </Route>

                {/* Fallback 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    );
}