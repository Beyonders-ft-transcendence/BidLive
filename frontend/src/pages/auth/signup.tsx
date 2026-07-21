import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/shared/stores/auth.store";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { signUpSchema, type SignUpInput } from "@/shared/schema/auth.schema";
import logoImg from "@/assets/images/logo.png";
import logoImgDark from "@/assets/images/logo2.png";
import { toast } from "sonner";
import ENV from "@/shared/utils/env.utils";

function SignupForm() {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const registerUser = useAuthStore((state) => state.register);
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
    const authorizeFortyTwo = useAuthStore((state) => state.authorizeFortyTwo);
    const isLoading = useAuthStore((state) => state.isLoading);

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors },
    } = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            full_name: "",
            username: "",
            email: "",
            password: "",
            password_confirm: "",
        },
    });

    const onSubmit = async (data: SignUpInput) => {
        try {
            await registerUser({
                email: data.email,
                username: data.username,
                full_name: data.full_name,
                password: data.password,
            });
            toast.success(t("auth.signup_success"));
            navigate("/signin");
        } catch (err: any) {
            console.error("Falha ao registrar:", err);
            const errMsg = useAuthStore.getState().error || t("auth.signup_error");
            toast.error(errMsg);
        }
    };

    const handleNextStep = async () => {
        // Valida apenas os campos do passo 1 antes de avançar
        const isValid = await trigger(["full_name", "username", "email"]);
        if (isValid) {
            setStep(2);
        }
    };

    const handleIntraLogin = async () => {
        try {
            const redirectUri = window.location.origin + "/";
            const url = await authorizeFortyTwo(redirectUri);
            if (url) {
                window.location.href = url;
            } else {
                toast.error(t("auth.intra_unavailable"));
            }
        } catch (err: any) {
            console.error("Falha ao autorizar 42:", err);
            toast.error(t("auth.intra_error"));
        }
    };

    const executeGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                await loginWithGoogle({ access_token: tokenResponse.access_token });
                toast.success(t("auth.google_success"));
                navigate("/user");
            } catch (error: any) {
                console.error("Erro na integração Google Auth do Backend:", error);
                toast.error(t("auth.google_error"));
            }
        },
        onError: () => {
            toast.error(t("auth.google_cancel"));
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center w-full font-sans bg-slate-200 dark:bg-slate-950 text-foreground p-4 sm:p-8">
            <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-card rounded-sm shadow-2xl overflow-hidden lg:h-[620px] max-h-[90vh] border border-border">
                {/* Left Column */}
                <div className="w-full lg:w-1/2 flex flex-col relative p-6 lg:p-8 bg-card overflow-y-auto">
                    {/* Form Container */}
                    <div className="flex-1 flex items-center justify-center py-2">
                        <div className="w-full max-w-[360px] flex flex-col items-center text-center">
                            {/* Logo */}
                            <Link to="/" className="flex items-center justify-center hover:opacity-80 transition-opacity w-fit mb-4">
                                <img src={logoImg} alt="BidLive Logo" className="h-8 object-contain dark:hidden" />
                                <img src={logoImgDark} alt="BidLive Logo" className="h-8 object-contain hidden dark:block" />
                            </Link>

                            <h1 className="text-2xl font-bold mb-1 text-foreground">{t("auth.create_account")}</h1>
                            <p className="text-muted-foreground text-sm mb-4">
                                {step === 1 ? t("auth.step1_title") : t("auth.step2_title")}
                            </p>

                            <div className="w-full text-left">
                                <div className="flex gap-3 mb-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => executeGoogleLogin()}
                                        className="flex-1 h-11 bg-background border border-border text-foreground hover:bg-muted rounded-sm font-semibold text-base transition-colors shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Google
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleIntraLogin}
                                        className="flex-1 h-11 bg-background border border-border text-foreground hover:bg-muted rounded-sm font-semibold text-base transition-colors shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <span className="font-bold text-lg leading-none">42</span>
                                        Intra 42
                                    </Button>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 border-t border-border"></div>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("auth.or")}</span>
                                    <div className="flex-1 border-t border-border"></div>
                                </div>

                                <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                                    {step === 1 && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-foreground">{t('auth.full_name')}</label>
                                                <div className="relative">
                                                    <Input
                                                        type="text"
                                                        placeholder={t("auth.full_name_placeholder")}
                                                        {...register("full_name")}
                                                        className={`h-10 bg-background border rounded-sm focus-visible:ring-1 shadow-sm w-full text-foreground placeholder:text-muted-foreground pr-32 ${errors.full_name ? 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive' : 'border-border focus-visible:ring-primary focus-visible:border-primary'}`}
                                                    />
                                                    {errors.full_name && (
                                                        <p className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-xs font-medium">
                                                            {errors.full_name.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-foreground">{t("auth.username")}</label>
                                                <div className="relative">
                                                    <Input
                                                        type="text"
                                                        placeholder={t("auth.username_placeholder")}
                                                        {...register("username")}
                                                        className={`h-10 bg-background border rounded-sm focus-visible:ring-1 shadow-sm w-full text-foreground placeholder:text-muted-foreground pr-32 ${errors.username ? 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive' : 'border-border focus-visible:ring-primary focus-visible:border-primary'}`}
                                                    />
                                                    {errors.username && (
                                                        <p className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-xs font-medium">
                                                            {errors.username.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-foreground">{t("auth.email")}</label>
                                                <div className="relative">
                                                    <Input
                                                        type="email"
                                                        placeholder={t("auth.email_placeholder")}
                                                        {...register("email")}
                                                        className={`h-10 bg-background border rounded-sm focus-visible:ring-1 shadow-sm w-full text-foreground placeholder:text-muted-foreground pr-32 ${errors.email ? 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive' : 'border-border focus-visible:ring-primary focus-visible:border-primary'}`}
                                                    />
                                                    {errors.email && (
                                                        <p className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-xs font-medium">
                                                            {errors.email.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleNextStep}
                                                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm font-semibold text-base transition-colors shadow-sm"
                                                >
                                                    {t("auth.continue")}
                                                </Button>
                                            </div>
                                        </>
                                    )}

                                    {step === 2 && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-foreground">{t("auth.password")}</label>
                                                <div className="relative">
                                                    <Input
                                                        type="password"
                                                        placeholder={t("auth.password_placeholder")}
                                                        {...register("password")}
                                                        className={`h-10 bg-background border rounded-sm focus-visible:ring-1 shadow-sm w-full text-foreground placeholder:text-muted-foreground pr-32 ${errors.password ? 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive' : 'border-border focus-visible:ring-primary focus-visible:border-primary'}`}
                                                    />
                                                    {errors.password && (
                                                        <p className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-xs font-medium">
                                                            {errors.password.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-foreground">{t("auth.password_confirm")}</label>
                                                <div className="relative">
                                                    <Input
                                                        type="password"
                                                        placeholder={t("auth.password_confirm_placeholder")}
                                                        {...register("password_confirm")}
                                                        className={`h-10 bg-background border rounded-sm focus-visible:ring-1 shadow-sm w-full text-foreground placeholder:text-muted-foreground pr-32 ${errors.password_confirm ? 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive' : 'border-border focus-visible:ring-primary focus-visible:border-primary'}`}
                                                    />
                                                    {errors.password_confirm && (
                                                        <p className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-xs font-medium">
                                                            {errors.password_confirm.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-2 flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    id="terms" 
                                                    checked={acceptedTerms}
                                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-1"
                                                />
                                                <label htmlFor="terms" className="text-xs text-foreground/80 leading-tight">
                                                    {t("legal.consent.agree_to_terms")} <Link to="/terms" className="text-primary hover:underline">{t("legal.consent.terms")}</Link> {t("legal.consent.and")} <Link to="/privacy" className="text-primary hover:underline">{t("legal.consent.privacy")}</Link>.
                                                </label>
                                            </div>

                                            <div className="pt-2 flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setStep(1)}
                                                    className="w-1/3 h-11 border border-border text-foreground hover:bg-muted rounded-sm font-semibold text-base transition-colors"
                                                >
                                                    {t("auth.back")}
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isLoading || !acceptedTerms}
                                                    className="w-2/3 h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm font-semibold text-base transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoading ? t("auth.creating") : t("auth.create_account")}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </form>

                                <div className="mt-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        {t("auth.has_account")} <Link to="/signin" className="text-primary font-semibold hover:underline">{t("auth.signin")}</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Artwork) */}
                <div className="hidden lg:flex w-1/2 h-full bg-secondary items-center justify-center relative overflow-hidden">
                    <div className="relative flex flex-col items-center">
                        {/* Top half circle */}
                        <div className="w-[240px] h-[120px] bg-primary rounded-t-full relative z-10" style={{ boxShadow: "inset 0px -4px 10px rgba(0,0,0,0.05)" }}></div>
                        {/* Blurry shadow reflection */}
                        <div className="w-[240px] h-[120px] bg-primary/40 blur-[40px] rounded-b-full relative -mt-4 z-0"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Signup() {
    const { t } = useTranslation();
    useDocumentTitle(t("auth.page_title_signup"));

    const googleClientId = ENV.GOOGLE_CLIENT_ID;

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <SignupForm />
        </GoogleOAuthProvider>
    );
}
