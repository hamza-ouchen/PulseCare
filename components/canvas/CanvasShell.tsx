"use client";

import dynamic from "next/dynamic";

const CanvasRoot = dynamic(
  () => import("./CanvasRoot").then((module) => module.CanvasRoot),
  {
    ssr: false,
    loading: () => <div className="canvas-fallback" aria-hidden="true" />,
  },
);

export function CanvasShell() {
  return <CanvasRoot />;
}
