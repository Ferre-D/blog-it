import Link from "next/link";
import { useContext, useRef, useState } from "react";
import { UserContext } from "../lib/context";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { auth } from "../lib/firebase";

export default function Navbar() {
  const impactRef = useRef();
  const { user, username } = useContext(UserContext);
  const [showNav, setShowNav] = useState(false);
  useOutsideClick(impactRef, () => setShowNav(false));
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
            <li className="dropdown" ref={impactRef}>
              <img
                src={user?.photoURL}
                referrerPolicy="no-referrer"
                onClick={() => setShowNav(!showNav)}
              />
              <div className={`dropdown-content ${showNav && "show-nav"}`}>
                <Link href={`/${username}`}>
                  <p>My profile</p>
                </Link>
                <p onClick={() => auth.signOut()}>Logout</p>
              </div>
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
