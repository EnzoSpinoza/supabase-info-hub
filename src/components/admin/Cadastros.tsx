import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  btnAlt,
  btnPrimary,
  cardCls,
  fmtPrice,
  inputCls,
  tableCls,
  tdCls,
  thCls,
  WEEKDAYS,
} from "./shared";

/* ============ Clientes ============ */

type Client = { id: string; name: string; phone: string };

export function Clientes() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", phone: "" });

  const clients = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("name");
      if (error) throw error;
      return data as Client[];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("clients")
        .insert({ name: form.name, phone: form.phone });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ name: "", phone: "" });
      qc.invalidateQueries({ queryKey: ["admin-clients"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-clients"] }),
  });

  return (
    <div className={cardCls}>
      <h3 className="font-display text-2xl font-semibold">Clientes</h3>
      <p className="mt-1 text-sm text-fog/60">Cadastre e mantenha o telefone de cada cliente.</p>

      <form
        className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <label className="block">
          <span className="text-xs text-fog/60">Nome</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputCls}
            placeholder="Nome do cliente"
          />
        </label>
        <label className="block">
          <span className="text-xs text-fog/60">Telefone</span>
          <input
            required
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={inputCls}
            placeholder="(19) 90000-0000"
          />
        </label>
        <button type="submit" className={btnPrimary}>
          Adicionar
        </button>
      </form>
      {add.isError && (
        <p className="mt-2 text-sm text-destructive">Não foi possível salvar o cliente.</p>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className={tableCls}>
          <thead>
            <tr>
              <th className={thCls}>Nome</th>
              <th className={thCls}>Telefone</th>
              <th className={thCls}></th>
            </tr>
          </thead>
          <tbody>
            {(clients.data ?? []).map((c) => (
              <ClientRow key={c.id} c={c} onDelete={() => remove.mutate(c.id)} />
            ))}
          </tbody>
        </table>
        {clients.data?.length === 0 && (
          <p className="py-8 text-center font-mono text-sm text-fog/50">
            Nenhum cliente cadastrado ainda.
          </p>
        )}
      </div>
    </div>
  );
}

function ClientRow({ c, onDelete }: { c: Client; onDelete: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(c.name);
  const [phone, setPhone] = useState(c.phone);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("clients").update({ name, phone }).eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-clients"] }),
  });

  return (
    <tr>
      <td className={tdCls}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm hover:border-fog/10 focus:border-iris/50 focus:outline-none"
        />
      </td>
      <td className={tdCls}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm hover:border-fog/10 focus:border-iris/50 focus:outline-none"
        />
      </td>
      <td className={tdCls}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => save.mutate()}
            className="text-xs text-iris transition-colors hover:text-fog"
          >
            {save.isPending ? "Salvando…" : "Salvar"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-xs text-fog/40 transition-colors hover:text-destructive"
          >
            Excluir
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ============ Serviços ============ */

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
};

export function ServicosTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", price: "", description: "" });

  const services = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("price");
      if (error) throw error;
      return data as Service[];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("services").insert({
        name: form.name,
        price: Number(form.price.replace(",", ".")) || 0,
        description: form.description || null,
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ name: "", price: "", description: "" });
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return (
    <div className={cardCls}>
      <h3 className="font-display text-2xl font-semibold">Serviços e preços</h3>
      <p className="mt-1 text-sm text-fog/60">
        Tudo o que aparece no site. Desmarque "Ativo" para esconder um serviço do público.
      </p>

      <form
        className="mt-5 grid gap-3 md:grid-cols-[1fr_140px_1fr_auto] md:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <label className="block">
          <span className="text-xs text-fog/60">Nome</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputCls}
            placeholder="Ex.: Corte + Barba"
          />
        </label>
        <label className="block">
          <span className="text-xs text-fog/60">Preço (R$)</span>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className={inputCls}
            placeholder="35,00"
          />
        </label>
        <label className="block">
          <span className="text-xs text-fog/60">Descrição (opcional)</span>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={inputCls}
          />
        </label>
        <button type="submit" className={btnPrimary}>
          Adicionar
        </button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className={tableCls}>
          <thead>
            <tr>
              <th className={thCls}>Nome</th>
              <th className={thCls}>Preço</th>
              <th className={thCls}>Descrição</th>
              <th className={thCls}>Ativo</th>
              <th className={thCls}></th>
            </tr>
          </thead>
          <tbody>
            {(services.data ?? []).map((s) => (
              <ServiceRow key={s.id} s={s} />
            ))}
          </tbody>
        </table>
      </div>
      {add.isError && (
        <p className="mt-2 text-sm text-destructive">Não foi possível salvar o serviço.</p>
      )}
    </div>
  );
}

function ServiceRow({ s }: { s: Service }) {
  const qc = useQueryClient();
  const [name, setName] = useState(s.name);
  const [price, setPrice] = useState(String(s.price));
  const [description, setDescription] = useState(s.description ?? "");
  const [active, setActive] = useState(s.active);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("services")
        .update({
          name,
          price: Number(String(price).replace(",", ".")) || 0,
          description: description || null,
          active,
        })
        .eq("id", s.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return (
    <tr className={active ? "" : "opacity-50"}>
      <td className={tdCls}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm hover:border-fog/10 focus:border-iris/50 focus:outline-none"
        />
      </td>
      <td className={`${tdCls} whitespace-nowrap`}>
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 rounded-lg border border-transparent bg-transparent px-2 py-1 font-mono text-sm hover:border-fog/10 focus:border-iris/50 focus:outline-none"
        />
        <span className="ml-1 text-xs text-fog/40">{fmtPrice(price)}</span>
      </td>
      <td className={tdCls}>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm hover:border-fog/10 focus:border-iris/50 focus:outline-none"
        />
      </td>
      <td className={tdCls}>
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 accent-[var(--iris)]"
        />
      </td>
      <td className={tdCls}>
        <button
          type="button"
          onClick={() => save.mutate()}
          className="text-xs text-iris transition-colors hover:text-fog"
        >
          {save.isPending ? "Salvando…" : "Salvar"}
        </button>
      </td>
    </tr>
  );
}

/* ============ Horários ============ */

type Hour = { id: string; weekday: number; open_time: string; close_time: string; active: boolean };

export function HorariosTab() {
  const hours = useQuery({
    queryKey: ["admin-hours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_hours")
        .select("*")
        .order("weekday");
      if (error) throw error;
      return data as Hour[];
    },
  });

  return (
    <div className={cardCls}>
      <h3 className="font-display text-2xl font-semibold">Horários de funcionamento</h3>
      <p className="mt-1 text-sm text-fog/60">
        O que aparece na seção de horários do site. Desmarque "Aberto" para o dia ficar fechado.
      </p>
      <div className="mt-6 space-y-2">
        {WEEKDAYS.map((label, wd) => (
          <HourRow
            key={wd}
            label={label}
            weekday={wd}
            hour={(hours.data ?? []).find((h) => h.weekday === wd)}
          />
        ))}
      </div>
    </div>
  );
}

function HourRow({ label, weekday, hour }: { label: string; weekday: number; hour?: Hour }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(hour?.open_time?.slice(0, 5) ?? "09:00");
  const [close, setClose] = useState(hour?.close_time?.slice(0, 5) ?? "18:00");
  const [active, setActive] = useState(hour ? hour.active : false);

  const save = useMutation({
    mutationFn: async () => {
      if (hour) {
        const { error } = await supabase
          .from("business_hours")
          .update({ open_time: open, close_time: close, active })
          .eq("id", hour.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("business_hours")
          .insert({ weekday, open_time: open, close_time: close, active });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hours"] });
      qc.invalidateQueries({ queryKey: ["hours"] });
    },
  });

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border border-fog/10 bg-fog/5 px-4 py-3 ${
        active ? "" : "opacity-60"
      }`}
    >
      <span className="w-32 text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => setActive(e.target.checked)}
        className="h-4 w-4 accent-[var(--iris)]"
        aria-label="Aberto neste dia"
      />
      <span className="text-xs text-fog/60">Aberto</span>
      <input
        type="time"
        value={open}
        onChange={(e) => setOpen(e.target.value)}
        disabled={!active}
        className="rounded-lg border border-fog/10 bg-fog/5 px-2 py-1.5 font-mono text-sm focus:border-iris/50 focus:outline-none disabled:opacity-50"
      />
      <span className="text-fog/40">–</span>
      <input
        type="time"
        value={close}
        onChange={(e) => setClose(e.target.value)}
        disabled={!active}
        className="rounded-lg border border-fog/10 bg-fog/5 px-2 py-1.5 font-mono text-sm focus:border-iris/50 focus:outline-none disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className={btnAlt}
      >
        {save.isPending ? "Salvando…" : "Salvar"}
      </button>
    </div>
  );
}
