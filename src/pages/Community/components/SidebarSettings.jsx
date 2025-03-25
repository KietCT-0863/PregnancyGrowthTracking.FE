import { Settings, Users } from "lucide-react";
import "../styles/Sidebar.scss";

const SidebarSettings = () => {
  return (
    <div className="sidebar-section settings">
      <h2>Settings</h2>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-icon">
            <Settings size={18} />
          </div>
          <span>Tùy chỉnh thông báo</span>
        </div>
        <div className="setting-item">
          <div className="setting-icon">
            <Users size={18} />
          </div>
          <span>Riêng tư</span>
        </div>
      </div>
    </div>
  );
};

export default SidebarSettings; 