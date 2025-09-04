import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Buttons | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Buttons page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function ButtonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}