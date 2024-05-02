import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import NoPage from "./pages/NoPage";
import Servers from "./pages/Servers";
import WebServers from "./pages/WebServers";
import * as React from "react";
import VirtualHosts from "./pages/VirtualHosts";
import CreateCsr from "./pages/CreateCsr";
import DownloadCsr from "./pages/DownloadCsr";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="servers" element={<Servers />} />
          <Route path="/servers/:serverId/web-servers" Component={WebServers} />
          <Route
            path="/servers/:serverId/web-servers/:webServerId/domains"
            Component={VirtualHosts}
          />
          <Route path="/web-servers" Component={WebServers} />
          <Route
            path="/servers/:serverId/web-servers/:webServerId/domains/:virtualHostId/csr"
            Component={CreateCsr}
          />
          <Route
            path="/servers/:serverId/web-servers/:webServerId/domains/:virtualHostId/downloadCsr"
            Component={DownloadCsr}
          />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
