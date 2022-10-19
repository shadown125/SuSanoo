import { FC } from "react";
import Image from "next/future/image";
import { trpc } from "../../src/utils/trpc";

const Profile: FC = () => {
    const { data: user } = trpc.useQuery(["auth.getProfile"]);

    return (
        <>
            {user ? (
                <div className="profile">
                    <div className="image-wrapper">
                        <Image src={user.image as string} sizes="100vw" width={150} height={150} alt="Profile image" />
                    </div>
                    <div className="content">
                        <div className="name">{user.name}</div>
                        <div className="email">{user.email}</div>
                    </div>
                </div>
            ) : (
                <div className="profile">
                    <div className="image-wrapper"></div>
                </div>
            )}
        </>
    );
};

export default Profile;
