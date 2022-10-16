import type { NextPage } from "next";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
    const { data, isLoading } = trpc.useQuery(["example.hello", { text: "from tRPC" }]);

    return <div>{data ? <p>{data.greeting}</p> : <p>Loading..</p>}</div>;
};

export default Home;
