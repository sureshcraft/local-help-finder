"use client";

import { useEffect, useRef, useState } from "react";

// Voice input via the Web Speech API (a cheap pitch "wow" many winners used — Postmeet, MedBridge).
// Zero deps, browser-native. `supported` is false where the API is missing (e.g. Firefox) — hide the
// mic button then. Default locale en-IN; pass "ta-IN"/"hi-IN" etc. to match a language toggle.

// Minimal typings for the (non-standard) SpeechRecognition API.
interface SpeechRec {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

export function useVoiceInput(lang = "en-IN") {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join("");
      setTranscript(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => { try { rec.stop(); } catch { /* noop */ } };
  }, [lang]);

  const start = () => {
    if (!recRef.current) return;
    setTranscript("");
    setListening(true);
    try { recRef.current.start(); } catch { /* already started */ }
  };
  const stop = () => {
    try { recRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  };

  return { listening, transcript, supported, start, stop };
}
