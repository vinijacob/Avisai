import { AppHeader } from "@/components/app-header";
import { AuthProvider } from "@/components/auth-provider";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthProvider>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">{children}</main>
    </AuthProvider>
  );
}
