"use client";

export default function PlayerFooterText({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <p className="text-xs text-white/25">{children}</p>
  );
}
