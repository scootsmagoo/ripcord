import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main} id="main-content" tabIndex={-1}>
        <header className={styles.intro}>
          <h1>Ripcord baseline infrastructure is live.</h1>
          <p>
            This starter is intentionally opinionated for WCAG accessibility and
            OWASP-aligned security from day one.
          </p>
        </header>

        <section aria-labelledby="next-steps-heading" className={styles.section}>
          <h2 id="next-steps-heading">Immediate next steps</h2>
          <ul className={styles.list}>
            <li>Connect to a Discord-compatible backend like Spacebar.</li>
            <li>Implement authentication with secure session cookies.</li>
            <li>Add channels, messaging, and real-time websocket updates.</li>
            <li>Automate accessibility and security checks in CI.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
