import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { btnPrimary, cardCls, inputCls } from "./shared";

export function MinhaConta() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function updateAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const values: { email?: string; password?: string } = {};
    if (email.trim()) values.email = email.trim();
    if (password) values.password = password;
    if (!values.email && !values.password) {
      setMessage("Preencha o novo e-mail ou a nova senha.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser(values);
    setLoading(false);
    if (error) {
      setMessage("Não foi possível atualizar. Verifique os dados e tente novamente.");
      return;
    }
    setEmail("");
    setPassword("");
    setMessage(values.email ? "Atualização solicitada. Confirme o novo e-mail pela mensagem recebida." : "Senha atualizada com sucesso.");
  }

  return (
    <div className={`${cardCls} max-w-xl`}>
      <h3 className="font-display text-2xl font-semibold">Minha conta</h3>
      <p className="mt-1 text-sm text-fog/60">Troque o e-mail de acesso ou defina uma nova senha.</p>
      <form onSubmit={updateAccount} className="mt-6 space-y-4">
        <label className="block"><span className="text-xs text-fog/60">Novo e-mail</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="novo@email.com" /></label>
        <label className="block"><span className="text-xs text-fog/60">Nova senha</span><input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="Mínimo de 6 caracteres" /></label>
        <button type="submit" disabled={loading} className={btnPrimary}>{loading ? "Salvando…" : "Atualizar conta"}</button>
        {message && <p className="text-sm text-fog/70">{message}</p>}
      </form>
    </div>
  );
}