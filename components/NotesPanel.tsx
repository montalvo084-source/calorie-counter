"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/toast-context";
import type { Note } from "@/lib/types";

export default function NotesPanel() {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((n: Note[]) => {
        setNotes(n);
        setLoaded(true);
      });
  }, []);

  async function handleAdd() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSaving(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed }),
    });
    if (res.ok) {
      const note: Note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setBody("");
    } else {
      showToast("Something went wrong.", "error");
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setConfirmDelete(null);
  }

  function formatTimestamp(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Anything important to remember..."
          rows={3}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-muted focus:border-accent focus:outline-none transition-colors resize-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || !body.trim()}
          className="w-full bg-accent text-bg font-bold py-2.5 rounded-lg text-sm hover:bg-accent/80 transition-colors disabled:opacity-40"
        >
          {saving ? "Saving…" : "+ Add Note"}
        </button>
      </div>

      {loaded && notes.length === 0 && (
        <p className="text-sm text-secondary text-center py-4">No notes yet.</p>
      )}

      {notes.length > 0 && (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-bg rounded-xl p-3 border border-border flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-app-text whitespace-pre-wrap break-words">{note.body}</p>
                <p className="text-[10px] text-muted mt-1">{formatTimestamp(note.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                className={`shrink-0 text-xs font-semibold px-2 py-1 rounded transition-colors ${
                  confirmDelete === note.id ? "bg-danger text-white" : "text-danger hover:bg-danger/10"
                }`}
              >
                {confirmDelete === note.id ? "Confirm?" : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
