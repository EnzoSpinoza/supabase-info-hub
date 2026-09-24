import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Área do Barbeiro — Barbearia Fagundes" },
      { name: "description", content: "Acesso reservado à gestão da Barbearia Fagundes." },
      { property: "og:title", content: "Área do Barbeiro — Barbearia Fagundes" },
      { property: "og:description", content: "Acesso reservado à gestão da Barbearia Fagundes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      return;
    }
    navigate({ to: "/barbeiro" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-ink via-ink-soft to-ink font-body text-fog antialiased">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-iris/25 blur-[130px]" />
      </div>
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-fog/10 bg-fog/5 p-8 backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-iris">
          Barbearia Fagundes
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
          Painel do <span className="italic">barbeiro</span>
        </h1>
        <p className="mt-2 text-sm text-fog/60">
          Entre com o e-mail e a senha cadastrados para a barbearia.
        </p>
        <form className="mt-8 space-y-4" onSubmit={signIn}>
          <label className="block">
            <span className="text-xs text-fog/60">E-mail</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm placeholder:text-fog/30 focus:border-iris/50 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs text-fog/60">Senha</span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm placeholder:text-fog/30 focus:border-iris/50 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-iris py-3 font-medium text-primary-foreground ring-1 ring-fog/10 transition-colors hover:bg-iris/90 disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
        </form>
        <p className="mt-6 text-center text-xs text-fog/40">
          Não tem acesso? Crie o usuário da barbearia no painel do Supabase (Authentication →
          Users).
        </p>
      </div>
    </div>
  );
}
