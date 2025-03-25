import { User, MessageCircle, PhoneCall } from "lucide-react";
import "../styles/Sidebar.scss";

const SidebarContacts = () => {
  const contacts = [
    { id: 1, name: "Diễn đàn Thai kỳ", role: "Admin" },
    { id: 2, name: "Bác sĩ Lê Thu", role: "Bác sĩ" },
    { id: 3, name: "Nguyễn Thị Thanh Hoa", role: "Tư vấn dinh dưỡng" },
    { id: 4, name: "Lê Minh Tuấn", role: "Hỗ trợ kỹ thuật" },
  ];

  return (
    <div className="sidebar-section contacts">
      <h2>Contacts</h2>
      <div className="contacts-list">
        {contacts.map((contact) => (
          <div key={contact.id} className="contact-item">
            <div className="contact-avatar">
              <User size={18} />
            </div>
            <div className="contact-info">
              <h3>{contact.name}</h3>
              <p>{contact.role}</p>
            </div>
            <div className="contact-actions">
              <button className="contact-btn message"><MessageCircle size={14} /></button>
              <button className="contact-btn call"><PhoneCall size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarContacts; 