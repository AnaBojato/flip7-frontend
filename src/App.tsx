import { Routes, Route } from "react-router-dom";

import MainMenu from "./pages/MainMenu/MainMenu";
import ManualPage from "./pages/ManualPage/ManualPage";

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
    </Routes>
  );
}

export default App;