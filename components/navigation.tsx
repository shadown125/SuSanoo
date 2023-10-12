import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { links } from "content/navigation/links";
import Profile from "./profile/profile";

const Navigation: FC = () => {
  const router = useRouter();

  return (
    <div className="inner-panel navigation">
      <h1 className="headline h4">SuSanoo</h1>
      <Profile />
      <nav>
        <ul>
          {links.map((item, index) => (
            <li key={index}>
              <Link
                href={item.path}
                className={`link is-icon is-nav ${item.icon}${
                  router.pathname.includes(item.path) ? " is-active" : ""
                }`}
              >
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Navigation;
