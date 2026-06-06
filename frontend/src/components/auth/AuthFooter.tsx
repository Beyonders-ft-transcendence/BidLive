import React from "react";
import Link from "next/link";

export default function AuthFooter() {
    return (
        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-4 border-t border-gray-50 pt-4 select-none">
            <Link href="#" className="hover:underline">
                Política de Privacidade
            </Link>
            <span>Copyright 2026</span>
        </div>
    );
}
