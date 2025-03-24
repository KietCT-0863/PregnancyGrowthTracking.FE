import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/vi'; // Import Vietnamese locale
import PropTypes from 'prop-types';
import './CalendarFilters.scss';

const CalendarDayFilter = ({ onDayChange }) => {
  // Set Vietnamese locale at component level
  moment.locale('vi');
  
  const [selectedDate, setSelectedDate] = useState(moment());
  
  useEffect(() => {
    onDayChange(selectedDate.toDate());
  }, [selectedDate, onDayChange]);

  const goToPrevDay = () => {
    setSelectedDate(moment(selectedDate).subtract(1, 'day'));
  };

  const goToNextDay = () => {
    setSelectedDate(moment(selectedDate).add(1, 'day'));
  };

  const goToToday = () => {
    setSelectedDate(moment());
  };

  const formatDayInfo = () => {
    return {
      weekday: selectedDate.format('dddd'), // Will be in Vietnamese due to locale
      date: selectedDate.format('DD'),
      month: selectedDate.format('MMMM'), // Will be in Vietnamese
      year: selectedDate.format('YYYY'),
      isToday: selectedDate.isSame(moment(), 'day')
    };
  };

  const dayInfo = formatDayInfo();

  return (
    <div className="calendar-filter day-filter">
      <div className="filter-header">
        <div className="day-info">
          <h3>{dayInfo.weekday.charAt(0).toUpperCase() + dayInfo.weekday.slice(1)}</h3>
          <div className={`day-date ${dayInfo.isToday ? 'today' : ''}`}>
            <span className="date">{dayInfo.date}</span>
            <span className="month-year">{dayInfo.month}, {dayInfo.year}</span>
          </div>
        </div>
        <div className="filter-actions">
          <button className="today-btn" onClick={goToToday}>
            <CalendarIcon size={16} />
            Hôm nay
          </button>
          <button className="nav-btn" onClick={goToPrevDay}>
            <ChevronLeft size={18} />
          </button>
          <button className="nav-btn" onClick={goToNextDay}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

CalendarDayFilter.propTypes = {
  onDayChange: PropTypes.func.isRequired
};

export default CalendarDayFilter;
