"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link
        href="/"
        className={`${styles.navLink} ${
          pathname === "/" ? styles.navLinkActive : ""
        }`}
      >
        หน้าแรก
      </Link>
      <Link
        href="/calendar"
        className={`${styles.navLink} ${
          pathname === "/calendar" ? styles.navLinkActive : ""
        }`}
      >
        ปฏิทินวันลา
      </Link>
    </nav>
  );
}
