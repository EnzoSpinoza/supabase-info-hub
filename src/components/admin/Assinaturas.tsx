import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cardCls, fmtPrice, inputCls, tableCls, tdCls, thCls, thisMonth } from "./shared";

type Sub = {
  id: string;
  phone: string;
  client_name: string;
  period_month: string;
  status: string;
  paid: boolean;
  cancel_requested: boolean;
  membership_packages: { name: string; price: number } | null;
};

export function Assinaturas() {
  const qc = useQueryClient();
  const [month, setMonth] = useState(thisMonth());

  const subs = useQuery({
    queryKey: ["admin-subs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("package_subscriptions")
        .select("*, membership_packages(name, price)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Sub[];
    },
  });

  const markPaid = useMutation({
    mutationFn: async ({ id, paid }: { id: string; paid: boolean }) => {
      const { error } = await supabase
        .from("package_subscriptions")
        .update({ paid })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-subs"] }),
  });

  const rows = (subs.data ?? []).filter(
    (s) => (s.period_month ?? "").slice(0, 7) === month,
  );
  const paidCount = rows.filter((s) => s.paid).length;

  return (
    <div className={cardCls}>
      <h3 className="font-display text-2xl font-semibold">Assinaturas</h3>
      <p className="mt-1 text-sm text-fog/60">
        Assinantes do mês. Confirme quando o Pix cair marcando como pago.
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs text-fog/60">Mês</span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={inputCls}
          />
        </label>
        <p className="ml-auto text-sm text-fog/60">
          <span className="font-mono text-fog">{rows.length}</span> assinaturas ·{" "}
          <span className="font-mono text-iris">{paidCount}</span> pagas
        </p>
      </div>

      {subs.isLoading ? (
        <p className="py-10 text-center font-mono text-sm text-fog/50">Carregando…</p>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center font-mono text-sm text-fog/50">
          Nenhuma assinatura neste mês.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className={tableCls}>
            <thead>
              <tr>
                <th className={thCls}>Cliente</th>
                <th className={thCls}>Telefone</th>
                <th className={thCls}>Plano</th>
                <th className={thCls}>Mês</th>
                <th className={thCls}>Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className={tdCls}>
                    <p className="font-medium">{s.client_name}</p>
                    {s.cancel_requested && (
                      <p className="mt-0.5 text-xs text-destructive">
                        Pediu cancelamento para o mês
                      </p>
                    )}
                  </td>
                  <td className={`${tdCls} text-fog/60`}>{s.phone}</td>
                  <td className={`${tdCls} text-fog/60`}>
                    {s.membership_packages?.name ?? "—"}
                    {s.membership_packages && (
                      <span className="text-fog/40"> · {fmtPrice(s.membership_packages.price)}</span>
                    )}
                  </td>
                  <td className={`${tdCls} font-mono text-fog/60`}>{s.period_month}</td>
                  <td className={tdCls}>
                    {s.paid ? (
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-iris">PIX RECEBIDO</span>
                        <button
                          type="button"
                          onClick={() => markPaid.mutate({ id: s.id, paid: false })}
                          className="text-xs text-fog/40 transition-colors hover:text-fog"
                        >
                          Desmarcar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markPaid.mutate({ id: s.id, paid: true })}
                        className="rounded-full bg-iris px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-iris/90"
                      >
                        Marcar Pix recebido
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
