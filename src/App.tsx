import { Routes, Route } from "react-router-dom";

import MainMenu from "./pages/MainMenu/MainMenu";
import ManualPage from "./pages/ManualPage/ManualPage";
import Players from "./pages/Players/Players";
import GamePage from "./pages/GamePage/GamePage";
import ArchivesPage from "./pages/ArchivesPage/ArchivesPage";

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

      <Route
        path="/game"
        element={<GamePage />}
      />
      <Route
        path="/archives"
        element={<ArchivesPage />}
      />
    </Routes>
  );
}

export default App;