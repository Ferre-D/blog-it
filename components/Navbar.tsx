import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "../lib/context";

export default function Navbar() {
  const { user, username } = useContext(UserContext);

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link href="/">
            <a className="nav-title">BLOG-IT</a>
          </Link>
        </li>
        {/* user is signed in and has username*/}
        {username && (
          <>
            <li className="push-left">
              <Link href="/admin">
                <button className="btn-blue">Write Posts</button>
              </Link>
            </li>
            <li>
              <Link href={`/${username}`}>
                <img src={user?.photoURL} referrerPolicy="no-referrer" />
              </Link>
            </li>
          </>
        )}
        {/* user is not signed in and has username*/}
        {!username && (
          <li>
            <Link href="/enter">
              <button className="btn-blue">Log in</button>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
