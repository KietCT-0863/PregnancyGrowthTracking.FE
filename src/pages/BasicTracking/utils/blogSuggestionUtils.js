import axios from 'axios';
import { API_BASE_URL } from '../../../api/constants/apiEndpoints';

// Hàm lấy dữ liệu chuẩn cho các chỉ số từ API
export const layChiSoChuanVaKhoang = (tuanThai, loaiChiSo) => {
  // Giả sử bạn có một API riêng để lấy chỉ số chuẩn
  // Ở đây chúng ta sẽ trả về giá trị tĩnh
  const chiSoChuanTheoTuan = {
    28: {
      HC: { median: 260, min: 240, max: 280 },
      AC: { median: 240, min: 220, max: 260 },
      FL: { median: 52, min: 48, max: 56 },
      EFW: { median: 1000, min: 900, max: 1100 }
    },
    30: {
      HC: { median: 280, min: 252, max: 308 },
      AC: { median: 260, min: 234, max: 286 },
      FL: { median: 59, min: 53, max: 65 },
      EFW: { median: 1319, min: 1187, max: 1451 }
    },
    32: {
      HC: { median: 300, min: 290, max: 310 },
      AC: { median: 280, min: 273, max: 287 },
      FL: { median: 62, min: 57, max: 67 },
      EFW: { median: 1700, min: 1500, max: 1900 }
    }
  };

  return chiSoChuanTheoTuan[tuanThai]?.[loaiChiSo];
};

// Hàm xác định mức độ chênh lệch
export const xacDinhMucDoChenhLech = (chenhLech, loaiChiSo) => {
  let phanTramChenhLech;
  
  // Tùy thuộc vào loại chỉ số để xác định mức độ
  switch (loaiChiSo) {
    case "HC": // Chu vi đầu
      phanTramChenhLech = chenhLech > 20 ? "đáng lo ngại" : 
                         chenhLech > 10 ? "cần theo dõi" : "nhẹ";
      break;
    case "AC": // Chu vi bụng
      phanTramChenhLech = chenhLech > 20 ? "đáng lo ngại" : 
                         chenhLech > 10 ? "cần theo dõi" : "nhẹ";
      break;
    case "FL": // Chiều dài xương đùi
      phanTramChenhLech = chenhLech > 5 ? "đáng lo ngại" : 
                         chenhLech > 3 ? "cần theo dõi" : "nhẹ";
      break;
    case "EFW": {
      // Mức độ chênh lệch phụ thuộc vào tuần thai
      const tieuChuan = chenhLech > 300 ? "đáng lo ngại" : 
                       chenhLech > 150 ? "cần theo dõi" : "nhẹ";
      phanTramChenhLech = tieuChuan;
      break;
    }
    default:
      phanTramChenhLech = "không xác định";
  }
  
  return phanTramChenhLech;
};

// Tư vấn tag cho chỉ số thấp hơn bình thường
export const tuVanTagChoChiSoThap = (loaiChiSo, mucDo, tuanThaiHienTai) => {
  let tags = ["Sức khỏe thai kỳ", "Lịch khám thai"];
  
  switch (loaiChiSo) {
    case "HC": // Chu vi đầu nhỏ
      tags.push("Phát triển thai nhi");
      if (mucDo === "đáng lo ngại") {
        tags.push("Bệnh lý thai kỳ", "Xét nghiệm & siêu âm");
      }
      break;
    case "AC": // Chu vi bụng nhỏ
      tags.push("Dinh dưỡng mẹ bầu");
      if (tuanThaiHienTai > 30) {
        tags.push("Chuẩn bị đồ sơ sinh");
      }
      if (mucDo !== "nhẹ") {
        tags.push("Bệnh lý thai kỳ");
      }
      break;
    case "FL": // Chiều dài xương đùi ngắn
      tags.push("Phát triển thai nhi");
      if (mucDo === "đáng lo ngại") {
        tags.push("Bệnh lý thai kỳ");
      }
      break;
    case "EFW": // Cân nặng ước tính thấp
      tags.push("Dinh dưỡng mẹ bầu", "Tập thể dục bầu");
      if (mucDo === "đáng lo ngại") {
        tags.push("Bệnh lý thai kỳ", "Xét nghiệm & siêu âm");
      }
      break;
    default:
      break;
  }
  
  return tags;
};

// Tư vấn tag cho chỉ số cao hơn bình thường
export const tuVanTagChoChiSoCao = (loaiChiSo, mucDo, tuanThaiHienTai) => {
  let tags = ["Sức khỏe thai kỳ", "Lịch khám thai"];
  
  switch (loaiChiSo) {
    case "HC": // Chu vi đầu lớn
      tags.push("Phát triển thai nhi");
      if (mucDo === "đáng lo ngại") {
        tags.push("Bệnh lý thai kỳ", "Xét nghiệm & siêu âm");
      }
      break;
    case "AC": // Chu vi bụng lớn
      tags.push("Dinh dưỡng mẹ bầu", "Chế độ ăn");
      if (mucDo !== "nhẹ") {
        tags.push("Bệnh lý thai kỳ");
        if (tuanThaiHienTai > 28) {
          tags.push("Triệu chứng thai kỳ");
        }
      }
      break;
    case "FL": // Chiều dài xương đùi dài
      tags.push("Phát triển thai nhi");
      if (mucDo === "đáng lo ngại") {
        tags.push("Xét nghiệm & siêu âm");
      }
      break;
    case "EFW": // Cân nặng ước tính cao
      tags.push("Dinh dưỡng mẹ bầu", "Chế độ ăn");
      if (mucDo === "đáng lo ngại") {
        tags.push("Bệnh lý thai kỳ", "Xét nghiệm & siêu âm");
        if (tuanThaiHienTai > 32) {
          tags.push("Chuẩn bị đồ sơ sinh", "Sinh thường & sinh mổ");
        }
      }
      break;
    default:
      break;
  }
  
  return tags;
};

// Mô tả tình trạng
export const moTaTinhTrang = (loaiChiSo, trangThai, mucDo, tuanThai) => {
  // Nếu chỉ số trong khoảng bình thường
  if (trangThai === "bình thường") {
    return "Chỉ số nằm trong khoảng bình thường, thai nhi phát triển tốt.";
  }
  
  const tenChiSo = {
    "HC": "chu vi đầu",
    "AC": "chu vi bụng",
    "FL": "chiều dài xương đùi",
    "EFW": "cân nặng ước tính"
  }[loaiChiSo];
  
  // Mô tả cho từng loại chỉ số dựa trên trạng thái và mức độ
  let moTaChuyen = "";
  
  if (trangThai === "thấp hơn") {
    // Mô tả cho các chỉ số thấp hơn bình thường
    switch (loaiChiSo) {
      case "HC": // Chu vi đầu nhỏ
        if (mucDo === "nhẹ") {
          moTaChuyen = "Bổ sung DHA, acid folic và các chất dinh dưỡng hỗ trợ phát triển não bộ có thể giúp cải thiện tình trạng. ";
        } else if (mucDo === "cần theo dõi") {
          moTaChuyen = "Nên theo dõi sát quá trình phát triển não bộ và đầu thai nhi qua các lần khám định kỳ. ";
        } else {
          moTaChuyen = "Cần đánh giá chuyên sâu về quá trình phát triển não bộ và loại trừ các bất thường. ";
        }
        break;
        
      case "AC": // Chu vi bụng nhỏ
        if (mucDo === "nhẹ") {
          moTaChuyen = "Bổ sung protein, sắt và các dưỡng chất thiết yếu trong chế độ ăn. Theo dõi cân nặng và dinh dưỡng. ";
        } else if (mucDo === "cần theo dõi") {
          moTaChuyen = "Theo dõi biểu hiện của thai chậm tăng trưởng trong tử cung (IUGR/FGR). Tăng cường dinh dưỡng và khám thai định kỳ. ";
        } else {
          moTaChuyen = "Cần kiểm tra chức năng nhau thai, dòng máu tử cung-rau và loại trừ các yếu tố rủi ro. ";
        }
        break;
        
      case "FL": // Chiều dài xương đùi ngắn
        if (mucDo === "nhẹ") {
          moTaChuyen = "Bổ sung canxi, vitamin D, sữa và các thực phẩm giàu khoáng chất hỗ trợ phát triển xương. ";
        } else if (mucDo === "cần theo dõi") {
          moTaChuyen = "Nên theo dõi sự phát triển của hệ cơ xương thai nhi qua siêu âm chuyên sâu. ";
        } else {
          moTaChuyen = "Cần đánh giá chuyên sâu để loại trừ các bất thường về xương hoặc di truyền. ";
        }
        break;
        
      case "EFW": // Cân nặng ước tính thấp
        if (mucDo === "nhẹ") {
          moTaChuyen = "Cần tăng cường chế độ dinh dưỡng, bổ sung protein và các dưỡng chất thiết yếu để cải thiện cân nặng. ";
        } else if (mucDo === "cần theo dõi") {
          moTaChuyen = "Theo dõi biểu hiện của thai chậm tăng trưởng trong tử cung (IUGR/FGR). Cần siêu âm Doppler đánh giá dòng máu. ";
        } else {
          moTaChuyen = "Cần đánh giá chức năng rau thai, dòng máu tử cung-rau và có kế hoạch theo dõi sát. ";
        }
        break;
    }
  } else if (trangThai === "cao hơn") {
    // Mô tả cho các chỉ số cao hơn bình thường
    switch (loaiChiSo) {
      case "HC": // Chu vi đầu lớn
        if (mucDo === "nhẹ") {
          moTaChuyen = "Theo dõi thường xuyên đường huyết và cân nặng. Hạn chế thực phẩm chứa nhiều đường. ";
        } else if (mucDo === "cần theo dõi") {
          moTaChuyen = "Nên kiểm tra đường huyết để loại trừ đái tháo đường thai kỳ và đánh giá các yếu tố nguy cơ tiền sản giật. ";
        } else {
          moTaChuyen = "Cần siêu âm chuyên sâu để đánh giá cấu trúc não và loại trừ não úng thủy hoặc các bất thường khác. ";
        }
        break;
        
      case "AC": // Chu vi bụng lớn
        if (mucDo === "nhẹ") {
          moTaChuyen = "Điều chỉnh chế độ ăn, hạn chế tinh bột và đường đơn giản. Tăng cường vận động nhẹ nhàng. ";
        } else if (mucDo === "cần theo dõi") {
          moTaChuyen = "Kiểm tra đường huyết và loại trừ đái tháo đường thai kỳ. Theo dõi cân nặng và huyết áp. ";
        } else {
          moTaChuyen = "Cần sàng lọc đái tháo đường thai kỳ, tiền sản giật và đánh giá thai to (LGA) để chuẩn bị phương án sinh phù hợp. ";
        }
        break;
        
      case "FL": // Chiều dài xương đùi dài
        if (mucDo === "nhẹ") {
          moTaChuyen = "Thường không đáng lo ngại, chỉ cần theo dõi trong các lần khám thai định kỳ. ";
        } else if (mucDo === "cần theo dõi") {
          moTaChuyen = "Nên theo dõi biến thiên tăng trưởng qua các lần siêu âm định kỳ. ";
        } else {
          moTaChuyen = "Cân nhắc tư vấn di truyền và đánh giá chuyên sâu các yếu tố khác. ";
        }
        break;
        
      case "EFW": // Cân nặng ước tính cao
        if (mucDo === "nhẹ") {
          moTaChuyen = "Điều chỉnh chế độ ăn, giảm carbohydrate và đường, tăng cường protein nạc và chất xơ. ";
        } else if (mucDo === "cần theo dõi") {
          moTaChuyen = "Sàng lọc đái tháo đường thai kỳ và theo dõi cân nặng. Tăng cường vận động nhẹ nhàng theo hướng dẫn. ";
        } else {
          moTaChuyen = "Cân nhắc khả năng sinh khó do thai to, chuẩn bị phương án sinh mổ nếu cần và kiểm soát đường huyết chặt chẽ. ";
        }
        break;
    }
  }
  
  // Câu mở đầu mô tả tình trạng
  let moTa = `Chỉ số ${tenChiSo} ${trangThai} mức bình thường ở mức ${mucDo}. `;
  
  // Khuyến nghị dựa vào mức độ
  if (mucDo === "đáng lo ngại") {
    moTa += "Bạn nên đến gặp bác sĩ ngay để được tư vấn chi tiết. ";
  } else if (mucDo === "cần theo dõi") {
    moTa += "Bạn nên theo dõi thêm và tham khảo ý kiến bác sĩ. ";
  } else {
    moTa += "Bạn có thể tham khảo các bài viết liên quan để hiểu thêm. ";
  }
  
  // Bổ sung mô tả chuyên biệt
  moTa += moTaChuyen;
  
  // Khuyến nghị dựa vào giai đoạn thai kỳ
  if (tuanThai >= 12 && tuanThai <= 20) {
    moTa += "Trong giai đoạn thai kỳ đầu này, việc khám thai và siêu âm đều đặn là rất quan trọng để theo dõi sự phát triển của thai nhi.";
  } else if (tuanThai >= 21 && tuanThai <= 29) {
    moTa += "Ở giai đoạn thai kỳ giữa này, cần đặc biệt chú ý đến dinh dưỡng và sàng lọc các bệnh lý thai kỳ thường gặp.";
  } else if (tuanThai >= 30) {
    moTa += "Trong giai đoạn thai kỳ cuối này, cần chuẩn bị cho quá trình sinh nở và lưu ý các dấu hiệu chuyển dạ bất thường.";
  }
  
  return moTa;
};

// Lấy danh sách bài viết từ API
const getBlogs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Blog`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài viết:", error);
    return { posts: [] };
  }
};

// Dữ liệu mẫu cho bài viết nếu API không có dữ liệu


// Hàm tư vấn bài đọc dựa trên chỉ số thai kỳ
export const tuVanBaiDoc = async (tuanThai, loaiChiSo, giaTriDo) => {
  console.log(`Kiểm tra chỉ số ${loaiChiSo} = ${giaTriDo} ở tuần ${tuanThai}`);
  
  // Lấy giá trị chuẩn và khoảng cho phép
  const chiSoChuanVaKhoang = layChiSoChuanVaKhoang(tuanThai, loaiChiSo);
  
  if (!chiSoChuanVaKhoang) {
    console.log(`Không có dữ liệu chuẩn cho chỉ số ${loaiChiSo} ở tuần ${tuanThai}`);
    return {
      description: "Không có dữ liệu cho tuần thai này",
      tags: ["Lịch khám thai", "Sức khỏe thai kỳ"],
      blogs: []
    };
  }
  
  const { min: minRange, max: maxRange } = chiSoChuanVaKhoang;
  console.log(`Khoảng chuẩn: ${minRange} - ${maxRange}`);
  
  // So sánh với khoảng cho phép
  let trangThai = "bình thường";
  let mucDo = "không đáng lo ngại";
  let danhSachTag = [];
  
  if (giaTriDo < minRange) {
    trangThai = "thấp hơn";
    const chenhLech = minRange - giaTriDo;
    mucDo = xacDinhMucDoChenhLech(chenhLech, loaiChiSo);
    danhSachTag = tuVanTagChoChiSoThap(loaiChiSo, mucDo, tuanThai);
    console.log(`Phát hiện chỉ số THẤP: ${loaiChiSo} thấp hơn ${chenhLech} đơn vị, mức độ: ${mucDo}`);
  } else if (giaTriDo > maxRange) {
    trangThai = "cao hơn";
    const chenhLech = giaTriDo - maxRange;
    mucDo = xacDinhMucDoChenhLech(chenhLech, loaiChiSo);
    danhSachTag = tuVanTagChoChiSoCao(loaiChiSo, mucDo, tuanThai);
    console.log(`Phát hiện chỉ số CAO: ${loaiChiSo} cao hơn ${chenhLech} đơn vị, mức độ: ${mucDo}`);
  } else {
    danhSachTag = ["Phát triển thai nhi", "Sức khỏe thai kỳ"];
    console.log(`Chỉ số ${loaiChiSo} nằm trong khoảng bình thường`);
  }
  
  // Lấy danh sách bài viết
  let blogsData;
  try {
    blogsData = await getBlogs();
  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    blogsData = { posts: sampleBlogs };
  }
  
  // Sử dụng dữ liệu mẫu nếu không có dữ liệu thực
  const allBlogs = blogsData.posts?.length ? blogsData.posts : sampleBlogs;
  
  // Lọc các bài viết liên quan dựa trên tags
  const relatedBlogs = allBlogs
    .filter(blog => {
      // Kiểm tra xem blog có category phù hợp không
      if (!blog.categories || !Array.isArray(blog.categories)) return false;
      
      return blog.categories.some(category => {
        const categoryName = typeof category === 'string' ? category : category.categoryName;
        return danhSachTag.includes(categoryName);
      });
    })
    .map(blog => ({
      id: blog.id,
      title: blog.title,
      excerpt: blog.body.substring(0, 120) + '...',
      image: blog.imageUrl || `https://picsum.photos/seed/${blog.id}/600/400`,
      date: new Date(blog.createdAt).toLocaleDateString('vi-VN'),
      readTime: Math.ceil(blog.body.length / 1000) + ' phút', // Ước tính thời gian đọc
      tags: blog.categories
    }))
    .slice(0, 3); // Lấy tối đa 3 bài viết liên quan
  
  const description = moTaTinhTrang(loaiChiSo, trangThai, mucDo, tuanThai);
  console.log(`Mô tả tạo ra: ${description}`);
  
  return {
    description: description,
    tags: danhSachTag,
    blogs: relatedBlogs
  };
};

// Hàm tạo danh sách bài viết gợi ý từ nhiều chỉ số
export const taoGopYBaiViet = async (tuanThai, chiSoList) => {
  // Tạo mảng promises để gọi tuVanBaiDoc cho từng chỉ số
  const promises = Object.entries(chiSoList)
    .filter(([, giaTriDo]) => giaTriDo !== null && giaTriDo !== undefined && giaTriDo !== '')
    .map(([loaiChiSo, giaTriDo]) => tuVanBaiDoc(tuanThai, loaiChiSo, parseFloat(giaTriDo)));
  
  // Chờ tất cả promises hoàn thành
  const ketQuaList = await Promise.all(promises);
  
  // Kết hợp tất cả danh sách tags
  const allTags = new Set();
  ketQuaList.forEach(ketQua => {
    ketQua.tags?.forEach(tag => allTags.add(tag));
  });
  
  // Kết hợp tất cả danh sách bài viết
  let allBlogs = [];
  ketQuaList.forEach(ketQua => {
    if (ketQua.blogs) {
      allBlogs = [...allBlogs, ...ketQua.blogs];
    }
  });
  
  // Loại bỏ các bài viết trùng lặp
  const uniqueBlogs = [];
  const blogIds = new Set();
  allBlogs.forEach(blog => {
    if (!blogIds.has(blog.id)) {
      blogIds.add(blog.id);
      uniqueBlogs.push(blog);
    }
  });
  
  // Tạo mô tả tổng quan
  let description = '';
  const abnormalMetrics = ketQuaList.filter(ketQua => 
    ketQua.description && !ketQua.description.includes("bình thường")
  );
  
  if (abnormalMetrics.length === 0) {
    description = 'Tất cả các chỉ số đều nằm trong ngưỡng bình thường. Dưới đây là một số bài viết có thể giúp bạn hiểu thêm về sự phát triển của thai nhi.';
  } else {
    const metricDescriptions = abnormalMetrics.map(ketQua => ketQua.description);
    description = 'Dựa trên chỉ số đo được: ' + metricDescriptions.join(' ');
  }
  
  return {
    tags: [...allTags],
    blogs: uniqueBlogs.slice(0, 5), // Lấy tối đa 5 bài viết gợi ý
    description: description
  };
}; 