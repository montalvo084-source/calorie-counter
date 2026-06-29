"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogCard from "@/components/LogCard";
import { useFoodSources } from "@/lib/food-sources-context";
import { useToast } from "@/lib/toast-context";
import type { DailyLog, Profile } from "@/lib/types";

export default function HistoryPage() {
  const { sources } = useFoodSources();
  const { showToast } = useToast();
  const router = useRouter();

  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [jumpDate, setJumpDate] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [logsRes, profileRes] = await Promise.all([
        fetch("/api/logs"),
        fetch("/api/profile"),
      ]);
      setLogs(await logsRes.json());
      setProfile(await profileRes.json());
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(date: string) {
    if (confirmDelete !== date) {
      setConfirmDelete(date);
      return;
    }
    await fetch(`/api/logs/${date}`, { method: "DELETE" });
    setLogs((prev) => prev.filter((l) => l.date !== date));
    setConfirmDelete(null);
    showToast("Log deleted.", "info");
  }

  function handleJump() {
    if (jumpDate) router.push(`/log?date=${jumpDate}`);
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const recent = logs.filter((l) => new Date(l.date) >= cutoff);
  const older = logs.filter((l) => new Date(l.date) < cutoff);

  if (loading || !profile) {
    return (
      <div className="pt-8 flex flex-col gap-3 animate-pulse">
        <div className="h-7 w-32 bg-surface rounded" />
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="pt-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-app-text">History</h1>
        <span className="text-xs text-secondary">{logs.length} logs</span>
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={jumpDate}
          onChange={(e) => setJumpDate(e.target.value)}
          className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text focus:border-accent focus:outline-none transition-colors"
        />
        <button
          onClick={handleJump}
          disabled={!jumpDate}
          className="px-4 py-2 bg-accent text-bg font-bold rounded-lg text-sm hover:bg-accent/80 transition-colors disabled:opacity-40"
        >
          Go
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-secondary text-sm">No logs yet. Start tracking today!</p>
        </div>
      ) : (
        <>
          {recent.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-secondary">Last 14 Days</h2>
              {recent.map((log) => (
                <div key={log.date} className="relative">
                  <LogCard log={log} sources={sources} profile={profile} onDelete={() => handleDelete(log.date)} />
                  {confirmDelete === log.date && (
                    <div className="absolute inset-0 bg-danger/10 border border-danger rounded-xl flex items-center justify-center gap-2">
                      <button onClick={() => handleDelete(log.date)} className="bg-danger text-white font-bold px-4 py-2 rounded-lg text-sm">
                        Confirm Delete
                      </button>
                      <button onClick={() => setConfirmDelete(null)} className="text-secondary text-sm">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {older.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-secondary">Earlier</h2>
              {older.map((log) => (
                <div key={log.date} className="relative">
                  <LogCard log={log} sources={sources} profile={profile} onDelete={() => handleDelete(log.date)} />
                  {confirmDelete === log.date && (
                    <div className="absolute inset-0 bg-danger/10 border border-danger rounded-xl flex items-center justify-center gap-2">
                      <button onClick={() => handleDelete(log.date)} className="bg-danger text-white font-bold px-4 py-2 rounded-lg text-sm">
                        Confirm Delete
                      </button>
                      <button onClick={() => setConfirmDelete(null)} className="text-secondary text-sm">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
