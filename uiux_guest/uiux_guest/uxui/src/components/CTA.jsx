import React from "react";

const CTA = () => {
  return (
    <section className="cta">
      <div className="cta-content">
        <h2>Sẵn sàng đồng hành cùng MẹBầu?</h2>
        <p>Đăng ký ngay hôm nay để nhận những thông tin hữu ích về thai kỳ</p>
        <div className="cta-form">
          <input type="email" placeholder="Nhập email của bạn" />
          <button className="btn btn-light">Đăng ký ngay</button>
        </div>
        <div className="cta-benefits">
          <div className="benefit-item">✓ Hoàn toàn miễn phí</div>
          <div className="benefit-item">✓ Hủy đăng ký bất cứ lúc nào</div>
          <div className="benefit-item">✓ Tư vấn 24/7</div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
