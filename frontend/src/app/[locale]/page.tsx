import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-white tracking-wider">
          SIMRACING<span className="text-racing-red">SHOP</span>
        </h1>
        <p className="text-silver text-lg">
          Premium sim racing equipment for those who demand perfection
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-racing-red text-white font-semibold rounded-lg hover:bg-racing-red/90 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
