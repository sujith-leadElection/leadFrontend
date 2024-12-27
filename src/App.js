import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Navbar, Button, Offcanvas } from 'react-bootstrap';
import Home from './Pages/Home';
import About from './Pages/About';
import EmployeeManagement from './Pages/Services';
import Grievances from './Pages/Grievance';
import GrievanceTable from './Pages/GrievanceTable';
import AttendancePlanner from './Pages/LeavePlanner';
import Login from './Pages/Login'; // Import Login component
import "./App.css";
import { FaHome } from "react-icons/fa";
import { RiGovernmentLine } from "react-icons/ri";
import { BsRecordCircle } from "react-icons/bs";
import { TiContacts } from "react-icons/ti";
import { IoPersonAdd } from "react-icons/io5";
import { SlCalender } from "react-icons/sl";
import logo from "./Images/leadlogo.PNG";
import { MdArrowForwardIos } from "react-icons/md"; // Right-facing arrow
import Swal from 'sweetalert2';
import axios from 'axios';

const Sidebar = ({ toggleSidebar, role }) => (
  <div className="sidebar-container d-flex flex-column p-3 CustomFont" style={{
    width: '100%',
    backgroundColor: 'white',
    fontFamily: 'CustomFont',
    fontWeight: 900
  }}>
    <div className="sidebar-header d-flex align-items-center mb-4">
      <img src={logo} alt="Menu Icon" className="me-2" style={{ width: '150px', height: '80px' }} />
    </div>
    <Link to="/home" onClick={toggleSidebar} className="sidebar-link mb-3 d-flex align-items-center justify-content-between">
      <div>
        <FaHome className="me-2" />
        Home
      </div>
      <MdArrowForwardIos />
    </Link>
    {!role &&
      <Link to="/about" onClick={toggleSidebar} className="sidebar-link mb-3 d-flex align-items-center justify-content-between">
        <div>
          <RiGovernmentLine className="me-2" />
          Assembly Constitution
        </div>
        <MdArrowForwardIos />
      </Link>}
    {!role &&
      <Link to="/employee" onClick={toggleSidebar} className="sidebar-link mb-3 d-flex align-items-center justify-content-between">
        <div>
          <IoPersonAdd className="me-2" />
          Employee Management
        </div>
        <MdArrowForwardIos />
      </Link>}
    <Link to="/grievances" onClick={toggleSidebar} className="sidebar-link mb-3 d-flex align-items-center justify-content-between">
      <div>
        <BsRecordCircle className="me-2" />
        Grievances
      </div>
      <MdArrowForwardIos />
    </Link>
    <Link to="/hrplanner" onClick={toggleSidebar} className="sidebar-link mb-3 d-flex align-items-center justify-content-between">
      <div>
        <SlCalender className="me-2" />
        Attendance Planner
      </div>
      <MdArrowForwardIos />
    </Link>
    <Link to="/allrecords" onClick={toggleSidebar} className="sidebar-link mb-3 d-flex align-items-center justify-content-between">
      <div>
        <TiContacts className="me-2" />
        Records
      </div>
      <MdArrowForwardIos />
    </Link>
  </div>
);

const App = () => {
  const [userInfo, setUserInfo] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializePage = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login');
        } else {
          if (token) setIsAuthenticated(true);
          const tokenResponse = await axios.post(
            'http://localhost:8000/auth/getTokeninfo',
            { token }
          );
          const { userId, role } = tokenResponse.data;
          setUserInfo({ userId, role });
        }
      } catch (error) {
        sessionStorage.removeItem('token');
        navigate('/login');
      }
    };

    initializePage();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('token'); // Remove token from sessionStorage
    setIsAuthenticated(false); // Update auth state
    navigate("/login");
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Successfully Logout",
      showConfirmButton: false,
      timer: 1500
    });
  };

  return (
    <Container fluid>
      {isAuthenticated ? (
        <>
          <Navbar bg="light" className="d-md-none">
            <Button variant="primary" onClick={() => setShowSidebar(!showSidebar)}>
              ☰
            </Button>
          </Navbar>

          <Row className="flex-nowrap">
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="d-md-none">
              <Offcanvas.Header closeButton>
                <Offcanvas.Title>Menu</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Sidebar toggleSidebar={() => setShowSidebar(false)} role={userInfo.role} />
              </Offcanvas.Body>
            </Offcanvas>

            <Col md={3} lg={2} className="p-0 d-none d-md-block sidebar">
              <Sidebar role={userInfo.role} />
            </Col>

            <Col xs={12} md={9} lg={10} className="p-0">
              <Navbar>
                <Container>
                  <Navbar.Collapse className="justify-content-end">
                    <Button variant="outline-success" onClick={handleLogout}>Logout</Button>
                  </Navbar.Collapse>
                </Container>
              </Navbar>
              <Routes>
                <Route path="/home" element={<Home />} />
                {!userInfo.role && <Route path="/about" element={<About />} />}
                {!userInfo.role && <Route path="/employee" element={<EmployeeManagement />} />}
                <Route path="/grievances" element={<Grievances />} />
                <Route path="/hrplanner" element={<AttendancePlanner />} />
                <Route path="/allrecords" element={<GrievanceTable />} />
              </Routes>
            </Col>
          </Row>
        </>
      ) : (
        <Routes>
          <Route path="*" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        </Routes>
      )}
    </Container>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;