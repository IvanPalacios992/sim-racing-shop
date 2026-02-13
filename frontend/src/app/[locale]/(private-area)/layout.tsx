import PrivateAreaLayout from "@/components/private-area/PrivateAreaLayout";
import PrivateAreaGuard from "@/components/private-area/PrivateAreaGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateAreaGuard>
      <PrivateAreaLayout>{children}</PrivateAreaLayout>
    </PrivateAreaGuard>
  );
}
