import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { FaCalendar, FaImage, FaNotesMedical, FaHistory } from 'react-icons/fa';
import './DoctorNotes.scss';

const DoctorNotes = () => {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentNote, setCurrentNote] = useState({
    date: '',
    doctorName: '',
    hospital: '',
    diagnosis: '',
    prescription: '',
    nextAppointment: '',
    notes: '',
    images: []
  });

  // Giả lập dữ liệu lịch sử
  const mockHistory = [
    {
      id: 1,
      date: '2024-03-15',
      doctorName: 'Dr. Nguyễn Văn A',
      hospital: 'Bệnh viện Phụ sản Trung ương',
      diagnosis: 'Thai kỳ bình thường',
      prescription: 'Vitamin tổng hợp',
      nextAppointment: '2024-04-15',
      notes: 'Thai nhi phát triển tốt',
      images: ['image1.jpg']
    },
    // Thêm dữ liệu mẫu khác...
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentNote(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setCurrentNote(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotes(prev => [...prev, { ...currentNote, id: Date.now() }]);
    setCurrentNote({
      date: '',
      doctorName: '',
      hospital: '',
      diagnosis: '',
      prescription: '',
      nextAppointment: '',
      notes: '',
      images: []
    });
    setShowForm(false);
  };

  return (
    <Container className="doctor-notes-container">
      <h1 className="page-title">Ghi Chú Bác Sĩ</h1>
      
      <div className="action-buttons">
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <FaNotesMedical /> Thêm Ghi Chú Mới
        </Button>
        <Button variant="info" onClick={() => setShowHistory(true)}>
          <FaHistory /> Xem Lịch Sử
        </Button>
      </div>

      {/* Form thêm ghi chú mới */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm Ghi Chú Mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày khám</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={currentNote.date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bác sĩ khám</Form.Label>
                  <Form.Control
                    type="text"
                    name="doctorName"
                    value={currentNote.doctorName}
                    onChange={handleInputChange}
                    placeholder="Tên bác sĩ"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Bệnh viện/Phòng khám</Form.Label>
              <Form.Control
                type="text"
                name="hospital"
                value={currentNote.hospital}
                onChange={handleInputChange}
                placeholder="Tên bệnh viện/phòng khám"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chẩn đoán</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="diagnosis"
                value={currentNote.diagnosis}
                onChange={handleInputChange}
                placeholder="Nhập chẩn đoán của bác sĩ"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Đơn thuốc</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="prescription"
                value={currentNote.prescription}
                onChange={handleInputChange}
                placeholder="Nhập đơn thuốc"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ghi chú thêm</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={currentNote.notes}
                onChange={handleInputChange}
                placeholder="Nhập ghi chú thêm"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lịch hẹn kế tiếp</Form.Label>
              <Form.Control
                type="date"
                name="nextAppointment"
                value={currentNote.nextAppointment}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleImageUpload}
                accept="image/*"
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Lưu Ghi Chú
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal xem lịch sử */}
      <Modal show={showHistory} onHide={() => setShowHistory(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Lịch Sử Khám</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="history-list">
            {mockHistory.map((note) => (
              <Card key={note.id} className="history-item mb-3">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{note.date}</h5>
                    <span>{note.hospital}</span>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p><strong>Bác sĩ:</strong> {note.doctorName}</p>
                  <p><strong>Chẩn đoán:</strong> {note.diagnosis}</p>
                  <p><strong>Đơn thuốc:</strong> {note.prescription}</p>
                  <p><strong>Ghi chú:</strong> {note.notes}</p>
                  <p><strong>Lịch hẹn kế tiếp:</strong> {note.nextAppointment}</p>
                  {note.images.length > 0 && (
                    <div className="image-gallery">
                      {note.images.map((img, index) => (
                        <img key={index} src={img} alt={`Ảnh ${index + 1}`} />
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DoctorNotes;