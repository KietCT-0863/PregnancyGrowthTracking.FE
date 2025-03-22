import { Search, Plus } from "lucide-react"
import PropTypes from 'prop-types'
import './NotesFilter.scss';

const NotesFilter = ({
  searchTerm,
  setSearchTerm,
  dateFilterType,
  setDateFilterType,
  selectedDate,
  setSelectedDate,
  filterType,
  setFilterType,
  onAddNote
}) => {
  return (
    <div className="sidebar">
      <div className="search-box">
        <input
          type="text"
          placeholder="Tìm kiếm ghi chú..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="search-icon" size={20} />
      </div>

      <div className="date-filter-section">
        <div className="filter-tabs">
          <button
            className={dateFilterType === "all" ? "active" : ""}
            onClick={() => {
              setDateFilterType("all")
              setSelectedDate("")
            }}
          >
            Tất cả
          </button>
          <button
            className={dateFilterType === "day" ? "active" : ""}
            onClick={() => setDateFilterType("day")}
          >
            Ngày
          </button>
          <button
            className={dateFilterType === "week" ? "active" : ""}
            onClick={() => setDateFilterType("week")}
          >
            Tuần
          </button>
          <button
            className={dateFilterType === "month" ? "active" : ""}
            onClick={() => setDateFilterType("month")}
          >
            Tháng
          </button>
        </div>
        {dateFilterType !== "all" && (
          <div className="date-picker">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        )}
      </div>

      <div className="filter-section">
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tất cả ghi chú</option>
          <option value="recent">3 tháng gần đây</option>
          <option value="older">Cũ hơn</option>
        </select>
      </div>

      <button className="add-note-button" onClick={onAddNote}>
        <Plus size={20} />
        Thêm ghi chú mới
      </button>
    </div>
  )
}

NotesFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  dateFilterType: PropTypes.string.isRequired,
  setDateFilterType: PropTypes.func.isRequired,
  selectedDate: PropTypes.string.isRequired,
  setSelectedDate: PropTypes.func.isRequired,
  filterType: PropTypes.string.isRequired,
  setFilterType: PropTypes.func.isRequired,
  onAddNote: PropTypes.func.isRequired
}

export default NotesFilter 