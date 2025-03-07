import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import GrowthStandardForm from "../../pages/GrowthStandard/GrowthStandardForm";

const GrowthStandardList = () => {
  const [standards, setStandards] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(7);

  const fetchStandards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // Lấy token từ localStorage

      const response = await fetch(
        "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/GrowthStandard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setStandards(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching growth standards:", error);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  const handleEdit = (standard) => {
    setEditData(standard);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setOpenForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditData(null);
    fetchStandards();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const currentPageStandards = standards.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", color: "error.main", mt: 2 }}>
        {error}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Quản lý Growth Standard</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Thêm mới
        </Button>
      </Box>

      {standards.length === 0 ? (
        <Typography sx={{ textAlign: "center", mt: 2 }}>
          Chưa có dữ liệu
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tuổi thai (tuần)</TableCell>
                  <TableCell>HC Median</TableCell>
                  <TableCell>AC Median</TableCell>
                  <TableCell>FL Median</TableCell>
                  <TableCell>EFW Median</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPageStandards.map((standard) => (
                  <TableRow key={standard.growthStandardId}>
                    <TableCell>{standard.growthStandardId}</TableCell>
                    <TableCell>{standard.gestationalAge}</TableCell>
                    <TableCell>{standard.hcMedian}</TableCell>
                    <TableCell>{standard.acMedian}</TableCell>
                    <TableCell>{standard.flMedian}</TableCell>
                    <TableCell>{standard.efwMedian}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(standard)}
                      >
                        Sửa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={standards.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={7}
            rowsPerPageOptions={[7]}
            sx={{ mt: 2 }}
          />
        </>
      )}

      <GrowthStandardForm
        open={openForm}
        onClose={handleFormClose}
        editData={editData}
      />
    </Box>
  );
};

export default GrowthStandardList;
