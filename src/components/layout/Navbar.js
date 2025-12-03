import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Image
            src="/logo.svg"
            alt="Agent Platform Logo"
            width={32}
            height={32}
            className={styles.logoIcon}
            priority
          />
          <span className={styles.logoText}>Agent Platform</span>
        </div>
        <div className={styles.links}>
          <Link href="/agent" className={styles.link}>Agent</Link>
          <Link href="/marketplace" className={styles.link}>Ground</Link>
          <Link href="/gallery" className={styles.link}>Library</Link>
        </div>
        <div className={styles.user}>
          <div className={styles.avatar}>U</div>
        </div>
      </div>
    </nav>
  );
}
