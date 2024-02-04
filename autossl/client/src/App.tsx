import "./App.css";
import WebServersPage from "./components/WebServersPage";

export default function App() {
  return (
    <div className="border">
      <h1 className="text-primary">Autossl</h1>
      <p>Input the name of a server to get its installed web servers</p>
      <WebServersPage />
    </div>
  );
}
