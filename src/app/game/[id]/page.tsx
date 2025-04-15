"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GameOverview from "./GameOverview";

export default function GamePage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <GameOverview gameId={id} />
    </div>
  );
}
