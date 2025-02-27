import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';

const GrowthStandardForm = ({ open, onClose, editData }) => {
  const [formData, setFormData] = useState({
    gestationalAge: '',
    hcMedian: '',
    acMedian: '',
    flMedian: '',
    efwMedian: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        gestationalAge: editData.gestationalAge,
        hcMedian: editData.hcMedian,
        acMedian: editData.acMedian,
        flMedian: editData.flMedian,
        efwMedian: editData.efwMedian
      });
    } else {
      setFormData({
        gestationalAge: '',
        hcMedian: '',
        acMedian: '',
        flMedian: '',
        efwMedian: ''
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = 'https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/GrowthStandard';
      const method = editData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      onClose();
    } catch (error) {
      console.error('Error:', error);
      // Có thể thêm xử lý hiển thị thông báo lỗi ở đây
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editData ? 'Cập nhật Growth Standard' : 'Thêm Growth Standard'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            name="gestationalAge"
            label="Tuổi thai (tuần)"
            type="number"
            value={formData.gestationalAge}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="hcMedian"
            label="HC Median"
            type="number"
            value={formData.hcMedian}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="acMedian"
            label="AC Median"
            type="number"
            value={formData.acMedian}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="flMedian"
            label="FL Median"
            type="number"
            value={formData.flMedian}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="efwMedian"
            label="EFW Median"
            type="number"
            value={formData.efwMedian}
            onChange={handleChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">
          {editData ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GrowthStandardForm; 