"use client";

import ActionCard from "@/components/common/ActionCard";

export default function UserDashboard() {

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* WELCOME SECTION */}
      <ActionCard
        title="Bem-vinda de volta, Ana!"
        subtitle="Você tem 2 leilões terminando hoje e 3 novas mensagens."
        buttonLabel="Explorar Leilões"
        onButtonClick={() => {}}
      />

    </div>
  );
}
