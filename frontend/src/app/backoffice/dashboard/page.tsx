import Header from "@/components/layout/backoffice/Header"

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-4">
            <Header />
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Welcome to the backoffice dashboard. Here you can manage your auctions, view statistics, and more.</p>
        </div>
    )
}