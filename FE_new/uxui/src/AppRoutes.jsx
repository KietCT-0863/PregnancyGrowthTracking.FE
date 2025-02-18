import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Blog from './pages/blog/index';
import Login from './pages/Login/Login';        
import BlogAll from './pages/blog/BlogAll';
import BlogDetail from './pages/blog/BlogDetail';
import Guest from '../layout/Guest/Guest';
import Register from './pages/Register/Register';
import BasicTracking from './pages/BasicTracking/BasicTracking';
import Layout from '../layout/Layout';

function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Guest/>}>
        <Route index element={<Home/>}></Route>
      </Route>

      <Route path='/blog' element={<Layout><Blog/></Layout>}>    
        <Route index element={<BlogAll/>}></Route>
        <Route path=':id' element={<BlogDetail/>}></Route>
      </Route>  

      <Route path='/basictracking' element={<Layout><BasicTracking/></Layout>}></Route>
      <Route path='/login' element={<Layout><Login/></Layout>}></Route>
      <Route path='/register' element={<Layout><Register/></Layout>}></Route>
      <Route path='*' element={<h1>Not Found</h1>}></Route>
    </Routes>
  );
}

export default AppRoutes; 