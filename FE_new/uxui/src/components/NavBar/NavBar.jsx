import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo(decoded);
        setIsLoggedIn(true);
        setIsAdmin(
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] === "admin"
        );
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUserInfo(null);
        setIsAdmin(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsAdmin(false);
    toast.success("Đăng xuất thành công!");
    navigate("/");
  };

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
                style={{ maxHeight: "100px" }}
                navbarScroll
              >
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    Quản trị
                  </NavLink>
                )}
                <NavLink
                  to="/member/basic-tracking"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Theo Dõi Thai Kỳ
                </NavLink>
                <NavLink
                  to="/member/calendar"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Lịch Trình Thăm Khám
                </NavLink>
                <NavLink
                  to="/member/doctor-notes"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Ghi Chú Bác Sĩ
                </NavLink>
                <NavLink
                  to="/member/blog"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Blog
                </NavLink>
                <NavLink
                  to="/member/community"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Cộng Đồng
                </NavLink>
              </Nav>
              <div>
                {!isLoggedIn ? (
                  <>
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        isActive
                          ? "btn btn-outline-primary me-2 active"
                          : "btn btn-outline-primary me-2"
                      }
                    >
                      Đăng Nhập
                    </NavLink>
                    <NavLink
                      to="/register"
                      className={({ isActive }) =>
                        isActive ? "btn btn-primary active" : "btn btn-primary"
                      }
                    >
                      Đăng Ký
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavDropdown
                      title={userInfo?.name || "Người dùng"}
                      id="nav-dropdown"
                      className="me-2"
                    >
                      <NavDropdown.Item disabled>
                        <small>
                          <div>Ngày sinh: {userInfo?.birthDate}</div>
                          <div>Email: {userInfo?.email}</div>
                        </small>
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={handleLogout}>
                        Đăng xuất
                      </NavDropdown.Item>
                    </NavDropdown>
                  </>
                )}
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </Container>
    </>
  );
};
export default NavBar;
