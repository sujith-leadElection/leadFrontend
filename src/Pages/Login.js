import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Container, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Login.css'; // Import CSS for styling
import logo from '../Images/leadlogo.PNG';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/auth/signin', {
        credentials: {
          email,
          password,
        },
      });

      if (response.data.status === 'success') {
        sessionStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Successfully Signed-In',
          showConfirmButton: false,
          timer: 1500,
        });
        navigate('/home');
      } else {
        Swal.fire({
          position: 'top-end',
          title: 'Invalid credentials',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        position: 'top-end',
        title: 'Login failed. Please try again.',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <Container className="login-container">
      <Navbar>
        <Container>
          <Navbar.Brand href="#home">
            <img
              src={logo}
              alt="Company Logo"
              style={{ height: '40px' }}
            />
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Form onSubmit={handleLogin} className="d-flex align-items-center">
              <Form.Control
                type="email"
                placeholder="Email"
                className="me-2"
                style={{ maxWidth: '200px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Form.Control
                type="password"
                placeholder="Password"
                className="me-2"
                style={{ maxWidth: '200px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button variant="primary" type="submit">
                Login
              </Button>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </Container>
  );
};

export default Login;