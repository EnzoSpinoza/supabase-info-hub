export const inputCls =
  "mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm text-fog/80 placeholder:text-fog/30 focus:border-iris/50 focus:outline-none";

export const cardCls = "rounded-2xl border border-fog/10 bg-fog/5 p-6 backdrop-blur-xl";

export const btnPrimary =
  "rounded-full bg-iris px-5 py-2.5 text-sm font-medium text-primary-foreground ring-1 ring-fog/10 transition-colors hover:bg-iris/90 disabled:opacity-50";

export const btnAlt =
  "rounded-full border border-fog/15 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fog/5 disabled:opacity-50";

export const btnDanger =
  "rounded-full border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50";

export const fmtPrice = (v: number | string) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtTime = (t: string) => (t ?? "").slice(0, 5);

export const localDate = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const thisMonth = () => localDate().slice(0, 7);

export const monthRange = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return { start: `${month}-01`, end: `${month}-${String(last).padStart(2, "0")}` };
};

export const fmtDateBR = (d: string) => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

export const WEEKDAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export const STATUS_LABELS: Record<string, string> = {
  booked: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const tableCls = "w-full min-w-[640px] text-left text-sm";

export const thCls =
  "border-b border-fog/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-fog/50";

export const tdCls = "border-b border-fog/5 px-3 py-3 align-middle";
