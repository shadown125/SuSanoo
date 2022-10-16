import Head from "next/head";

const HeadPage = () => {
    return (
        <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta httpEquiv="X-UA-Compatible" content="ie=edge" />

            <meta name="author" content="Dawid Oleksiuk" />
            <meta name="description" content="susanoo cms" />
            <meta property="og:title" content="SuSanoo" />
            <meta property="og:type" content="website" />
            <meta property="og:description" content="susanoo cms" />
            <meta property="og:locale" content="pl_PL" />
            <meta property="og:locale:alternate" content="en_US" />
            <meta name="twitter:site" content="@DawidOleksiuk" />
            <meta name="twitter:title" content="SuSanoo" />
            <meta name="twitter:description" content="susanoo cms" />

            <meta name="format-detection" content="telephone=no" />
            <link rel="icon" type="image/png" href="/favicon.png" />
            <link rel="apple-touch-icon" href="/favicon.png" />

            <title>SuSanoo</title>
        </Head>
    );
};

export default HeadPage;
