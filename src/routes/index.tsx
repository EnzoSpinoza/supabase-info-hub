import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import galleryCorte from "@/assets/gallery-corte.jpg";
import galleryBarba from "@/assets/gallery-barba.jpg";
import galleryNavalhado from "@/assets/gallery-navalhado.jpg";
import galleryStudio from "@/assets/gallery-studio.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Barbearia Fagundes — Cortes, Barba e Assinaturas em Pedreira-SP" },
      {
        name: "description",
        content:
          "Agende online seu corte, barba, navalhado e tratamentos. Planos de assinatura mensal a partir de R$ 79,90 e pagamento via Pix. Segunda a Sábado em Pedreira-SP.",
      },
      { property: "og:title", content: "Barbearia Fagundes — Cortes, Barba e Assinaturas" },
      {
        property: "og:description",
        content:
          "Agende online seu corte e barba. Assinaturas mensais e pagamento via Pix em Pedreira-SP.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const WEEKDAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const FALLBACK_PHOTOS = [
  { url: galleryCorte, caption: "Corte na máquina" },
  { url: galleryBarba, caption: "Barba na navalha" },
  { url: galleryNavalhado, caption: "Navalhado com risco" },
  { url: galleryStudio, caption: "Nosso espaço" },
];

const fmtPrice = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtTime = (t: string) => t.slice(0, 5);

function usePublicData() {
  const services = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, description, price")
        .eq("active", true)
        .order("price");
      if (error) throw error;
      return data;
    },
  });

  const packages = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_packages")
        .select("id, name, description, price, period")
        .eq("active", true)
        .order("price");
      if (error) throw error;
      return data;
    },
  });

  const hours = useQuery({
    queryKey: ["hours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_hours")
        .select("weekday, open_time, close_time")
        .eq("active", true)
        .order("weekday");
      if (error) throw error;
      return data;
    },
  });

  const settings = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_settings")
        .select("pix_key, pix_receiver_name, pix_city")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const photos = useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("url, caption")
        .eq("active", true)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  return { services, packages, hours, settings, photos };
}

function Index() {
  const { services, packages, hours, settings, photos } = usePublicData();

  const [form, setForm] = useState({
    client_name: "",
    phone: "",
    service_id: "",
    date: "",
    time: "",
  });
  const [booked, setBooked] = useState(false);

  const [subForm, setSubForm] = useState({ name: "", phone: "", packageId: "" as string });
  const [subResult, setSubResult] = useState<{
    success: boolean;
    paid?: boolean;
    price?: number;
    cancel_requested?: boolean;
    message?: string;
  } | null>(null);
  const [cancelMode, setCancelMode] = useState(false);

  const bookMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("appointments").insert({
        client_name: form.client_name,
        phone: form.phone,
        service_id: form.service_id || null,
        date: form.date,
        time: form.time,
      });
      if (error) throw error;
    },
    onSuccess: () => setBooked(true),
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("subscribe_to_package", {
        p_phone: subForm.phone,
        p_client_name: subForm.name,
        p_package_id: subForm.packageId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => setSubResult(data as typeof subResult),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("cancel_package_subscription", {
        p_phone: subForm.phone,
        p_package_id: subForm.packageId,
      });
      if (error) throw error;
      return data as { success: boolean; message?: string };
    },
    onSuccess: (data) => {
      if (data.success) setSubResult({ success: true, cancel_requested: true });
      else setSubResult(data);
    },
  });

  const galleryPhotos =
    photos.data && photos.data.length > 0 ? photos.data : FALLBACK_PHOTOS;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-ink via-ink-soft to-ink font-body text-fog antialiased">
      {/* glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-iris/25 blur-[130px]" />
        <div className="absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full bg-iris/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-iris/10 blur-[120px]" />
      </div>

      {/* header */}
      <header className="sticky top-0 z-50 border-b border-fog/10 bg-ink/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#" className="font-display text-xl font-semibold tracking-tight">
            Fagundes<span className="text-iris">.</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-fog/70 md:flex">
            <a href="#servicos" className="transition-colors hover:text-fog">Serviços</a>
            <a href="#assinaturas" className="transition-colors hover:text-fog">Assinaturas</a>
            <a href="#galeria" className="transition-colors hover:text-fog">Galeria</a>
            <a href="#horarios" className="transition-colors hover:text-fog">Horários</a>
            <a href="/barbeiro" className="transition-colors hover:text-fog">Painel do barbeiro</a>
          </nav>
          <a
            href="#agendar"
            className="rounded-full bg-iris px-4 py-2 text-sm font-medium text-primary-foreground ring-1 ring-fog/10 transition-colors hover:bg-iris/90"
          >
            Agendar
          </a>
        </div>
      </header>

      <main className="relative z-10">
        {/* hero */}
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <p className="animate-rise font-mono text-xs uppercase tracking-[0.28em] text-iris">
            Barbearia — Pedreira, SP
          </p>
          <h1 className="mt-6 max-w-3xl animate-rise font-display text-6xl leading-[0.95] font-bold tracking-tight text-balance [animation-delay:80ms] md:text-7xl">
            Onde o seu <span className="font-semibold italic text-fog">visual</span> encontra o
            seu melhor dia.
          </h1>
          <p className="mt-6 max-w-xl animate-rise text-lg text-pretty text-fog/70 [animation-delay:160ms]">
            Cortes, barba e rituais de cuidado, feitos por quem escuta antes de criar. Agende em
            segundos.
          </p>
          <div className="mt-9 flex animate-rise flex-wrap items-center gap-4 [animation-delay:240ms]">
            <a
              href="#agendar"
              className="rounded-full bg-iris px-6 py-3 font-medium text-primary-foreground ring-1 ring-fog/10 transition-colors hover:bg-iris/90"
            >
              Agendar horário
            </a>
            <a
              href="#assinaturas"
              className="rounded-full border border-fog/15 px-6 py-3 font-medium text-fog/90 transition-colors hover:bg-fog/5"
            >
              Ver assinaturas
            </a>
          </div>
          <div className="mt-16 grid animate-fade grid-cols-2 gap-4 [animation-delay:360ms] md:grid-cols-4">
            {[
              { label: "Serviços", value: String(services.data?.length ?? "—"), suffix: "" },
              { label: "Planos de assinatura", value: String(packages.data?.length ?? "—"), suffix: "" },
              { label: "A partir de", value: fmtPrice(15), suffix: "" },
              { label: "Atendimento", value: "Seg", suffix: "–Sáb" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-fog/10 bg-fog/5 p-5 backdrop-blur-xl"
              >
                <p className="font-mono text-xs text-fog/50">{s.label}</p>
                <p className="mt-2 font-display text-3xl font-semibold">
                  {s.value}
                  <span className="text-iris">{s.suffix}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* serviços */}
        <section id="servicos" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-fog/50">
                (01) — Serviços
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance">
                O cardápio da <span className="font-semibold italic">barbearia</span>
              </h2>
            </div>
            <p className="hidden max-w-xs text-sm text-pretty text-fog/60 md:block">
              Valores atualizados direto do nosso sistema. Confirme a duração no agendamento.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {(services.data ?? []).map((s) => (
              <div
                key={s.id}
                className="group rounded-2xl border border-fog/10 bg-fog/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-iris/40 hover:bg-fog/[0.09]"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl font-semibold">{s.name}</h3>
                  <span className="shrink-0 font-display text-2xl font-semibold text-iris">
                    {fmtPrice(Number(s.price))}
                  </span>
                </div>
                {s.description && (
                  <p className="mt-2 text-sm text-pretty text-fog/60">{s.description}</p>
                )}
              </div>
            ))}
            {services.isLoading && (
              <p className="col-span-full py-8 text-center font-mono text-sm text-fog/50">
                Carregando serviços…
              </p>
            )}
          </div>
        </section>

        {/* assinaturas */}
        <section id="assinaturas" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
          <div className="rounded-3xl border border-fog/10 bg-gradient-to-br from-iris/15 via-fog/5 to-transparent p-8 backdrop-blur-xl md:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-iris">
              (02) — Assinaturas
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-balance">
              Planeje o mês com um <span className="font-semibold italic">plano</span> que se paga
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(packages.data ?? []).map((p, i) => {
                const highlight = i === (packages.data?.length ?? 0) - 1;
                return (
                  <div
                    key={p.id}
                    className={
                      highlight
                        ? "rounded-2xl border border-iris/50 bg-iris/10 p-6 ring-1 ring-iris/30 backdrop-blur-xl"
                        : "rounded-2xl border border-fog/10 bg-fog/5 p-6 backdrop-blur-xl"
                    }
                  >
                    {highlight && (
                      <span className="inline-block rounded-full bg-iris px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary-foreground">
                        Mais completo
                      </span>
                    )}
                    <p
                      className={`mt-4 font-mono text-xs uppercase tracking-widest ${
                        highlight ? "text-iris" : "text-fog/50"
                      }`}
                    >
                      {p.name}
                    </p>
                    <p className="mt-2 font-display text-4xl font-bold">
                      {fmtPrice(Number(p.price))}
                      <span className="text-lg text-fog/50">/{p.period.replace("por ", "")}</span>
                    </p>
                    {p.description && (
                      <p className="mt-4 text-sm text-pretty text-fog/70">{p.description}</p>
                    )}
                    <button
                      onClick={() => {
                        setSubForm((f) => ({ ...f, packageId: p.id }));
                        setSubResult(null);
                        setCancelMode(false);
                        document
                          .getElementById("assinar-form")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={
                        highlight
                          ? "mt-6 block w-full rounded-full bg-iris py-2.5 text-center font-medium text-primary-foreground transition-colors hover:bg-iris/90"
                          : "mt-6 block w-full rounded-full border border-fog/15 py-2.5 text-center font-medium transition-colors hover:bg-fog/5"
                      }
                    >
                      Assinar
                    </button>
                  </div>
                );
              })}
            </div>

            {/* formulário de assinatura */}
            <div id="assinar-form" className="mt-8 scroll-mt-24 rounded-2xl border border-fog/10 bg-fog/5 p-6 backdrop-blur-xl">
              {subResult ? (
                <div className="text-center">
                  {!subResult.success ? (
                    <p className="font-medium text-destructive">
                      {subResult.message ?? "Não encontramos uma assinatura ativa com esses dados."}
                    </p>
                  ) : subResult.cancel_requested ? (
                    <div>
                      <p className="font-display text-2xl font-semibold text-iris">Cancelamento solicitado</p>
                      <p className="mt-2 text-sm text-fog/70">O pedido ficou registrado para a barbearia.</p>
                    </div>
                  ) : subResult.paid ? (
                    <div>
                      <p className="font-display text-2xl font-semibold text-iris">Sua assinatura deste mês já está paga</p>
                      <p className="mt-2 text-sm text-fog/70">Você já pode agendar seus horários normalmente.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-display text-2xl font-semibold text-iris">Assinatura registrada!</p>
                      <p className="mt-2 text-sm text-fog/70">Faça o Pix para ativar o plano deste mês.</p>
                      {settings.data?.pix_key && (
                        <div className="mx-auto mt-5 max-w-md rounded-xl border border-dashed border-iris/40 bg-iris/5 p-4 text-left">
                          <p className="font-mono text-xs uppercase text-fog/50">Chave Pix</p>
                          <code className="mt-2 block break-all font-mono text-sm text-fog/90">{settings.data.pix_key}</code>
                          <p className="mt-2 text-xs text-fog/50">{settings.data.pix_receiver_name}{settings.data.pix_city ? ` — ${settings.data.pix_city}` : ""}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <button type="button" onClick={() => setSubResult(null)} className="mt-5 text-sm text-fog/50 transition-colors hover:text-fog">Voltar</button>
                </div>
              ) : (
                <form
                  className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!subForm.packageId) return;
                    if (cancelMode) cancelMutation.mutate();
                    else subscribeMutation.mutate();
                  }}
                >
                  <label className="block">
                    <span className="text-xs text-fog/60">Nome</span>
                    <input
                      required
                      type="text"
                      value={subForm.name}
                      onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Seu nome"
                      className="mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm placeholder:text-fog/30 focus:border-iris/50 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-fog/60">Telefone / WhatsApp</span>
                    <input
                      required
                      type="tel"
                      value={subForm.phone}
                      onChange={(e) => setSubForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="(19) 90000-0000"
                      className="mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm placeholder:text-fog/30 focus:border-iris/50 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-fog/60">Plano</span>
                    <select
                      required
                      value={subForm.packageId}
                      onChange={(e) => setSubForm((f) => ({ ...f, packageId: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm text-fog/80 focus:border-iris/50 focus:outline-none"
                    >
                      <option value="" disabled>
                        Escolha um plano
                      </option>
                      {(packages.data ?? []).map((p) => (
                        <option key={p.id} value={p.id} className="bg-ink">
                          {p.name} — {fmtPrice(Number(p.price))}/{p.period}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    disabled={subscribeMutation.isPending || cancelMutation.isPending}
                    className="rounded-full bg-iris px-6 py-2.5 font-medium text-primary-foreground ring-1 ring-fog/10 transition-colors hover:bg-iris/90 disabled:opacity-50"
                  >
                    {subscribeMutation.isPending || cancelMutation.isPending
                      ? "Enviando…"
                      : cancelMode
                        ? "Solicitar cancelamento"
                        : "Assinar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCancelMode((value) => !value)}
                    className="text-sm text-fog/50 transition-colors hover:text-fog md:col-span-full md:justify-self-start"
                  >
                    {cancelMode ? "Quero assinar" : "Já é assinante? Cancelar assinatura"}
                  </button>
                </form>
              )}
              {(subscribeMutation.isError || cancelMutation.isError) && (
                <p className="mt-3 text-center text-sm text-destructive">
                  Não foi possível registrar. Tente novamente.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* galeria */}
        <section id="galeria" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-fog/50">
                (03) — Galeria
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance">
                Trabalhos recentes
              </h2>
            </div>
            <p className="hidden max-w-xs text-sm text-pretty text-fog/60 md:block">
              Um olhar discreto sobre o que sai das nossas mãos.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {galleryPhotos.map((p, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-fog/10 bg-fog/5 p-3 backdrop-blur-xl transition-colors duration-300 hover:border-iris/40"
              >
                <img
                  src={p.url}
                  alt={p.caption ?? "Foto da barbearia"}
                  loading="lazy"
                  width={768}
                  height={1024}
                  className="aspect-[3/4] w-full rounded-xl object-cover"
                />
                {p.caption && <p className="mt-3 text-sm font-medium">{p.caption}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* horários + pix */}
        <section id="horarios" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-fog/50">
            (04) — Horários
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance">
            Quando estamos abertos
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-fog/10 bg-fog/5 p-6 backdrop-blur-xl">
              <ul className="divide-y divide-fog/10 text-sm">
                {WEEKDAYS.map((label, wd) => {
                  const h = hours.data?.find((x) => x.weekday === wd);
                  return (
                    <li key={wd} className="flex items-center justify-between py-3">
                      <span className={h ? "text-fog/70" : "text-fog/40"}>{label}</span>
                      {h ? (
                        <span className="font-mono">
                          {fmtTime(h.open_time)} – {fmtTime(h.close_time)}
                        </span>
                      ) : (
                        <span className="font-mono text-fog/50">Fechado</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-xs text-fog/50">Pedreira — SP</p>
            </div>
            <div className="rounded-2xl border border-fog/10 bg-fog/5 p-6 backdrop-blur-xl">
              <p className="font-mono text-xs uppercase tracking-widest text-iris">
                (05) — Pagamento via Pix
              </p>
              <p className="mt-4 text-sm text-pretty text-fog/70">
                Pague com Pix usando a chave abaixo, ou direto no balcão.
              </p>
              {settings.data?.pix_key && (
                <div className="mt-5 rounded-xl border border-dashed border-iris/40 bg-iris/5 p-4">
                  <code className="font-mono text-sm break-all text-fog/80">
                    {settings.data.pix_key}
                  </code>
                  <p className="mt-2 text-xs text-fog/50">
                    {settings.data.pix_receiver_name}
                    {settings.data.pix_city ? ` — ${settings.data.pix_city}` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* agendamento */}
        <section id="agendar" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
          <div className="relative overflow-hidden rounded-3xl border border-fog/10 bg-gradient-to-br from-iris/20 via-fog/5 to-transparent p-8 backdrop-blur-xl md:p-12">
            <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-iris/20 blur-[90px]" />
            <div className="relative grid items-center gap-10 md:grid-cols-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-iris">
                  (06) — Agendamento
                </p>
                <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance md:text-5xl">
                  Reserve seu <span className="font-semibold italic">momento</span>
                </h2>
                <p className="mt-5 max-w-md text-pretty text-fog/70">
                  Preencha e a gente confirma pelo seu telefone. Assinantes têm prioridade na
                  agenda.
                </p>
              </div>
              {booked ? (
                <div className="rounded-2xl border border-iris/40 bg-iris/10 p-8 text-center">
                  <p className="font-display text-2xl font-semibold">Agendamento recebido!</p>
                  <p className="mt-2 text-sm text-fog/70">
                    Vamos confirmar seu horário em breve. Obrigado!
                  </p>
                  <button
                    onClick={() => {
                      setBooked(false);
                      setForm({ client_name: "", phone: "", service_id: "", date: "", time: "" });
                    }}
                    className="mt-6 rounded-full border border-fog/15 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-fog/5"
                  >
                    Fazer outro agendamento
                  </button>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    bookMutation.mutate();
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs text-fog/60">Nome</span>
                      <input
                        required
                        type="text"
                        value={form.client_name}
                        onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
                        placeholder="Seu nome"
                        className="mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm placeholder:text-fog/30 focus:border-iris/50 focus:outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-fog/60">Telefone</span>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="(19) 90000-0000"
                        className="mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm placeholder:text-fog/30 focus:border-iris/50 focus:outline-none"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-xs text-fog/60">Serviço</span>
                    <select
                      required
                      value={form.service_id}
                      onChange={(e) => setForm((f) => ({ ...f, service_id: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm text-fog/80 focus:border-iris/50 focus:outline-none"
                    >
                      <option value="" disabled>
                        Escolha um serviço
                      </option>
                      {(services.data ?? []).map((s) => (
                        <option key={s.id} value={s.id} className="bg-ink">
                          {s.name} — {fmtPrice(Number(s.price))}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs text-fog/60">Data</span>
                      <input
                        required
                        type="date"
                        min={today}
                        value={form.date}
                        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm text-fog/80 focus:border-iris/50 focus:outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-fog/60">Horário</span>
                      <input
                        required
                        type="time"
                        value={form.time}
                        onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm text-fog/80 focus:border-iris/50 focus:outline-none"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={bookMutation.isPending}
                    className="w-full rounded-full bg-iris py-3 font-medium text-primary-foreground ring-1 ring-fog/10 transition-colors hover:bg-iris/90 disabled:opacity-50"
                  >
                    {bookMutation.isPending ? "Enviando…" : "Confirmar agendamento"}
                  </button>
                  {bookMutation.isError && (
                    <p className="text-center text-sm text-destructive">
                      Não foi possível agendar. Verifique os dados e tente novamente.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-fog/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-fog/50 md:flex-row">
          <p className="font-display text-lg font-semibold text-fog">
            Fagundes<span className="text-iris">.</span> Barbearia
          </p>
          <p className="font-mono text-xs">© 2026 — Pedreira, São Paulo</p>
        </div>
      </footer>
    </div>
  );
}
