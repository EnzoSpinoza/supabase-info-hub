import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  btnDanger,
  btnPrimary,
  cardCls,
  fmtDateBR,
  fmtPrice,
  inputCls,
  monthRange,
  tableCls,
  tdCls,
  thCls,
  thisMonth,
} from "./shared";

type Transaction = {
  id: string;
  type: string;
  category: string;
  description: string | null;
  amount: number;
  transaction_date: string;
};

export function Financeiro() {
  const qc = useQueryClient();
  const [month, setMonth] = useState(thisMonth());
  const [form, setForm] = useState({
    type: "expense",
    category: "Materiais",
    description: "",
    amount: "",
    transaction_date: `${thisMonth()}-01`,
  });
  const [showCleanup, setShowCleanup] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const range = monthRange(month);

  const transactions = useQuery({
    queryKey: ["admin-finance", month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("id, type, category, description, amount, transaction_date")
        .gte("transaction_date", range.start)
        .lte("transaction_date", range.end)
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("financial_transactions").insert({
        ...form,
        amount: Number(form.amount.replace(",", ".")),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm((value) => ({ ...value, description: "", amount: "" }));
      qc.invalidateQueries({ queryKey: ["admin-finance"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financial_transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-finance"] }),
  });

  const cleanup = useMutation({
    mutationFn: async () => {
      const financeResult = await supabase
        .from("financial_transactions")
        .delete()
        .gte("transaction_date", range.start)
        .lte("transaction_date", range.end);
      if (financeResult.error) throw financeResult.error;
      const appointmentsResult = await supabase
        .from("appointments")
        .delete()
        .gte("date", range.start)
        .lte("date", range.end);
      if (appointmentsResult.error) throw appointmentsResult.error;
    },
    onSuccess: () => {
      setShowCleanup(false);
      setConfirmation("");
      qc.invalidateQueries({ queryKey: ["admin-finance"] });
      qc.invalidateQueries({ queryKey: ["admin-appointments"] });
    },
  });

  const rows = transactions.data ?? [];
  const income = rows.filter((row) => row.type === "income").reduce((sum, row) => sum + Number(row.amount), 0);
  const expenses = rows.filter((row) => row.type === "expense").reduce((sum, row) => sum + Number(row.amount), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold">Financeiro</h3>
          <p className="mt-1 text-sm text-fog/60">Entradas, saídas e saldo do mês escolhido.</p>
        </div>
        <label className="ml-auto block">
          <span className="text-xs text-fog/60">Mês</span>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls} />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Entradas" value={fmtPrice(income)} tone="text-iris" />
        <Metric label="Saídas" value={fmtPrice(expenses)} tone="text-destructive" />
        <Metric label="Saldo" value={fmtPrice(income - expenses)} tone={income - expenses >= 0 ? "text-fog" : "text-destructive"} />
      </div>

      <div className={cardCls}>
        <h4 className="font-display text-xl font-semibold">Novo lançamento</h4>
        <form
          className="mt-4 grid gap-3 md:grid-cols-5 md:items-end"
          onSubmit={(e) => { e.preventDefault(); add.mutate(); }}
        >
          <label className="block">
            <span className="text-xs text-fog/60">Tipo</span>
            <select value={form.type} onChange={(e) => setForm((v) => ({ ...v, type: e.target.value }))} className={inputCls}>
              <option className="bg-ink" value="income">Entrada</option>
              <option className="bg-ink" value="expense">Saída</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-fog/60">Categoria</span>
            <input required value={form.category} onChange={(e) => setForm((v) => ({ ...v, category: e.target.value }))} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-xs text-fog/60">Descrição</span>
            <input value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-xs text-fog/60">Valor (R$)</span>
            <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((v) => ({ ...v, amount: e.target.value }))} className={inputCls} />
          </label>
          <button className={btnPrimary} type="submit" disabled={add.isPending}>Salvar</button>
          <label className="block">
            <span className="text-xs text-fog/60">Data</span>
            <input required type="date" value={form.transaction_date} onChange={(e) => setForm((v) => ({ ...v, transaction_date: e.target.value }))} className={inputCls} />
          </label>
        </form>
        {add.isError && <p className="mt-3 text-sm text-destructive">Não foi possível salvar o lançamento.</p>}
      </div>

      <div className={cardCls}>
        <div className="overflow-x-auto">
          <table className={tableCls}>
            <thead><tr><th className={thCls}>Data</th><th className={thCls}>Tipo</th><th className={thCls}>Categoria</th><th className={thCls}>Descrição</th><th className={thCls}>Valor</th><th className={thCls}></th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className={`${tdCls} font-mono`}>{fmtDateBR(row.transaction_date)}</td>
                  <td className={tdCls}><span className={row.type === "income" ? "text-iris" : "text-destructive"}>{row.type === "income" ? "Entrada" : "Saída"}</span></td>
                  <td className={tdCls}>{row.category}</td>
                  <td className={`${tdCls} text-fog/60`}>{row.description ?? "—"}</td>
                  <td className={`${tdCls} font-mono`}>{fmtPrice(row.amount)}</td>
                  <td className={tdCls}><button type="button" onClick={() => remove.mutate(row.id)} className="text-xs text-fog/40 hover:text-destructive">Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!transactions.isLoading && rows.length === 0 && <p className="py-8 text-center font-mono text-sm text-fog/50">Nenhum lançamento neste mês.</p>}
        </div>
      </div>

      <div className="border-t border-fog/10 pt-5">
        {!showCleanup ? (
          <button type="button" className={btnDanger} onClick={() => setShowCleanup(true)}>Limpeza temporária do mês</button>
        ) : (
          <div className={`${cardCls} border-destructive/30`}>
            <p className="text-sm text-fog/70">Isso apaga todos os agendamentos e lançamentos de <strong>{month}</strong>. Digite <strong>APAGAR</strong> para confirmar.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="rounded-lg border border-destructive/30 bg-fog/5 px-3 py-2 text-sm focus:outline-none" />
              <button type="button" className={btnDanger} disabled={confirmation !== "APAGAR" || cleanup.isPending} onClick={() => cleanup.mutate()}>Apagar dados do mês</button>
              <button type="button" onClick={() => setShowCleanup(false)} className="text-sm text-fog/50 hover:text-fog">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className={cardCls}><p className="font-mono text-xs uppercase text-fog/50">{label}</p><p className={`mt-2 font-display text-3xl font-semibold ${tone}`}>{value}</p></div>;
}