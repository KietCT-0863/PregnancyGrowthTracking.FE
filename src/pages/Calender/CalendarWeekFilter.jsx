import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import './CalendarFilters.scss';

const CalendarWeekFilter = ({ onWeekChange, currentTimePosition }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay()); // Go to previous Sunday
    return moment(sunday);
  });
  
  console.log('CalendarWeekFilter đang render với tuần bắt đầu từ:', currentWeekStart.format('DD/MM/YYYY'));
  console.log('CalendarWeekFilter - currentTimePosition:', currentTimePosition);
  
  useEffect(() => {
    // Log để kiểm tra CSS đã được áp dụng chưa
    console.log("CSS classes kiểm tra:", {
      calendarFilter: document.querySelector('.calendar-filter') !== null,
      filterHeader: document.querySelector('.filter-header') !== null,
      todayBtn: document.querySelector('.today-btn') !== null,
      navBtn: document.querySelector('.nav-btn') !== null,
    });
    
    if (currentWeekStart && onWeekChange) {
      console.log('CalendarWeekFilter useEffect - Gọi handleWeekChange với tuần bắt đầu từ:', currentWeekStart.format('DD/MM/YYYY'));
      handleWeekChange(currentWeekStart);
    }
  }, [currentWeekStart, onWeekChange]);

  const handleWeekChange = (weekStart) => {
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      weekDates.push(moment(weekStart).add(i, 'days').toDate());
    }
    console.log('CalendarWeekFilter - Ngày trong tuần đã tạo:', weekDates.map(date => moment(date).format('DD/MM/YYYY')));
    onWeekChange(weekDates);
  };

  const goToPrevWeek = () => {
    console.log('CalendarWeekFilter - Đang chuyển sang tuần trước');
    setCurrentWeekStart(moment(currentWeekStart).subtract(1, 'week'));
  };

  const goToNextWeek = () => {
    console.log('CalendarWeekFilter - Đang chuyển sang tuần sau');
    setCurrentWeekStart(moment(currentWeekStart).add(1, 'week'));
  };

  const goToCurrentWeek = () => {
    console.log('CalendarWeekFilter - Đang chuyển về tuần hiện tại');
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay()); // Go to previous Sunday
    setCurrentWeekStart(moment(sunday));
  };

  const formatWeekRange = () => {
    const weekEnd = moment(currentWeekStart).add(6, 'days');
    const range = `${currentWeekStart.format('DD/MM')} - ${weekEnd.format('DD/MM/YYYY')}`;
    console.log('CalendarWeekFilter - Đã format range tuần:', range);
    return range;
  };

  const renderWeekDays = () => {
    if (!currentWeekStart) return null;
    
    const days = [];
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    console.log('CalendarWeekFilter - Đang render các ngày trong tuần');
    
    for (let i = 0; i < 7; i++) {
      const day = moment(currentWeekStart).add(i, 'days');
      const isToday = day.isSame(moment(), 'day');
      
      days.push(
        <div 
          key={i} 
          className={`week-day ${isToday ? 'today' : ''}`}
          title={`${weekdays[i]} - ${day.format('DD/MM/YYYY')}`}
        >
          <div className="weekday-name">{weekdays[day.day()]}</div>
          <div className="weekday-date">{day.format('DD')}</div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="calendar-filter week-filter">
      <div className="filter-header">
        <h3>Tuần: {formatWeekRange()}</h3>
        <div className="filter-actions">
          <button className="today-btn" onClick={goToCurrentWeek} title="Về tuần hiện tại">
            <CalendarIcon size={16} />
            Hôm nay
          </button>
          <button className="nav-btn" onClick={goToPrevWeek} title="Tuần trước">
            <ChevronLeft size={18} />
          </button>
          <button className="nav-btn" onClick={goToNextWeek} title="Tuần sau">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="week-days-row">
        {renderWeekDays()}
      </div>
    </div>
  );
};

CalendarWeekFilter.propTypes = {
  onWeekChange: PropTypes.func.isRequired,
  currentTimePosition: PropTypes.string
};

CalendarWeekFilter.defaultProps = {
  currentTimePosition: '0px'
};

export default CalendarWeekFilter;
