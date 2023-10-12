import { CSSProperties, FC } from "react";
import Image from "next/image";

const UserProfile: FC<{
  image: string;
  name: string;
  status: boolean;
  email?: string;
  page?: string | null;
  component?: string | null;
}> = ({ image, name, status, email, page, component }) => {
  const setProfileStatusColor = (status: boolean): CSSProperties => {
    return {
      "--color-profile-status": status
        ? "var(--color-green)"
        : "var(--color-red)",
    } as CSSProperties;
  };

  return (
    <div className="user-profile">
      <div className="image-wrapper" style={setProfileStatusColor(status)}>
        <Image
          src={image as string}
          sizes="100vw"
          width={100}
          height={100}
          alt="Profile image"
        />
      </div>
      <div className="info">
        <div className="name">{name}</div>
        {email && <div className="email">{email}</div>}
        {page && <div className="page">{page}</div>}
        {component && <div className="component">{component}</div>}
      </div>
    </div>
  );
};

export default UserProfile;
