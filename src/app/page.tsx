import styles from "./page.module.css";
import { SpacebarConnect } from "@/components/spacebar-connect";

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
          <h2 id="next-steps-heading">Current integration focus</h2>
          <ul className={styles.list}>
            <li>Route authentication through server-owned API endpoints.</li>
            <li>Keep session state inside encrypted HTTP-only cookies.</li>
            <li>Validate every request/response boundary with schema checks.</li>
            <li>Keep all interactions keyboard and screen-reader friendly.</li>
          </ul>
        </section>

        <SpacebarConnect />
      </main>
    </div>
  );
}
