// pages/index.tsx
import { useEffect, useState } from "react";

type Link = {
  code: string;
  target_url: string;
  total_clicks: number;
  last_clicked_at: string | null;
  created_at: string;
};

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [targetUrl, setTargetUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function fetchLinks() {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data);
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrl,
          code: code.trim() || undefined,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to create link";
        try {
          const data = await res.json();
          if (data.error) msg = data.error;
        } catch {}
        setError(msg);
      } else {
        setTargetUrl("");
        setCode("");
        setSuccess("Link created successfully");
        await fetchLinks();
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Delete link "${code}"?`)) return;
    const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      alert("Failed to delete link");
      return;
    }
    await fetchLinks();
  }

  const filteredLinks = links.filter((link) => {
    const q = search.toLowerCase();
    return (
      link.code.toLowerCase().includes(q) ||
      link.target_url.toLowerCase().includes(q)
    );
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        maxWidth: "960px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700 }}>TinyLink Dashboard</h1>
        <p style={{ fontSize: "14px", color: "#555" }}>
          Shorten URLs, see stats, and manage your links.
        </p>
      </header>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Add new link</h2>
        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", fontSize: "14px", marginBottom: 4 }}>
              Target URL
            </label>
            <input
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com/docs"
              required
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", fontSize: "14px", marginBottom: 4 }}>
              Custom code (optional, 6–8 alphanumeric)
            </label>
            <input
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="mydocs1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              padding: "8px 16px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: loading ? "#999" : "#111",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating..." : "Create link"}
          </button>

          {error && (
            <p style={{ color: "red", fontSize: "13px", marginTop: "8px" }}>{error}</p>
          )}
          {success && (
            <p style={{ color: "green", fontSize: "13px", marginTop: "8px" }}>
              {success}
            </p>
          )}
        </form>
      </section>

      <section>
        <div
          style={{
            marginBottom: "8px",
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: "18px" }}>All links</h2>
          <input
            style={{
              flex: 1,
              maxWidth: "240px",
              padding: "6px 8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "13px",
            }}
            placeholder="Search by code or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredLinks.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#666" }}>No links yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "6px" }}>
                    Code
                  </th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "6px" }}>
                    Target URL
                  </th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "6px" }}>
                    Clicks
                  </th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "6px" }}>
                    Last clicked
                  </th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "6px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link) => (
                  <tr key={link.code}>
                    <td style={{ padding: "6px", whiteSpace: "nowrap" }}>
                      <a
                        href={`/code/${link.code}`}
                        style={{ color: "#2563eb", textDecoration: "underline" }}
                      >
                        {link.code}
                      </a>
                    </td>
                    <td
                      style={{
                        padding: "6px",
                        maxWidth: "260px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={link.target_url}
                    >
                      <a
                        href={link.target_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#111" }}
                      >
                        {link.target_url}
                      </a>
                    </td>
                    <td style={{ padding: "6px" }}>{link.total_clicks}</td>
                    <td style={{ padding: "6px" }}>
                      {link.last_clicked_at
                        ? new Date(link.last_clicked_at).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: "6px", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${window.location.origin}/${link.code}`
                          )
                        }
                        style={{
                          marginRight: "8px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleDelete(link.code)}
                        style={{
                          border: "1px solid #f87171",
                          color: "#b91c1c",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          cursor: "pointer",
                          backgroundColor: "white",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
