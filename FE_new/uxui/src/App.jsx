import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./AppRoutes";
import "./App.css";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute";
import Dashboard from "./pages/DashBoardAdmin/DashBoard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GrowthStandardList from './components/GrowthStandard/GrowthStandardList';

function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
