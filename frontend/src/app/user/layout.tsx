import UserHeader from "@/components/layout/user/Header";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <UserHeader />
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
        {children}
      </main>
    </div>
  );
}
