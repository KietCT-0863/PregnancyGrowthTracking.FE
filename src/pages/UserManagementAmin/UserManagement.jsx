"use client"

import { useState, useEffect } from "react"
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
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from "@mui/icons-material"
import "./UserManagement.scss"
import userManagementService from "../../api/services/userManagementService"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const initialUserState = {
    userId: null,
    userName: "",
    fullName: "",
    email: "",
    password: "",
    dob: "",
    phone: "",
    available: true,
    roleId: 3,
  }
  const [currentUser, setCurrentUser] = useState(initialUserState)
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await userManagementService.getUsers()
      setUsers(data)
    } catch (error) {
      showSnackbar(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUser = async () => {
    try {
      setLoading(true)
      if (currentUser.userId) {
        await userManagementService.updateUser(currentUser.userId, currentUser)
      } else {
        await userManagementService.createUser(currentUser)
      }
      
      await fetchUsers()
      handleCloseDialog()
      showSnackbar(`Người dùng đã được ${currentUser.userId ? "cập nhật" : "tạo"} thành công`)
    } catch (error) {
      showSnackbar(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true)
      await userManagementService.deleteUser(selectedUserId)
      await fetchUsers()
      setOpenDeleteDialog(false)
      showSnackbar("Đã xóa người dùng thành công")
    } catch (error) {
      showSnackbar(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity })
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
    setPage(0)
  }

  const handleOpenDialog = (user = null) => {
    if (user) {
      setCurrentUser(user)
    } else {
      setCurrentUser(initialUserState)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentUser(initialUserState)
  }

  const handleDeleteUser = (id) => {
    setSelectedUserId(id)
    setOpenDeleteDialog(true)
  }

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value)
    setPage(0)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.roleId === parseInt(roleFilter)

    return matchesSearch && matchesRole
  })

  const getRoleInfo = (roleId) => {
    switch (roleId) {
      case 1:
        return { name: "Admin", className: "admin" };
      case 2:
        return { name: "VIP", className: "vip" };
      case 3:
        return { name: "User", className: "user" };
      default:
        return { name: "Unknown", className: "" };
    }
  }

  return (
    <div className="user-management">
      <Typography variant="h4" gutterBottom className="page-title">
        Quản lý người dùng
      </Typography>
      <Paper className="content-paper">
        <Box className="search-add-container">
          <Box className="filter-container">
            <TextField
              variant="outlined"
              placeholder="Tìm kiếm người dùng"
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
              onChange={handleSearch}
              className="search-field"
            />
            <FormControl variant="outlined" className="role-filter">
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                label="Vai trò"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value={1}>Admin</MenuItem>
                <MenuItem value={2}>VIP</MenuItem>
                <MenuItem value={3}>User</MenuItem>
              </Select>
            </FormControl>
          </Box>
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
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Họ và tên</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                <TableRow key={user.userId} className="user-row">
                  <TableCell className="id-cell">{user.userId}</TableCell>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell className={`role-cell ${getRoleInfo(user.roleId).className}`}>
                    {getRoleInfo(user.roleId).name}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(user)} className="edit-button">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(user.userId)} className="delete-button">
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

      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} className="user-dialog">
        <DialogTitle>
          {currentUser.userId ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            value={currentUser.userName}
            onChange={(e) => setCurrentUser({ ...currentUser, userName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Full Name"
            fullWidth
            value={currentUser.fullName}
            onChange={(e) => setCurrentUser({ ...currentUser, fullName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={currentUser.email}
            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
          />
          {!currentUser.userId && (
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={currentUser.password}
              onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
            />
          )}
          <TextField
            margin="dense"
            label="Date of Birth"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={currentUser.dob?.split('T')[0] || ''}
            onChange={(e) => setCurrentUser({ ...currentUser, dob: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            value={currentUser.phone}
            onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={currentUser.roleId}
              onChange={(e) => setCurrentUser({ ...currentUser, roleId: e.target.value })}
            >
              <MenuItem value={1}>Admin</MenuItem>
              <MenuItem value={2}>VIP</MenuItem>
              <MenuItem value={3}>User</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default UserManagement

