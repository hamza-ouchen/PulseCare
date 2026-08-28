import { signOut } from "@/app/(app)/auth-actions";
import styles from "./SignOutButton.module.css";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button className={styles.button} type="submit">
        Se déconnecter
      </button>
    </form>
  );
}
