// Descarga del kit: en claude.ai usa la capacidad `downloads`;
// en la plataforma propia, un enlace de descarga normal.
type Downloads = { save: (r: { filename: string; data: string }) => Promise<unknown> };

export async function descargar(filename: string, data: string): Promise<"ok" | "rechazada" | "error"> {
  const c = (window as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
  if (c?.use) {
    const d = (await c.use("downloads").catch(() => null)) as Downloads | null;
    if (d) {
      try { await d.save({ filename, data }); return "ok"; }
      catch (e) { return (e as { code?: string }).code === "declined" ? "rechazada" : "error"; }
    }
  }
  try {
    const url = URL.createObjectURL(new Blob([data], { type: "text/markdown;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return "ok";
  } catch { return "error"; }
}
