// pages/healthz.ts
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "application/json");
  res.write(
    JSON.stringify({
      ok: true,
      version: "1.0",
      uptime: process.uptime(),
    })
    // You may add more fields if you want
  );
  res.end();
  return { props: {} as any };
};

export default function Healthz() {
  // Response is already sent in getServerSideProps
  return null;
}
