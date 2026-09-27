"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEnvelope,
  faFingerprint,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Step = "email" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  async function requestOtp(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setBusy(false);

    if (error) {
      setMessage({ text: error.message, error: true });
      return;
    }

    setStep("otp");
    setMessage({ text: "Revisa tu correo e ingresa el código de acceso." });
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "email",
    });

    setBusy(false);

    if (error) {
      setMessage({ text: error.message, error: true });
      return;
    }

    window.location.assign("/");
  }

  async function signInWithGoogle() {
    setBusy(true);
    setMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      setBusy(false);
      setMessage({ text: error.message, error: true });
      return;
    }

    if (data.url) {
      window.location.assign(data.url);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-quiet" aria-label="Kittyload">
        <div className="auth-brand">
          <span className="auth-brand__mark"><FontAwesomeIcon icon={faFingerprint} /></span>
          kittyload
        </div>
        <p className="auth-statement">Menos ruido.<br />Trabajo visible.</p>
        <span className="auth-note">Gestión colaborativa de actividades.</span>
      </section>

      <section className="auth-panel">
        <div className="auth-form">
          <div className="auth-icon"><FontAwesomeIcon icon={faFingerprint} /></div>
          <h1>Entrar a Kittyload</h1>
          <p className="auth-copy">
            Accede con un código de correo o continúa con Google.
          </p>

          {step === "email" ? (
            <form onSubmit={requestOtp}>
              <div className="auth-field">
                <label htmlFor="email">Correo</label>
                <div className="auth-input-wrap">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="tu@correo.com"
                    required
                  />
                </div>
              </div>
              <button className="auth-submit" type="submit" disabled={busy}>
                Enviar código <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp}>
              <div className="auth-field">
                <label htmlFor="otp">Código enviado a {email}</label>
                <div className="auth-input-wrap">
                  <FontAwesomeIcon icon={faKey} />
                  <input
                    id="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="000000"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <button className="auth-submit" type="submit" disabled={busy}>
                Verificar código <FontAwesomeIcon icon={faArrowRight} />
              </button>
              <button
                className="auth-back"
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setMessage(null);
                }}
              >
                Usar otro correo
              </button>
            </form>
          )}

          <div className="auth-divider"><span>o</span></div>

          <button className="auth-google" type="button" onClick={signInWithGoogle} disabled={busy}>
            <FontAwesomeIcon icon={faGoogle} /> Continuar con Google
          </button>

          {message && (
            <div className={`auth-message ${message.error ? "error" : ""}`} role="status">
              {message.text}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
