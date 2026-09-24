import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { btnPrimary, cardCls, inputCls } from "./shared";

type Photo = { id: string; url: string; caption: string | null; active: boolean };

export function Fotos() {
  const qc = useQueryClient();
  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const photos = useQuery({
    queryKey: ["admin-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Photo[];
    },
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const path = `galeria/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage
        .from("barbearia-fotos")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("barbearia-fotos").getPublicUrl(path);
      const { error: e2 } = await supabase
        .from("photos")
        .insert({ url: data.publicUrl, caption: caption.trim() || null });
      if (e2) throw e2;
    },
    onSuccess: () => {
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["admin-photos"] });
      qc.invalidateQueries({ queryKey: ["photos"] });
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("photos").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-photos"] });
      qc.invalidateQueries({ queryKey: ["photos"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (p: Photo) => {
      const path = p.url.split("/barbearia-fotos/")[1];
      if (path) await supabase.storage.from("barbearia-fotos").remove([decodeURIComponent(path)]);
      const { error } = await supabase.from("photos").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-photos"] });
      qc.invalidateQueries({ queryKey: ["photos"] });
    },
  });

  return (
    <div className={cardCls}>
      <h3 className="font-display text-2xl font-semibold">Fotos da galeria</h3>
      <p className="mt-1 text-sm text-fog/60">
        Envie as fotos que aparecem na galeria do site. Desmarque "Ativa" para esconder sem apagar.
      </p>

      <form
        className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          const file = fileRef.current?.files?.[0];
          if (file) upload.mutate(file);
        }}
      >
        <label className="block">
          <span className="text-xs text-fog/60">Legenda (opcional)</span>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className={inputCls}
            placeholder="Ex.: Corte degradê"
          />
        </label>
        <label className="block">
          <span className="text-xs text-fog/60">Arquivo da foto</span>
          <input
            ref={fileRef}
            required
            type="file"
            accept="image/*"
            className="mt-1 w-full rounded-lg border border-fog/10 bg-fog/5 px-3 py-2 text-sm text-fog/70 file:mr-3 file:rounded-full file:border-0 file:bg-iris file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-foreground"
          />
        </label>
        <button type="submit" className={btnPrimary}>
          {upload.isPending ? "Enviando…" : "Enviar foto"}
        </button>
      </form>
      {upload.isError && (
        <p className="mt-2 text-sm text-destructive">
          Não foi possível enviar a foto. Tente um arquivo menor.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {(photos.data ?? []).map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl border border-fog/10 bg-fog/5 p-3 ${
              p.active ? "" : "opacity-50"
            }`}
          >
            <img
              src={p.url}
              alt={p.caption ?? "Foto"}
              className="aspect-[3/4] w-full rounded-xl object-cover"
            />
            {p.caption && <p className="mt-2 truncate text-xs font-medium">{p.caption}</p>}
            <div className="mt-2 flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => toggle.mutate({ id: p.id, active: !p.active })}
                className="text-iris transition-colors hover:text-fog"
              >
                {p.active ? "Esconder" : "Mostrar"}
              </button>
              <button
                type="button"
                onClick={() => remove.mutate(p)}
                className="text-fog/40 transition-colors hover:text-destructive"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
      {photos.data?.length === 0 && !photos.isLoading && (
        <p className="py-8 text-center font-mono text-sm text-fog/50">
          Nenhuma foto enviada ainda.
        </p>
      )}
    </div>
  );
}
