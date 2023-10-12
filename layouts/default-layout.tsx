import { FC } from "react";
import Navigation from "components/navigation";
import PageHeader from "components/page-header";

const DefaultLayout: FC<{
  children: JSX.Element[] | JSX.Element;
  grid?: string;
}> = ({ children, grid }) => {
  return (
    <section className="section panel">
      <div className="wrapper">
        <div className="grid--centered">
          <div className="container-wrapper">
            <div className="container">
              <Navigation />
              <div className="inner-container">
                <PageHeader />
                <main>
                  <div className={`default-grid${grid ? ` ${grid}` : ""}`}>
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DefaultLayout;
