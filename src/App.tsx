import { Routes, Route } from "react-router-dom";

import MainMenu from "./pages/MainMenu/MainMenu";
import ManualPage from "./pages/ManualPage/ManualPage";
import Players from "./pages/Players/Players";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<MainMenu />}
      />
      <Route
        path="/manual"
        element={<ManualPage />}
      />
      <Route
        path="/players"
        element={<Players />}
      />
    </Routes>
  );
}

export default App;