export function UserDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
                <p className="text-muted-foreground">Acompanhe seus lances e leilões favoritos.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold tracking-tight">Leilões Ativos</h3>
                    <div className="mt-2 text-3xl font-bold">0</div>
                </div>
                <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold tracking-tight">Lances Vencedores</h3>
                    <div className="mt-2 text-3xl font-bold">0</div>
                </div>
                <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold tracking-tight">Favoritos</h3>
                    <div className="mt-2 text-3xl font-bold">0</div>
                </div>
            </div>
        </div>
    );
}
