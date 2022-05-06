import Image from "next/image";

export default function UserProfile({ user }) {
  return (
    <div className="box-center d-sm-none d-md-block">
      <img src={user.photoURL} alt="user picture" className="card-img-center" />
      <p>
        <i>@{user.username}</i>
      </p>
      <h1>{user.displayName}</h1>
    </div>
  );
}
