import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Agenda, AgendaPacotes } from "@/components/admin/Agenda";
import { Assinaturas } from "@/components/admin/Assinaturas";
import { Clientes, HorariosTab, ServicosTab } from "@/components/admin/Cadastros";
import { Financeiro } from "@/components/admin/Financeiro";
import { Fotos } from "@/components/admin/Fotos";
import { MinhaConta } from "@/components/admin/MinhaConta";
import { cardCls, fmtPrice, localDate, monthRange, thisMonth } from "@/components/admin/shared";

export const Route = createFileRoute("/barbeiro")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Painel do Barbeiro — Barbearia Fagundes" },
      { name: "description", content: "Gestão da agenda, clientes, serviços, assinaturas e financeiro da Barbearia Fagundes." },
      { property: "og:title", content: "Painel do Barbeiro — Barbearia Fagundes" },
      { property: "og:description", content: "Área administrativa da Barbearia Fagundes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BarberPanel,
});

const tabs = ["Agenda", "Agenda de Pacotes", "Assinaturas", "Clientes", "Serviços", "Horários", "Fotos", "Financeiro", "Minha conta"] as const;
type Tab = (typeof tabs)[number];

function BarberPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Agenda");
  const stats = useDashboardStats();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink via-ink-soft to-ink font-body text-fog antialiased">
      <header className="sticky top-0 z-50 border-b border-fog/10 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <div><p className="font-display text-xl font-semibold">Fagundes<span className="text-iris">.</span></p><p className="font-mono text-[10px] uppercase text-fog/40">Painel do barbeiro</p></div>
          <div className="flex items-center gap-4"><a href="/" className="text-sm text-fog/60 hover:text-fog">Ver site</a><button type="button" onClick={signOut} className="rounded-full border border-fog/15 px-4 py-2 text-sm hover:bg-fog/5">Sair</button></div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8">
        <div className="mb-7"><p className="font-mono text-xs uppercase tracking-[0.28em] text-iris">Visão geral</p><h1 className="mt-2 font-display text-4xl font-bold">Gestão da barbearia</h1></div>
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <Stat label="Hoje" value={String(stats.data?.today ?? 0)} />
          <Stat label="Clientes" value={String(stats.data?.clients ?? 0)} />
          <Stat label="Serviços ativos" value={String(stats.data?.services ?? 0)} />
          <Stat label="Assinaturas" value={String(stats.data?.subscriptions ?? 0)} />
          <Stat label="Cortes no mês" value={String(stats.data?.completed ?? 0)} />
          <Stat label="Saldo do mês" value={fmtPrice(stats.data?.balance ?? 0)} />
        </div>

        <div className="mb-6 overflow-x-auto border-b border-fog/10">
          <div className="flex min-w-max gap-1">
            {tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`border-b-2 px-4 py-3 text-sm transition-colors ${tab === item ? "border-iris text-fog" : "border-transparent text-fog/50 hover:text-fog"}`}>{item}</button>)}
          </div>
        </div>

        {tab === "Agenda" && <Agenda />}
        {tab === "Agenda de Pacotes" && <AgendaPacotes />}
        {tab === "Assinaturas" && <Assinaturas />}
        {tab === "Clientes" && <Clientes />}
        {tab === "Serviços" && <ServicosTab />}
        {tab === "Horários" && <HorariosTab />}
        {tab === "Fotos" && <Fotos />}
        {tab === "Financeiro" && <Financeiro />}
        {tab === "Minha conta" && <MinhaConta />}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className={`${cardCls} p-4`}><p className="font-mono text-[10px] uppercase text-fog/50">{label}</p><p className="mt-2 font-display text-2xl font-semibold">{value}</p></div>;
}

function useDashboardStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = localDate();
      const range = monthRange(thisMonth());
      const [appointments, clients, services, subscriptions, completed, transactions] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("date", today),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("package_subscriptions").select("id", { count: "exact", head: true }).gte("period_month", range.start).lte("period_month", range.end),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "completed").gte("date", range.start).lte("date", range.end),
        supabase.from("financial_transactions").select("type, amount").gte("transaction_date", range.start).lte("transaction_date", range.end),
      ]);
      const failure = [appointments, clients, services, subscriptions, completed, transactions].find((result) => result.error);
      if (failure?.error) throw failure.error;
      const balance = (transactions.data ?? []).reduce((total, transaction) => total + (transaction.type === "income" ? Number(transaction.amount) : -Number(transaction.amount)), 0);
      return { today: appointments.count ?? 0, clients: clients.count ?? 0, services: services.count ?? 0, subscriptions: subscriptions.count ?? 0, completed: completed.count ?? 0, balance };
    },
    refetchInterval: 30000,
  });
}