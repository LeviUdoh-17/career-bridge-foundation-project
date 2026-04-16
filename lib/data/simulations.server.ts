import "server-only";

import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import type { Simulation } from "@/types/simulation";

type SimulationRecord = Record<string, unknown>;

function normalizeSimulation(row: SimulationRecord): Simulation {
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    company: String(row.company ?? ""),
    discipline: String(row.discipline ?? ""),
    industry: String(row.industry ?? ""),
    candidateRole: String(row.candidateRole ?? row.candidate_role ?? ""),
    estimatedMinutes: String(row.estimatedMinutes ?? row.estimated_minutes ?? ""),
    scenarioBrief: String(row.scenarioBrief ?? row.scenario_brief ?? ""),
    prompts: Array.isArray(row.prompts) ? (row.prompts as Simulation["prompts"]) : [],
    videoUrl: (row.videoUrl ?? row.video_url ?? null) as string | null,
    passingScore: Number(row.passingScore ?? row.passing_score ?? 55),
  };
}

export const getSimulationById = cache(async (id: string): Promise<Simulation | null> => {
  const { data, error } = await supabaseAdmin
    .from("simulations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch simulation by id: ${error.message}`);
  }

  if (!data) return null;

  return normalizeSimulation(data as SimulationRecord);
});

export async function listSimulations(): Promise<Simulation[]> {
  const { data, error } = await supabaseAdmin
    .from("simulations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch simulations: ${error.message}`);
  }

  return (data ?? []).map((row) => normalizeSimulation(row as SimulationRecord));
}
