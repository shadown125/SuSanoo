import { trpc } from "../../../utils/trpc";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { getSuSAuthSession } from "../../../server/common/get-server-session";

const Panel: NextPage = () => {
    const { data } = trpc.useQuery(["auth.getSession"]);
    const router = useRouter();

    const logoutHandler = async () => {
        await router.push("/admin");
        await signOut();
    };

    return (
        <div>
            <h1 className="headline h1">This is Admin Panel</h1>
            <h2 className="headline h2">Hello {data?.user?.name}</h2>
            <button className="button" onClick={logoutHandler}>
                Logout
            </button>
        </div>
    );
};

export default Panel;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getSuSAuthSession(ctx);

    if (!session) {
        return {
            redirect: {
                destination: "/admin",
                permanent: false,
            },
        };
    }

    return { props: { session } };
};
