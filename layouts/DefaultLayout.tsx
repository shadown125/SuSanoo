import { FC } from "react";
import Navigation from "../components/navigation/Navigation";

const DefaultLayout: FC<{ children: JSX.Element[] | JSX.Element }> = ({ children }) => {
    return (
        <section className="section panel">
            <div className="wrapper">
                <div className="grid--centered">
                    <div className="container-wrapper">
                        <div className="container">
                            <Navigation />
                            <main>
                                <header className="page-header">
                                    <div className="container">
                                        <h1>This is header</h1>
                                    </div>
                                </header>
                                <div className="default-grid">{children}</div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DefaultLayout;
