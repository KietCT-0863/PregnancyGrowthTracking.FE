import { toast } from "react-toastify"

export const validateStats = (statsData) => {
  const age = Number(statsData.age || 0)
  
  if (!age || age < 12 || age > 40) {
    throw new Error("Tuần tuổi thai nhi không hợp lệ (12-40 tuần)")
  }
}

export const formatUpdateData = (statsData, currentChild) => {
  return {
    age: Number(statsData.age || currentChild?.age || 0),
    hc: Number(statsData.hc) || null,
    ac: Number(statsData.ac) || null,
    fl: Number(statsData.fl) || null,
    efw: Number(statsData.efw) || null,
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
        measurementDate = new Date(dateValue).toLocaleDateString("vi-VN")
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

export const handleInputValidation = (field, value) => {
  if (field === 'age') {
    const numValue = Number(value)
    if (numValue && (numValue < 12 || numValue > 40)) {
      toast.warning(
        <div>
          <h4>Cảnh báo tuần thai</h4>
          <p>Tuần thai hợp lệ phải từ 12 đến 40 tuần</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
        }
      )
    }
  }
} 