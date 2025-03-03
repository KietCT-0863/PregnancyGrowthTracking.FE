import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import { FaHome, FaUsers, FaBlog } from 'react-icons/fa';
import { Dashboard, People, BarChart } from '@mui/icons-material';

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem button component={Link} to="/admin">
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          <ListItem button component={Link} to="/admin/users">
            <ListItemIcon>
              <People />
            </ListItemIcon>
            <ListItemText primary="Quản lý người dùng" />
          </ListItem>

          <ListItem button component={Link} to="/admin/growth-standard">
            <ListItemIcon>
              <BarChart />
            </ListItemIcon>
            <ListItemText primary="Tiêu chuẩn tăng trưởng" />
          </ListItem>

          <ListItem button component={Link} to="/admin/blogs">
            <ListItemIcon>
              <FaBlog />
            </ListItemIcon>
            <ListItemText primary="Quản lý bài viết" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;