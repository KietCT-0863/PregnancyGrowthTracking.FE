import { useState, useEffect } from 'react';
import { Baby, Trash2, Calendar, User } from 'lucide-react';
import foetusService from '../../api/services/foetusService';
import './FoetusList.scss';

const FoetusList = () => {
  const [foetusList, setFoetusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFoetus, setNewFoetus] = useState({
    name: '',
    gender: ''
  });

  // Fetch danh sách thai nhi
  const fetchFoetusList = async () => {
    try {
      setLoading(true);
      const data = await foetusService.getFoetusList();
      setFoetusList(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoetusList();
  }, []);

  // Xử lý thêm mới thai nhi
  const handleAddFoetus = async (e) => {
    e.preventDefault();
    try {
      await foetusService.createFoetus(newFoetus);
      setNewFoetus({ name: '', gender: '' });
      setShowAddForm(false);
      fetchFoetusList();
    } catch (err) {
      setError(err.message);
    }
  };

  // Xử lý xóa thai nhi
  const handleDeleteFoetus = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thai nhi này?')) {
      try {
        // Log để kiểm tra id trước khi gọi API
        console.log('Deleting foetus ID:', id);
        
        await foetusService.deleteFoetus(id);
        fetchFoetusList();
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
        <button 
          className="add-foetus-btn"
          onClick={() => setShowAddForm(true)}
        >
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
                onChange={(e) => setNewFoetus({...newFoetus, name: e.target.value})}
                required
                placeholder="Nhập tên thai nhi"
              />
            </div>
            <div className="form-group">
              <label>Giới tính:</label>
              <input
                type="text"
                value={newFoetus.gender}
                onChange={(e) => setNewFoetus({...newFoetus, gender: e.target.value})}
                required
                placeholder="Nhập giới tính thai nhi"
              />
            </div>
            <div className="form-actions">
              <button type="submit">Thêm</button>
              <button type="button" onClick={() => setShowAddForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="foetus-list">
        {foetusList.length === 0 ? (
          <div className="no-data">Chưa có thai nhi nào được thêm</div>
        ) : (
          foetusList.map((foetus) => (
            <div key={foetus.id} className="foetus-item">
              <div className="foetus-info">
                <Baby className="icon" />
                <div className="details">
                  <h3>{foetus.name}</h3>
                  <div className="sub-info">
                    <span>
                      <User size={16} />
                      {foetus.gender}
                    </span>
                    {foetus.gestationalAge && (
                      <span>
                        <Calendar size={16} />
                        Tuần {foetus.gestationalAge}
                      </span>
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
          ))
        )}
      </div>
    </div>
  );
};

export default FoetusList;