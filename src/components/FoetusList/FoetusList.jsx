import { useState, useEffect } from "react";
import { Baby, Trash2, Calendar, User, Clock } from "lucide-react";
import foetusService from "../../api/services/foetusService";
import growthStatsService from "../../api/services/growthStatsService";
import "./FoetusList.scss";
import { playNotificationSound, playDeleteSound } from "../../utils/soundUtils";

const INITIAL_FOETUS_STATE = {
  name: "",
  gender: ""
};

const PREGNANCY_FULL_TERM = 40; // Số tuần thai kỳ đủ

const GENDER_OPTIONS = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" }
];

const FoetusList = () => {
  const [foetusList, setFoetusList] = useState([]);
  const [growthDataMap, setGrowthDataMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFoetus, setNewFoetus] = useState(INITIAL_FOETUS_STATE);

  const getLatestGrowthData = (growthData) => {
    if (!growthData?.length) return null;

    // Chỉ sắp xếp theo ngày đo gần nhất để lấy dữ liệu mới nhất
    return [...growthData].sort((a, b) => {
      // Lấy ngày đo từ nhiều trường có thể
      const dateA = new Date(a.date || a.measurementDate || a.createdAt || a.updatedAt);
      const dateB = new Date(b.date || b.measurementDate || b.createdAt || b.updatedAt);
      
      // Sắp xếp ngày gần nhất lên đầu
      return dateB - dateA;
    })[0];
  };

  // Thêm hàm mới để lấy tuần thai lớn nhất
  const getHighestWeek = (growthData) => {
    if (!growthData?.length) return null;
    
    // Sắp xếp theo tuần thai giảm dần và lấy tuần cao nhất
    return [...growthData].sort((a, b) => b.age - a.age)[0].age;
  };

  const calculateDueDate = (age, date) => {
    if (!age || !date) return null;
    const measDate = new Date(date);
    const remainingWeeks = PREGNANCY_FULL_TERM - age;
    return new Date(measDate.getTime() + remainingWeeks * 7 * 24 * 60 * 60 * 1000);
  };

  const getGenderDisplay = (gender) => {
    if (!gender) return "Chưa xác định";
    return gender;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const foetusData = await foetusService.getFoetusList();
      
      const growthPromises = foetusData.map(foetus =>
        growthStatsService
          .getGrowthData(foetus.foetusId)
          .then(data => ({ [foetus.foetusId]: data }))
          .catch(() => ({ [foetus.foetusId]: null }))
      );

      const growthResults = await Promise.all(growthPromises);
      const combinedGrowthData = Object.assign({}, ...growthResults);

      setFoetusList(foetusData);
      setGrowthDataMap(combinedGrowthData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddForm = () => {
    console.log("Opening add foetus form");
    console.log("Current state:", { showAddForm, newFoetus });
    setShowAddForm(true);
  };

  const handleInputChange = (field, value) => {
    console.log("Input change:", { field, value });
    setNewFoetus(prev => {
      const updated = { ...prev, [field]: value };
      console.log("Updated foetus data:", updated);
      return updated;
    });
  };

  const handleAddFoetus = async (e) => {
    e.preventDefault();
    console.group("Adding New Foetus");
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.userId) {
        throw new Error("Vui lòng đăng nhập để thêm thai nhi");
      }

      if (!newFoetus.name.trim()) {
        throw new Error("Vui lòng nhập tên thai nhi");
      }
      if (!newFoetus.gender) {
        throw new Error("Vui lòng chọn giới tính");
      }

      const foetusData = {
        name: newFoetus.name.trim(),
        gender: newFoetus.gender
      };

      console.log("Submitting foetus data:", foetusData);

      const result = await foetusService.createFoetus(foetusData);
      console.log("API Response:", result);
      
      playNotificationSound();
      setNewFoetus(INITIAL_FOETUS_STATE);
      setShowAddForm(false);
      await fetchData();
      setError(null);

    } catch (err) {
      console.error("Create Foetus Error:", {
        error: err,
        message: err.message,
        response: err.response?.data
      });
      
      setError(err.message || "Không thể tạo thai nhi mới");
    } finally {
      console.groupEnd();
    }
  };

  const handleDeleteFoetus = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thai nhi này?")) return;
    
    try {
      await foetusService.deleteFoetus(id);
      playDeleteSound();
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="foetus-list-loading">Đang tải...</div>;

  const renderAddForm = () => (
    <div className="add-foetus-form">
      <form onSubmit={handleAddFoetus}>
        <div className="form-group">
          <label>Tên thai nhi:</label>
          <input
            type="text"
            value={newFoetus.name}
            onChange={e => handleInputChange('name', e.target.value)}
            required
            placeholder="Nhập tên thai nhi"
          />
        </div>
        <div className="form-group">
          <label>Giới tính:</label>
          <select
            value={newFoetus.gender}
            onChange={e => handleInputChange('gender', e.target.value)}
            required
            className="gender-select"
          >
            <option value="">Chọn giới tính</option>
            {GENDER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit">Thêm</button>
          <button 
            type="button" 
            onClick={() => {
              setShowAddForm(false);
              setNewFoetus(INITIAL_FOETUS_STATE);
              setError(null);
            }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );

  const renderFoetusItem = (foetus) => {
    const growthData = growthDataMap[foetus.foetusId];
    const latestGrowthData = getLatestGrowthData(growthData);
    
    // Lấy tuần thai cao nhất thay vì dùng tuần thai của dữ liệu mới nhất
    const highestWeek = growthData ? getHighestWeek(growthData) : null;
    
    const dueDate = latestGrowthData && highestWeek
      ? calculateDueDate(highestWeek, latestGrowthData.date || latestGrowthData.measurementDate || latestGrowthData.createdAt)
      : null;

    return (
      <div key={foetus.foetusId} className="foetus-item">
        <div className="foetus-info">
          <Baby className="icon" />
          <div className="details">
            <h3>{foetus.name}</h3>
            <div className="sub-info">
              <span className="gender-info">
                <User size={16} />
                {getGenderDisplay(foetus.gender)}
              </span>
              {latestGrowthData && (
                <>
                  <span className="pregnancy-week">
                    <Calendar size={16} />
                    Tuần {highestWeek || latestGrowthData.age}
                  </span>
                  <span className="measurement-date">
                    <Clock size={16} />
                    Ngày đo: {new Date(latestGrowthData.date || latestGrowthData.measurementDate || latestGrowthData.createdAt || latestGrowthData.updatedAt).toLocaleString("vi-VN", {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
     
                    })}
                  </span>
                  {dueDate && (
                    <span className="due-date">
                      <Clock size={16} />
                      Dự sinh: {dueDate.toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <button
          className="delete-btn"
          onClick={() => handleDeleteFoetus(foetus.foetusId)}
        >
          <Trash2 size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="foetus-list-container">
      <div className="blog-background">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
      
      <div className="foetus-list-header">
        <h2>Bé Yêu Của Mẹ</h2>
        <button className="add-foetus-btn" onClick={handleShowAddForm}>
          <Baby size={20} />
          Thêm Bé Cưng
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {showAddForm && renderAddForm()}

      <div className="foetus-list">
        {foetusList.length === 0 ? (
          <div className="no-data">Chưa có thai nhi nào được thêm</div>
        ) : (
          foetusList.map(renderFoetusItem)
        )}
      </div>
    </div>
  );
};

export default FoetusList;
