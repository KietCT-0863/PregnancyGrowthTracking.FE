
import Container from 'react-bootstrap/Container';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import { NavLink } from 'react-router-dom';


const NavBar = () => {
    return (
        <>
            <Container>   
                <Navbar expand="lg" className="bg-body-tertiary" bg="light">
                    <Container fluid>
                        <NavLink to="/" className="navbar-brand">
                            <img src="/logo.png" alt="Mẹ Bầu" height="40" />
                            Mẹ Bầu
                        </NavLink>
                        <Navbar.Toggle aria-controls="navbarScroll" />
                        <Navbar.Collapse id="navbarScroll">
                            <Nav
                                className="me-auto my-2 my-lg-0"
                                style={{ maxHeight: '100px' }}
                                navbarScroll
                            >
                                <NavLink to="/basictracking" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                                    Theo Dõi Thai Kỳ
                                </NavLink>
                                <NavLink to="/calendar" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                                    Lịch Trình Thăm Khám
                                </NavLink>
                                <NavLink to="/ghi-chu-bac-si" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                                    Ghi Chú Bác Sĩ
                                </NavLink>
                                <NavLink to="/blog" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                                    Blog
                                </NavLink>
                                <NavLink to="/cong-dong" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                                    Cộng Đồng
                                </NavLink>
                            </Nav>
                            <div>
                                <NavLink to="/login" className={({isActive}) => 
                                    isActive ? 'btn btn-outline-primary me-2 active' : 'btn btn-outline-primary me-2'}>
                                    Đăng Nhập
                                </NavLink>
                                <NavLink to="/register" className={({isActive}) => 
                                    isActive ? 'btn btn-primary active' : 'btn btn-primary'}>
                                    Đăng Ký
                                </NavLink>
                            </div>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

           


            </Container>
        </>
    )
}
export default NavBar;
