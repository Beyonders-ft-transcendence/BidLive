export function BackofficeDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard do Backoffice</h1>
                <p className="text-muted-foreground">Gerencie usuários, leilões e aprovações da plataforma.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold tracking-tight">Leilões Pendentes</h3>
                    <div className="mt-2 text-3xl font-bold text-amber-500">0</div>
                </div>
                <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold tracking-tight">Leilões Ativos</h3>
                    <div className="mt-2 text-3xl font-bold text-emerald-500">0</div>
                </div>
                <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold tracking-tight">Usuários</h3>
                    <div className="mt-2 text-3xl font-bold text-primary">0</div>
                </div>
                <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="font-semibold tracking-tight">Denúncias</h3>
                    <div className="mt-2 text-3xl font-bold text-destructive">0</div>
                </div>
            </div>
        </div>
    );
}
