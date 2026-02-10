"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { USERNAME_REGEX } from "@/lib/spacebar/schemas";

type Guild = {
  id: string;
  name: string;
};

type LoadState = "idle" | "loading" | "done";
type AuthMode = "login" | "signup";

export function SpacebarConnect() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [csrfToken, setCsrfToken] = useState<string>("");

  const isBusy = status === "loading";
  const usernameIsValid =
    mode !== "signup" ||
    (username.trim().length >= 2 && USERNAME_REGEX.test(username.trim()));

  const canSubmit = useMemo(
    () => {
      if (isBusy || csrfToken.length === 0 || password.length < 8) {
        return false;
      }

      if (mode === "login") {
        return login.trim().length > 0;
      }

      return (
        email.trim().length > 3 &&
        usernameIsValid &&
        dateOfBirth.length > 0 &&
        consent
      );
    },
    [
      consent,
      csrfToken.length,
      dateOfBirth,
      email,
      isBusy,
      login,
      mode,
      password,
      usernameIsValid,
    ],
  );

  async function refreshCsrfToken() {
    const response = await fetch("/api/auth/csrf", {
      method: "GET",
      cache: "no-store",
    });
    const result = (await response.json()) as { csrfToken?: string };
    if (!response.ok || !result.csrfToken) {
      throw new Error("Could not initialize CSRF protection.");
    }
    setCsrfToken(result.csrfToken);
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrapCsrf() {
      try {
        if (!cancelled) {
          await refreshCsrfToken();
        }
      } catch {
        if (!cancelled) {
          setError("Could not initialize CSRF protection.");
        }
      }
    }

    bootstrapCsrf();

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadGuilds() {
    const guildResponse = await fetch("/api/spacebar/guilds", {
      method: "GET",
      cache: "no-store",
    });
    const guildResult = (await guildResponse.json()) as {
      guilds?: Guild[];
      error?: string;
    };

    if (!guildResponse.ok || !guildResult.guilds) {
      throw new Error(guildResult.error ?? "Could not load guilds.");
    }

    setGuilds(guildResult.guilds);
    setStatus("done");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("loading");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { login: login.trim(), password }
          : {
              email: email.trim(),
              username: username.trim(),
              password,
              date_of_birth: dateOfBirth,
              consent: true,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as {
        error?: string;
        debug?: unknown;
      };

      if (!response.ok) {
        if (response.status === 403) {
          await refreshCsrfToken();
        }
        if (result.error) {
          if (result.debug) {
            throw new Error(
              `${result.error} (debug: ${JSON.stringify(result.debug)})`,
            );
          }
          throw new Error(result.error);
        }
        throw new Error("Authentication request failed.");
      }

      await loadGuilds();
      setPassword("");
      if (mode === "signup") {
        setMode("login");
      }
    } catch (requestError) {
      setStatus("idle");
      setGuilds([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong.",
      );
    }
  }

  async function onLogout() {
    setError(null);
    setStatus("loading");

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "x-csrf-token": csrfToken },
      });
    } finally {
      await refreshCsrfToken().catch(() => null);
      setGuilds([]);
      setLogin("");
      setEmail("");
      setUsername("");
      setDateOfBirth("");
      setConsent(false);
      setPassword("");
      setStatus("idle");
    }
  }

  return (
    <section className="panel" aria-labelledby="spacebar-connect-heading">
      <h2 id="spacebar-connect-heading">Connect to Spacebar</h2>
      <p className="panel-copy">
        Signup and login both run through your own server-side routes, which set
        an encrypted HTTP-only session cookie.
      </p>

      <div
        className="segmented-control"
        role="tablist"
        aria-label="Authentication mode"
      >
        <button
          role="tab"
          aria-selected={mode === "login"}
          className={mode === "login" ? "is-active" : undefined}
          type="button"
          onClick={() => setMode("login")}
          disabled={isBusy}
        >
          Login
        </button>
        <button
          role="tab"
          aria-selected={mode === "signup"}
          className={mode === "signup" ? "is-active" : undefined}
          type="button"
          onClick={() => setMode("signup")}
          disabled={isBusy}
        >
          Sign up
        </button>
      </div>

      <form className="form-grid" onSubmit={onSubmit} noValidate>
        {mode === "login" ? (
          <div className="form-field">
            <label htmlFor="login">Email or username</label>
            <input
              id="login"
              autoComplete="username"
              required
              value={login}
              onChange={(event) => setLogin(event.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                autoComplete="username"
                required
                minLength={2}
                maxLength={32}
                title="Use letters, numbers, dots, dashes, or underscores."
                aria-invalid={username.length > 0 && !usernameIsValid}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <p className="field-hint">
                Allowed: letters, numbers, <code>.</code>, <code>-</code>,{" "}
                <code>_</code>
              </p>
            </div>
            <div className="form-field">
              <label htmlFor="dob">Date of birth</label>
              <input
                id="dob"
                type="date"
                required
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
              />
            </div>
            <div className="checkbox-row">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <label htmlFor="consent">
                I agree to the Terms of Service and Privacy Policy.
              </label>
            </div>
          </>
        )}

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="actions">
          <button type="submit" disabled={!canSubmit}>
            {isBusy
              ? "Working..."
              : mode === "signup"
                ? "Create account and load guilds"
                : "Sign in and load guilds"}
          </button>
          <button
            type="button"
            onClick={onLogout}
            disabled={isBusy}
          >
            Clear session
          </button>
        </div>
      </form>

      <p className="status" role="status" aria-live="polite">
        {status === "done"
          ? `Loaded ${guilds.length} guild${guilds.length === 1 ? "" : "s"}.`
          : status === "loading"
            ? "Working..."
            : mode === "signup"
              ? "Open signup enabled."
              : "Not connected."}
      </p>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="guild-list" aria-label="Guilds">
        {guilds.map((guild) => (
          <li key={guild.id}>{guild.name}</li>
        ))}
      </ul>
    </section>
  );
}
