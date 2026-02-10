"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Guild = {
  id: string;
  name: string;
};

type LoadState = "idle" | "loading" | "done";

export function SpacebarConnect() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [csrfToken, setCsrfToken] = useState<string>("");

  const isBusy = status === "loading";
  const canSubmit = useMemo(
    () =>
      !isBusy &&
      login.trim().length > 0 &&
      password.length >= 8 &&
      csrfToken.length > 0,
    [csrfToken.length, isBusy, login, password],
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ login: login.trim(), password }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        if (response.status === 403) {
          await refreshCsrfToken();
        }
        throw new Error(result.error ?? "Login failed.");
      }

      await loadGuilds();
      setPassword("");
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
      setPassword("");
      setStatus("idle");
    }
  }

  return (
    <section className="panel" aria-labelledby="spacebar-connect-heading">
      <h2 id="spacebar-connect-heading">Connect to Spacebar</h2>
      <p className="panel-copy">
        Credentials are sent only to your own server-side route, which sets an
        encrypted HTTP-only session cookie.
      </p>

      <form className="form-grid" onSubmit={onSubmit} noValidate>
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
            {isBusy ? "Connecting..." : "Sign in and load guilds"}
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
