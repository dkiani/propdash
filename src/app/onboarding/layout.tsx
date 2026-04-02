import { AuthProvider } from "@/components/layout/AuthProvider";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
        {children}
      </div>
    </AuthProvider>
  );
}
