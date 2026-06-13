"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Step = "email" | "password" | "processing";

const BACKGROUND_IMAGE = "/assets/pineforest.jpg";

const INITIAL_LINES = [""];

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [lines, setLines] = useState<string[]>(INITIAL_LINES);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch("/api/profile", { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.user?.role === "ADMIN") {
        router.replace("/admin");
        return;
      }

      await supabase.auth.signOut();
    };
    void run();
  }, [router, supabase]);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const append = (...items: string[]) => {
    setLines((prev) => [...prev, ...items]);
  };

  const resetTerminal = () => {
    setStep("email");
    setEmail("");
    setInputValue("");
    setLines(INITIAL_LINES);
  };

  const fail = (messages: string[]) => {
    setStep("processing");
    append(...messages, "SESSION RESET");
    window.setTimeout(() => {
      resetTerminal();
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputValue.trim();

    if (step === "email") {
      if (!value) return;
      append(`email: ${value}`);
      setEmail(value);
      setInputValue("");
      setStep("password");
      append("");
      return;
    }

    if (step === "password") {
      if (!value) return;
      append("password: ********");
      setStep("processing");

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: value,
        });

        if (error || !data.user) {
          fail([">> AUTHENTICATION FAILED"]);
          return;
        }

        const profileRes = await fetch("/api/profile", { cache: "no-store" });
        const profileJson = await profileRes.json().catch(() => null);

        if (!profileRes.ok || profileJson?.user?.role !== "ADMIN") {
          await supabase.auth.signOut();
          fail([">> TRYING TO HACK huh?", ">> Go F*** yourself this is restricted for admins."]);
          return;
        }

        append(
          ">> GOTCHA...",
          ">> REDIRECTING..."
        );

        window.setTimeout(() => {
          router.replace("/admin");
        }, 900);
      } catch {
        fail([">> YOU HAVE BROKE THE SYSTEM"]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center h-screen w-screen overflow-hidden bg-black text-white caret-white">
      <Image
        src={BACKGROUND_IMAGE}
        alt="Terminal Background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 w-full max-w-lg aspect-[14/10] rounded-2xl border border-black/50 bg-black/50 p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto pr-2 font-mono text-sm leading-relaxed">
          {lines.map((line, idx) => {
            let colorClass = "text-white caret-white";

            if (
              line.startsWith(">> AUTHENTICATION FAILED") ||
              line.startsWith(">> ACCESS DENIED") ||
              line.startsWith(">> ACCOUNT NOT FOUND") ||
              line.startsWith(">> CRITICAL TERMINAL ERROR")
            ) {
              colorClass = "text-red-400 font-semibold";
            }

            if (
              line.startsWith(">> ACCESS GRANTED") ||
              line.startsWith(">> REDIRECTING")
            ) {
              colorClass = "text-emerald-400 font-semibold";
            }

            return (
              <div key={`${line}-${idx}`} className={colorClass}>
                {line}
              </div>
            );
          })}

          {step !== "processing" && (
            <form onSubmit={handleSubmit} className="flex items-center gap-1 pt-1">
              <span className="text-white-400">
                {step === "email" ? "$ " : "password: "}
              </span>

              <input
                ref={inputRef}
                type={step === "email" ? "text" : "password"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoComplete={step === "email" ? "username" : "current-password"}
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                className="flex-1 border-none bg-transparent p-0 font-mono text-white-200 caret-white-400 outline-none focus:ring-0"
              />
            </form>
          )}

          <div ref={inputRef as unknown as React.RefObject<HTMLDivElement>} />
        </div>
      </div>
    </div>
  );
}
