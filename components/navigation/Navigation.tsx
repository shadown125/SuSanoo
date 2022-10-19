import { FC } from "react";
import Profile from "../profile/Profile";
import { useRouter } from "next/router";
import Link from "next/link";
import { links } from "../../content/navigation/links";

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
                            <Link href={item.path}>
                                <a className={`link is-icon is-nav ${item.icon}${router.pathname === item.path ? " is-active" : ""}`}>
                                    <span>{item.name}</span>
                                </a>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Navigation;
