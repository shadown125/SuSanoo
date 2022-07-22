import type {AppProps} from 'next/app';

const MyApp = ({Component, pageProps}: AppProps) => {
    return (
        <div className="app">
            <Component {...pageProps} />
        </div>
    );
}

export default MyApp;
