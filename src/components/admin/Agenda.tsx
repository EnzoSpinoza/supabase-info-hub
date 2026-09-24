import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  btnAlt,
  cardCls,
  fmtPrice,
  fmtTime,
  inputCls,
  localDate,
  STATUS_LABELS,
  tableCls,
  tdCls,
  thCls,
} from "./shared";

type Appt = {
  id: string;
  client_name: string;
  phone: string;
  date: string;
  time: string;
  status: string;
  package_id: string | null;
  services: { name: string; price: number } | null;
  membership_packages: { name: string } | null;
};

const statusTextCls: Record<string, string> = {
  booked: "text-fog/70",
  confirmed: "text-fog",
  completed: "text-iris",
  cancelled: "text-destructive",
};

function AppointmentsTable({ packageOnly = false }: { packageOnly?: boolean }) {
  const qc = useQueryClient();
  const [date, setDate] = useState(localDate());

  const appts = useQuery({
    queryKey: ["admin-appointments", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "id, client_name, phone, date, time, status, package_id, services(name, price), membership_packages(name)",
        )
        .eq("date", date)
        .order("time");
      if (error) throw error;
      return data as unknown as Appt[];
    },
    refetchInterval: 15000,
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
      if (status === "completed") {
        const appt = (appts.data ?? []).find((a) => a.id === id);
        if (appt?.services) {
          // Lança a entrada financeira do corte (ignorado se já existir).
          await supabase.from("financial_transactions").insert({
            appointment_id: id,
            type: "income",
            category: "Serviços",
            description: appt.services.name,
            amount: appt.services.price,
            transaction_date: appt.date,
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-appointments"] });
      qc.invalidateQueries({ queryKey: ["admin-finance"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-appointments"] }),
  });

  const rows = (appts.data ?? []).filter((a) =>
    packageOnly ? Boolean(a.package_id) : !a.package_id,
  );

  return (
    <div className={cardCls}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs text-fog/60">Escolha o dia</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </label>
        <button type="button" className={btnAlt} onClick={() => setDate(localDate())}>
          Voltar para hoje
        </button>
        <p className="ml-auto text-xs text-fog/50">Atualiza sozinho a cada 15s</p>
      </div>

      {appts.isLoading ? (
        <p className="py-10 text-center font-mono text-sm text-fog/50">Carregando…</p>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center font-mono text-sm text-fog/50">
          Nenhum agendamento neste dia.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className={tableCls}>
            <thead>
              <tr>
                <th className={thCls}>Hora</th>
                <th className={thCls}>Cliente</th>
                <th className={thCls}>Telefone</th>
                <th className={thCls}>{packageOnly ? "Plano" : "Serviço"}</th>
                <th className={thCls}>Status</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className={`${tdCls} font-mono`}>{fmtTime(a.time)}</td>
                  <td className={tdCls}>
                    <p className="font-medium">{a.client_name}</p>
                    {a.services && (
                      <p className="text-xs text-fog/50">
                        {a.services.name} · {fmtPrice(a.services.price)}
                      </p>
                    )}
                  </td>
                  <td className={`${tdCls} text-fog/60`}>{a.phone}</td>
                  <td className={`${tdCls} text-fog/60`}>
                    {packageOnly ? (a.membership_packages?.name ?? "Pacote") : "—"}
                  </td>
                  <td className={tdCls}>
                    <select
                      value={a.status}
                      onChange={(e) =>
                        setStatus.mutate({ id: a.id, status: e.target.value })
                      }
                      className={`rounded-lg border border-fog/10 bg-fog/5 px-2 py-1.5 text-xs focus:border-iris/50 focus:outline-none ${
                        statusTextCls[a.status] ?? "text-fog/70"
                      }`}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value} className="bg-ink text-fog">
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={tdCls}>
                    <button
                      type="button"
                      onClick={() => remove.mutate(a.id)}
                      className="text-xs text-fog/40 transition-colors hover:text-destructive"
                    >
                      Excluir
                    </button>
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

export function Agenda() {
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold">Agenda</h3>
      <p className="mt-1 text-sm text-fog/60">
        Exibindo o dia escolhido com atualização automática. Marque como "Concluído" para lançar o
        corte no Financeiro.
      </p>
      <div className="mt-5">
        <AppointmentsTable />
      </div>
    </div>
  );
}

export function AgendaPacotes() {
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold">Agenda de Pacotes</h3>
      <p className="mt-1 text-sm text-fog/60">
        Horários agendados por clientes de pacote — não aparecem na aba Agenda, que é só de cortes
        avulsos.
      </p>
      <div className="mt-5">
        <AppointmentsTable packageOnly />
      </div>
    </div>
  );
}
