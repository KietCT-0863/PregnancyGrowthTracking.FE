import { useState } from "react";
import { Music, Play, Pause } from "lucide-react";
import "../styles/Sidebar.scss";

const SidebarTunes = () => {
  const [playingId, setPlayingId] = useState(null);

  // Dữ liệu tĩnh, không yêu cầu API gọi
  const tunes = [
    { 
      id: 1, 
      name: "Giọng hát thai nhi", 
      type: "3 bài hát - 7 phút/bài"
    },
    { 
      id: 2, 
      name: "Âm nhạc êm dịu", 
      type: "4 bài hát"
    },
    { 
      id: 3, 
      name: "Nhạc mẹ hát ru", 
      type: "8 bài hát mẹ ru"
    },
    { 
      id: 4, 
      name: "Tiếng ồn trắng", 
      type: "5 tiếng - 20 phút/tệp"
    },
    { 
      id: 5, 
      name: "Nhạc thai giáo", 
      type: "7 phút/tệp"
    },
  ];

  // Giả lập việc phát nhạc
  const playSound = (tuneId) => {
    // Nếu đang phát thì dừng
    if (playingId === tuneId) {
      setPlayingId(null);
      return;
    }
    
    // Nếu không phát thì bắt đầu phát
    setPlayingId(tuneId);
    
    // Giả lập audio, chúng ta sẽ cải thiện khi fix được howler
    console.log("Đang phát tune ID:", tuneId);
  };

  return (
    <div className="sidebar-section tunes-pack">
      <h2>Tunes/Pack</h2>
      <div className="tunes-list">
        {tunes.map((tune) => (
          <div 
            key={tune.id} 
            className={`tune-item ${playingId === tune.id ? 'playing' : ''}`}
          >
            <div className="tune-avatar">
              <Music size={18} />
            </div>
            <div className="tune-info">
              <h3>{tune.name}</h3>
              <p>{tune.type}</p>
            </div>
            <button 
              className="play-button"
              onClick={() => playSound(tune.id)}
            >
              {playingId === tune.id ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarTunes; 