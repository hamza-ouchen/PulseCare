"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./login.module.css";

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Adresse email ou mot de passe incorrect."
            : "Connexion impossible. Vérifiez vos informations et réessayez.",
        );
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message.includes("Supabase configuration")
          ? "La connexion Supabase n’est pas configurée."
          : "Une erreur inattendue est survenue. Réessayez dans un instant.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-busy={isLoading}>
      <div className={styles.field}>
        <label htmlFor="email">Adresse email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          disabled={isLoading}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isLoading}
        />
      </div>

      {errorMessage && (
        <p className={styles.error} role="alert">
          <span aria-hidden="true">!</span>
          {errorMessage}
        </p>
      )}

      <button className={styles.submit} type="submit" disabled={isLoading}>
        {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
        {isLoading ? "Connexion en cours…" : "Enter Command Center"}
      </button>
    </form>
  );
}
