import { Routes, Route } from "react-router-dom";
import {
    SigninPage,
    SignupPage,
    ForgotPasswordPage,
    ResetPasswordPage,
    VerifyUserPage,
    HomePage,
    AuctionsPage,
    AuctionDetailPage,
    NotFoundPage,
    UserDashboard,
    BackofficeDashboard,
    UsersPage,
    ReportsPage,
    AdminAuctionsPage,
    RolesPage,
    TermsPage,
    PrivacyPage,
} from "@/pages/index";
import { UserRole } from "@/shared/types/auth.types";
import AuthLayout from "@/components/layout/AuthLayout";
import PublicLayout from "@/components/layout/PublicLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GuestRoute from "@/components/auth/GuestRoute";
import AuthCallbackHandler from "@/components/auth/AuthCallbackHandler";

export default function IndexRoot() {
    return (
        <>
            <AuthCallbackHandler />
            <Routes>
                {/* Rotas Públicas (Navegação Geral) */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/leiloes" element={<AuctionsPage />} />
                    <Route path="/auction/:id" element={<AuctionDetailPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />

                    {/* Rotas de Autenticação (Apenas para Visitantes Não Autenticados) */}
                    <Route element={<GuestRoute />}>
                        <Route path="/signin" element={<SigninPage />} />
                        <Route path="/auth/signin" element={<SigninPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* Alias do email */}
                        <Route path="/auth/verify-user" element={<VerifyUserPage />} />
                        <Route path="/verify-user" element={<VerifyUserPage />} /> {/* Alias do email */}
                    </Route>
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
                        <Route path="/backoffice/reports" element={<ReportsPage />} />
                        <Route path="/backoffice/auctions" element={<AdminAuctionsPage />} />
                        <Route path="/backoffice/roles" element={<RolesPage />} />
                    </Route>
                </Route>

                {/* Fallback 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    );
}