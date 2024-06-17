import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import NoPage from "./pages/NoPage";
import Servers from "./pages/Servers";
import * as React from "react";
import VirtualHosts from "./pages/VirtualHosts";
import CreateCsr from "./pages/CreateCsr";
import DownloadCsr from "./pages/DownloadCsr";
import InstallCertificate from "./pages/InstallCertificate";
import Domain from "./pages/Domain";
import Server from "./pages/Server";
import WebServer from "./pages/WebServer";
import Certificate from "./pages/Certificate";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="servers" element={<Servers />} />
          <Route
            path="/servers/:serverId/web-servers/:webServerId"
            Component={WebServer}
          />
          <Route
            path="/servers/:serverId/web-servers/:webServerId/domains"
            Component={VirtualHosts}
          />
          <Route
            path="/servers/:serverId/web-servers/:webServerId/domains/:domainId/csr"
            Component={CreateCsr}
          />
          <Route
            path="/servers/:serverId/web-servers/:webServerId/domains/:domainId/downloadCsr"
            Component={DownloadCsr}
          />
          <Route
            path="/servers/:serverId/web-servers/:webServerId/domains/:domainId/installCertificate"
            Component={InstallCertificate}
          />
          <Route
            path="/servers/:serverId/web-servers/:webServerId/domains/:domainId/certificates/:certificateId"
            Component={Certificate}
          />
          <Route
            path="/servers/:serverId/web-servers/:webServerId/domains/:domainId/"
            Component={Domain}
          />
          <Route path="/servers/:serverId" Component={Server} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
