import Modal from "../common/Modal";
import Link from "next/link";
import { FacebookIcon, GoogleIcon } from "../common/Icons";
import Button from "../common/Button";
import Input from "../common/Input";

export default function Signin() {
    return (
        <Modal>
            <div className="bg-white p-6 rounded-sm w-98">
                <div>
                    <h2 className="text-3xl font-semibold mb-4" >
                        Entrar ou criar uma conta
                    </h2>
                    <p className="text-gray-600 text-sm" >
                        Ao clicar em qualquer um dos botões "Continuar" abaixo, você concorda com os <Link href="/terms" className="text-[#2563eb] hover:underline">Termos de Uso do BidLive</Link> e reconhece nossa <Link href="/privacy" className="text-[#2563eb] hover:underline">Política de Privacidade</Link>.
                    </p>
                </div>
                <div className="flex flex-col gap-3 mt-6">
                    <Button variant="primary" fullWidth icon={<FacebookIcon />}>
                        Continuar com Facebook
                    </Button>
                    <Button variant="outline" fullWidth icon={<GoogleIcon />}>
                        Continuar com Google
                    </Button>
                </div>
                <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="text-gray-500 text-sm">ou</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>
                    <div className="flex flex-col gap-8">
                        <Input 
                            type="email" 
                            placeholder="seu@email.com"
                            fullWidth
                        />
                        <Button variant="primary" fullWidth>
                            Continuar
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}