import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./AppRoutes";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
