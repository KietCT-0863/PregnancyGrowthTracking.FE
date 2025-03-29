import { toast } from "react-toastify"

// Thêm hàm để lấy ngày hiện tại cho đo lường
export const getCurrentFormattedDate = () => {
  return new Date().toISOString();
};

export const validateStats = (statsData) => {
  const age = Number(statsData.age || 0)
  
  if (!age || age < 12 || age > 40) {
    // Hiển thị cảnh báo thay vì ném ra lỗi
    toast.warning(
      <div>
        <h4>Tuần thai không hợp lệ</h4>
        <p>Tuần tuổi thai nhi phải từ 12 đến 40 tuần</p>
      </div>,
      {
        position: "top-right",
        autoClose: 3000,
      }
    );
    // Return false để báo hiệu validation thất bại
    return false;
  }
  
  // Return true để báo hiệu validation thành công
  return true;
}

export const formatUpdateData = (statsData, currentChild) => {
  return {
    age: Number(statsData.age || currentChild?.age || 0),
    hc: Number(statsData.hc) || null,
    ac: Number(statsData.ac) || null,
    fl: Number(statsData.fl) || null,
    efw: Number(statsData.efw) || null,
    // Thêm ngày đo như là một phần của dữ liệu cập nhật
    measurementDate: statsData.measurementDate || getCurrentFormattedDate(),
  }
}

export const handleUpdateSuccess = (result, selectedChild, tempStats) => {
  try {
    const responseData = result.data || result

    const measurementId =
      responseData.id || 
      responseData.measurementId || 
      responseData.growthId || 
      responseData._id || 
      "Đã cập nhật"

    const gestationalAge =
      responseData.age ||
      responseData.gestationalAge ||
      responseData.weekAge ||
      responseData.ageInWeeks ||
      tempStats[selectedChild?.foetusId]?.age ||
      "Đã cập nhật"

    let measurementDate = "Ngày hôm nay"
    const dateValue =
      responseData.date ||
      responseData.measurementDate ||
      responseData.createdAt ||
      responseData.updateDate ||
      responseData.updatedAt ||
      new Date()

    if (dateValue) {
      try {
        measurementDate = new Date(dateValue).toLocaleString("vi-VN", {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        // Bỏ qua lỗi xử lý ngày
      }
    }

    toast.success(
      <div>
        <h4>Cập nhật thành công!</h4>
        <p>ID: {measurementId}</p>
        <p>Tuần thai: {gestationalAge}</p>
        <p>Ngày đo: {measurementDate}</p>
      </div>,
      {
        autoClose: 5000,
        position: "top-right",
      }
    )
  } catch (error) {
    toast.success("Cập nhật thành công!")
  }
}

export const handleUpdateError = (err) => {
  toast.error(
    <div>
      <h4>Lỗi cập nhật!</h4>
      <p>Mã lỗi: {err.status || "N/A"}</p>
      <p>Chi tiết: {err.error || err.message || "Có lỗi xảy ra khi cập nhật chỉ số"}</p>
    </div>,
    {
      autoClose: 5000,
      position: "top-right",
    }
  )
} 