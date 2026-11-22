import { useEffect, useState } from "react";
import { api } from "../api/client";
import { getAuthToken } from "../utils/auth";

type AdminMe = { email: string; role: "ADMIN" | "STAFF" | "VIEWER" };
type ProductRow = {
  id: number; name: string; description: string | null; photo_url: string | null;
  region_code: string | null; price: number | null; in_stock: boolean | null;
};

export default function Admin() {
  const [me, setMe] = useState<AdminMe | null>(null);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    try {
      const [identity, products] = await Promise.all([
        api.get<AdminMe>("/admin/me"),
        api.get<ProductRow[]>("/admin/products"),
      ]);
      setMe(identity.data);
      setRows(products.data);
    } catch {
      setError("Access denied. Sign in with the email configured as ADMIN_EMAIL.");
    }
  }

  useEffect(() => {
    if (getAuthToken()) void load();
    else setError("Please sign in first.");
  }, []);

  async function save(row: ProductRow) {
    if (!row.region_code) return;
    setBusy(true);
    setError("");
    try {
      await api.put(`/admin/products/${row.id}/prices/${row.region_code}`, {
        price: me?.role === "ADMIN" ? row.price : null,
        inStock: row.in_stock,
      });
    } catch {
      setError("Could not save changes. Check your role and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="cc-page">
    <h1>Admin panel</h1>
    {me && <p>{me.email} · <strong>{me.role}</strong></p>}
    {error && <p role="alert">{error}</p>}
    <button type="button" onClick={() => void load()}>Refresh</button>
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead><tr><th>Product</th><th>Region</th><th>Price</th><th>Available</th><th>Save</th></tr></thead>
        <tbody>{rows.map((row, index) => <tr key={`${row.id}-${row.region_code}-${index}`}>
          <td>{row.name}</td><td>{row.region_code ?? "—"}</td>
          <td><input type="number" min="0" step="0.01" value={row.price ?? ""}
            disabled={me?.role !== "ADMIN"}
            onChange={event => setRows(old => old.map((item, i) => i === index ? {...item, price: Number(event.target.value)} : item))}/></td>
          <td><input type="checkbox" checked={Boolean(row.in_stock)} disabled={me?.role === "VIEWER"}
            onChange={event => setRows(old => old.map((item, i) => i === index ? {...item, in_stock: event.target.checked} : item))}/></td>
          <td><button type="button" disabled={busy || me?.role === "VIEWER"} onClick={() => void save(row)}>Save</button></td>
        </tr>)}</tbody>
      </table>
    </div>
    <p>Catalog metadata editing and role assignment are protected backend operations; this initial screen manages regional prices and availability.</p>
  </section>;
}
