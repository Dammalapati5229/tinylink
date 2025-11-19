// src/pages/code/[code].tsx
import type { GetServerSideProps } from "next";

type Link = {
  code: string;
  target_url: string;
  total_clicks: number;
  last_clicked_at: string | null;
  created_at: string;
};

type Props = {
  link: Link;
  shortUrl: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const code = ctx.params?.code;

  if (typeof code !== "string") {
    return { notFound: true };
  }

  const host = ctx.req.headers.host || "localhost:3000";
  const baseUrl = process.env.BASE_URL || `http://${host}`;

  const res = await fetch(`${baseUrl}/api/links/${code}`);
  if (!res.ok) {
    return { notFound: true };
  }

  const link = (await res.json()) as Link;
  const shortUrl = `${baseUrl.replace(/\/$/, "")}/${link.code}`;

  return { props: { link, shortUrl } };
};

export default function CodeStats({ link, shortUrl }: Props) {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        maxWidth: "640px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
        Stats for <code>{link.code}</code>
      </h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
        }}
      >
        <p style={{ marginBottom: "8px" }}>
          <strong>Short URL:</strong> <code>{shortUrl}</code>
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Target URL:</strong>{" "}
          <a
            href={link.target_url}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#2563eb" }}
          >
            {link.target_url}
          </a>
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Total clicks:</strong> {link.total_clicks}
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Last clicked:</strong>{" "}
          {link.last_clicked_at
            ? new Date(link.last_clicked_at).toLocaleString()
            : "-"}
        </p>
        <p style={{ marginBottom: "8px" }}>
          <strong>Created at:</strong>{" "}
          {new Date(link.created_at).toLocaleString()}
        </p>
      </div>

      <p style={{ marginTop: "16px" }}>
        <a href="/" style={{ color: "#2563eb" }}>
          ← Back to dashboard
        </a>
      </p>
    </main>
  );
}
