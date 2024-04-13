import { Link, Outlet } from "react-router-dom";
import BasicMenu from "../components/BasicMenu";
import IMAGES from "../images/Images";

const Layout = () => {
  return (
    <>
      <nav>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link to="/">
            <img
              src={IMAGES.autosslLogo}
              alt="AutoSSL"
              style={{ width: 200, height: "auto", borderRadius: 1 }}
            />
          </Link>
          <BasicMenu />
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Layout;
