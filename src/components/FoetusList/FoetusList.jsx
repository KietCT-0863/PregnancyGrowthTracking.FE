import { useState, useEffect } from "react";
import { Baby, Trash2, Calendar, User, Clock } from "lucide-react";
import foetusService from "../../api/services/foetusService";
import growthStatsService from "../../api/services/growthStatsService";
import "./FoetusList.scss";

const INITIAL_FOETUS_STATE = {
  name: "",
  gender: ""
};

const PREGNANCY_FULL_TERM = 40; // Số tuần thai kỳ đủ

const FoetusList = () => {
  const [foetusList, setFoetusList] = useState([]);
  const [growthDataMap, setGrowthDataMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFoetus, setNewFoetus] = useState(INITIAL_FOETUS_STATE);

  const getLatestGrowthData = (growthData) => {
    if (!growthData?.length) return null;

    return [...growthData].sort((a, b) => {
      if (a.age !== b.age) return b.age - a.age;
      return new Date(b.date) - new Date(a.date);
    })[0];
  };

  const calculateDueDate = (age, date) => {
    if (!age || !date) return null;
    const measDate = new Date(date);
    const remainingWeeks = PREGNANCY_FULL_TERM - age;
    return new Date(measDate.getTime() + remainingWeeks * 7 * 24 * 60 * 60 * 1000);
  };

  const getGenderDisplay = (gender) => {
    if (!gender) return "Chưa xác định";
    
    const normalizedGender = String(gender).trim().toUpperCase();
    switch (normalizedGender) {
      case 'MALE':
      case 'NAM':
        return 'Nam';
      case 'FEMALE':
      case 'NỮ':
      case 'NU':
        return 'Nữ';
      default:
        return 'Chưa xác định';
    }
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

  const handleAddFoetus = async (e) => {
    e.preventDefault();
    try {
      await foetusService.createFoetus(newFoetus);
      setNewFoetus(INITIAL_FOETUS_STATE);
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteFoetus = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thai nhi này?")) return;
    
    try {
      await foetusService.deleteFoetus(id);
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
            onChange={e => setNewFoetus({ ...newFoetus, name: e.target.value })}
            required
            placeholder="Nhập tên thai nhi"
          />
        </div>
        <div className="form-group">
          <label>Giới tính:</label>
          <select
            value={newFoetus.gender}
            onChange={e => setNewFoetus({ ...newFoetus, gender: e.target.value })}
            required
          >
            <option value="">Chọn giới tính</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit">Thêm</button>
          <button type="button" onClick={() => setShowAddForm(false)}>Hủy</button>
        </div>
      </form>
    </div>
  );

  const renderFoetusItem = (foetus) => {
    const growthData = growthDataMap[foetus.foetusId];
    const latestGrowthData = getLatestGrowthData(growthData);
    const dueDate = latestGrowthData
      ? calculateDueDate(latestGrowthData.age, latestGrowthData.date)
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
                    Tuần {latestGrowthData.age}
                    <span className="measurement-date">
                      (Ngày đo: {new Date(latestGrowthData.date).toLocaleDateString("vi-VN")})
                    </span>
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
      <div className="foetus-list-header">
        <h2>Danh sách thai nhi</h2>
        <button className="add-foetus-btn" onClick={() => setShowAddForm(true)}>
          <Baby size={20} />
          Thêm thai nhi
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
