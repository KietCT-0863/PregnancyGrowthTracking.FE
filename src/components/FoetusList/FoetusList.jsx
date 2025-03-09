import { useState, useEffect } from "react";
import { Baby, Trash2, Calendar, User, Clock } from "lucide-react";
import foetusService from "../../api/services/foetusService";
import growthStatsService from "../../api/services/growthStatsService";
import "./FoetusList.scss";

const FoetusList = () => {
  const [foetusList, setFoetusList] = useState([]);
  const [growthDataMap, setGrowthDataMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFoetus, setNewFoetus] = useState({
    name: "",
    gender: "",
  });

  // Hàm lấy dữ liệu mới nhất của thai nhi
  const getLatestGrowthData = (growthData) => {
    if (!growthData || !Array.isArray(growthData) || growthData.length === 0) {
      return null;
    }

    // Sắp xếp theo tuần thai và ngày đo mới nhất
    return [...growthData].sort((a, b) => {
      if (a.age !== b.age) {
        return b.age - a.age; // Sắp xếp theo tuần giảm dần
      }
      // Sử dụng trường date thay vì measurementDate
      return new Date(b.date) - new Date(a.date);
    })[0];
  };

  // Tính ngày dự sinh dựa trên tuần thai và ngày đo
  const calculateDueDate = (age, date) => {
    if (!age || !date) return null;

    // Sử dụng trường date làm mốc tính toán
    const measDate = new Date(date);
    const remainingWeeks = 40 - age; // 40 tuần là thời gian thai kỳ đủ
    const dueDate = new Date(
      measDate.getTime() + remainingWeeks * 7 * 24 * 60 * 60 * 1000
    );
    return dueDate;
  };

  // Fetch danh sách thai nhi và dữ liệu tăng trưởng
  const fetchData = async () => {
    try {
      setLoading(true);
      const foetusData = await foetusService.getFoetusList();
      console.log("Foetus data:", foetusData);

      // Fetch growth data cho mỗi thai nhi
      const growthPromises = foetusData.map((foetus) =>
        growthStatsService
          .getGrowthData(foetus.foetusId)
          .then((data) => {
            console.log(`Growth data for foetus ${foetus.foetusId}:`, data);
            return { [foetus.foetusId]: data };
          })
          .catch((error) => {
            console.error(
              `Error fetching growth data for foetus ${foetus.foetusId}:`,
              error
            );
            return { [foetus.foetusId]: null };
          })
      );

      const growthResults = await Promise.all(growthPromises);
      const combinedGrowthData = Object.assign({}, ...growthResults);
      console.log("Combined growth data:", combinedGrowthData);

      setFoetusList(foetusData);
      setGrowthDataMap(combinedGrowthData);
      setError(null);
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý thêm mới thai nhi
  const handleAddFoetus = async (e) => {
    e.preventDefault();
    try {
      await foetusService.createFoetus(newFoetus);
      setNewFoetus({ name: "", gender: "" });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Xử lý xóa thai nhi
  const handleDeleteFoetus = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thai nhi này?")) {
      try {
        // Log để kiểm tra id trước khi gọi API
        console.log("Deleting foetus ID:", id);

        await foetusService.deleteFoetus(id);
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div className="foetus-list-loading">Đang tải...</div>;
  }

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

      {showAddForm && (
        <div className="add-foetus-form">
          <form onSubmit={handleAddFoetus}>
            <div className="form-group">
              <label>Tên thai nhi:</label>
              <input
                type="text"
                value={newFoetus.name}
                onChange={(e) =>
                  setNewFoetus({ ...newFoetus, name: e.target.value })
                }
                required
                placeholder="Nhập tên thai nhi"
              />
            </div>
            <div className="form-group">
              <label>Giới tính:</label>
              <input
                type="text"
                value={newFoetus.gender}
                onChange={(e) =>
                  setNewFoetus({ ...newFoetus, gender: e.target.value })
                }
                required
                placeholder="Nhập giới tính thai nhi"
              />
            </div>
            <div className="form-actions">
              <button type="submit">Thêm</button>
              <button type="button" onClick={() => setShowAddForm(false)}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="foetus-list">
        {foetusList.length === 0 ? (
          <div className="no-data">Chưa có thai nhi nào được thêm</div>
        ) : (
          foetusList.map((foetus) => {
            const growthData = growthDataMap[foetus.foetusId];
            const latestGrowthData = getLatestGrowthData(growthData);
            const dueDate = latestGrowthData
              ? calculateDueDate(latestGrowthData.age, latestGrowthData.date)
              : null;

            return (
              <div key={foetus.id} className="foetus-item">
                <div className="foetus-info">
                  <Baby className="icon" />
                  <div className="details">
                    <h3>{foetus.name}</h3>
                    <div className="sub-info">
                      <span>
                        <User size={16} />
                        {foetus.gender === "MALE"
                          ? "Nam"
                          : foetus.gender === "FEMALE"
                          ? "Nữ"
                          : "Chưa xác định"}
                      </span>
                      {latestGrowthData && (
                        <>
                          <span className="pregnancy-week">
                            <Calendar size={16} />
                            Tuần {latestGrowthData.age}
                            <span className="measurement-date">
                              (Ngày đo:{" "}
                              {new Date(
                                latestGrowthData.date
                              ).toLocaleDateString("vi-VN")}
                              )
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
          })
        )}
      </div>
    </div>
  );
};

export default FoetusList;
