import Head from "next/head";
import { FC } from "react";

const HeadPage: FC = () => {
    return (
        <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
            <meta name="format-detection" content="telephone=no" />
        </Head>
    );
};

export default HeadPage;
