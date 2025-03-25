import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./AppRoutes";
import "./App.css";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute";
import Dashboard from "./pages/DashBoardAdmin/DashBoard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GrowthStandardList from "./pages/GrowthStandard/GrowthStandardList";
import PaymentResult from './pages/Payment/PaymentResult';
import SoundEffectsProvider from "./components/SoundEffectsProvider";
import './global.css';

function App() {
  return (
    <AuthProvider>
      <SoundEffectsProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="light"
          limit={3}
        />
        <AppRoutes />
      </SoundEffectsProvider>
    </AuthProvider>
  );
}

export default App;
