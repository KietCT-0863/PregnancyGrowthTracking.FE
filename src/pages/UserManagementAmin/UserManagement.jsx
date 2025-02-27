"use client"

import { useState } from "react"
import {
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material"
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from "@mui/icons-material"
import "./UserManagement.scss"

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@example.com", role: "Admin" },
    { id: 2, name: "Trần Thị B", email: "tranthib@example.com", role: "User" },
    { id: 3, name: "Lê Văn C", email: "levanc@example.com", role: "Editor" },
    // Add more mock data as needed
  ])

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState({ id: null, name: "", email: "", role: "" })

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
    setPage(0)
  }

  const handleOpenDialog = (user = { id: null, name: "", email: "", role: "" }) => {
    setCurrentUser(user)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentUser({ id: null, name: "", email: "", role: "" })
  }

  const handleSaveUser = () => {
    if (currentUser.id) {
      setUsers(users.map((user) => (user.id === currentUser.id ? currentUser : user)))
    } else {
      setUsers([...users, { ...currentUser, id: users.length + 1 }])
    }
    handleCloseDialog()
  }

  const handleDeleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="user-management">
      <Typography variant="h4" gutterBottom className="page-title">
        Quản lý người dùng
      </Typography>
      <Paper className="content-paper">
        <Box className="search-add-container">
          <TextField
            variant="outlined"
            placeholder="Tìm kiếm người dùng"
            InputProps={{
              startAdornment: <SearchIcon />,
            }}
            onChange={handleSearch}
            className="search-field"
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            className="add-button"
          >
            Thêm người dùng
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                <TableRow key={user.id} className="user-row">
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(user)} className="edit-button">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(user.id)} className="delete-button">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} className="user-dialog">
        <DialogTitle>{currentUser.id ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên"
            fullWidth
            value={currentUser.name}
            onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={currentUser.email}
            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Vai trò"
            fullWidth
            value={currentUser.role}
            onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Hủy
          </Button>
          <Button onClick={handleSaveUser} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default UserManagement

