import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { FaHome, FaUsers, FaBlog } from 'react-icons/fa';

const Sidebar = () => {
  const menuItems = [
    { text: 'Dashboard', icon: <FaHome />, path: '/admin' },
    { text: 'Quản lý người dùng', icon: <FaUsers />, path: '/admin/users' },
    { text: 'Quản lý bài viết', icon: <FaBlog />, path: '/admin/blogs' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: 'white',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(214, 51, 132, 0.1)',
                },
                mb: 1
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;