import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
const EmployeeDatabase = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPasswordEmployee, setSelectedPasswordEmployee] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [updateData, setUpdateData] = useState({
    scores: {
      xth: '',
      xiith: '',
      bachelors: '',
      masters: '',
    },
  });

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8000/allotment/getAll-employees');
      setEmployees(response.data.employees);
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: `Error in fetching Employees. Please try again.`,
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleUpdateClick = (employee) => {
    setSelectedEmployee(employee);
    setUpdateData({
      ...employee,
      scores: {
        xth: employee.scores?.xth || '',
        xiith: employee.scores?.xiith || '',
        bachelors: employee.scores?.bachelors || '',
        masters: employee.scores?.masters || '',
      },
    });
  };

  const handlePasswordClick = (employee) => {
    setShowPasswordModal(true)
    setSelectedPasswordEmployee(employee._id)
  }

  const handlePasswordChangeSubmit = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8000/employee/update-password/${selectedPasswordEmployee}`,
        { password: newPassword }
      );
      if (response.status === 200) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Password updated successfully",
          showConfirmButton: false,
          timer: 1500
        });
        setShowPasswordModal(false);
        setNewPassword("");
      }
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Error updating password",
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const deleteEmployee = async (employee) => {
    try {
      const response = await axios.delete(`http://localhost:8000/employee/delete-employee/${employee._id}`);
      if (response.status === 200) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Employee deleted successfully",
          showConfirmButton: false,
          timer: 1500
        });
        const updatedEmployees = employees.filter(emp => emp._id !== employee._id);
        setEmployees(updatedEmployees); // Update the state or variable holding the employee list
      }
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: error.response?.data?.message || "Error deleting employee",
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const handleChangeUpdate = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('scores.')) {
      const scoreKey = name.split('.')[1];
      setUpdateData((prevState) => ({
        ...prevState,
        scores: {
          ...prevState.scores,
          [scoreKey]: value,
        },
      }));
    } else {
      setUpdateData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:8000/employee/edit-employee/${selectedEmployee._id}`, updateData);
      //alert(response.data.message);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Successfully Updated",
        showConfirmButton: false,
        timer: 1500
      });
      setSelectedEmployee(null);
      fetchEmployees(); // Refresh employee list
    } catch (error) {
      switch (error.status) {
        case 400:
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: error.response.data.details[0],
            showConfirmButton: false,
            timer: 1500
          });
          break
        case 500:
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Server Error",
            showConfirmButton: false,
            timer: 1500
          });
          break
      }
    }
  };

  return (
    <Container>
      <h2>Employee Database</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td>{employee._id}</td>
              <td>{employee.name}</td>
              <td>
                <Button
                  className="m-1 fw-bold"
                  variant="outline-success"
                  onClick={() => handleUpdateClick(employee)}
                >
                  Update
                </Button>
                <Button
                  className="m-1 fw-bold"
                  variant="outline-danger"
                  onClick={() => deleteEmployee(employee)}
                >
                  Delete
                </Button>
                <Button
                  className="m-1 fw-bold"
                  variant="outline-warning"
                  onClick={() => handlePasswordClick(employee)}
                >
                  Change Password
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handlePasswordChangeSubmit}>Update Password</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={!!selectedEmployee} onHide={() => setSelectedEmployee(null)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">Update Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateSubmit}>
            <Row className="g-3">
              {[
                { label: "Name", name: "name", type: "text" },
                { label: "Age", name: "age", type: "number" },
                { label: "Father's Name", name: "fatherName", type: "text" },
                { label: "Address", name: "address", type: "text" },
                { label: "Email", name: "email", type: "email" },
                { label: "Phone Number", name: "phoneNumber", type: "text" },
                { label: "PAN ID", name: "panId", type: "text" },
                { label: "Aadhar ID", name: "aadharId", type: "text" },
                { label: "EPF", name: "epf", type: "text" },
                { label: "Xth Score", name: "scores.xth", type: "number" },
                { label: "XIIth Score", name: "scores.xiith", type: "number" },
                { label: "Bachelors Score", name: "scores.bachelors", type: "number" },
                { label: "Masters Score", name: "scores.masters", type: "number" },
              ].map((field, index) => (
                <Col key={index} xs={12} sm={6} md={4}>
                  <Form.Group controlId={`form-${field.name}`}>
                    <Form.Label>{field.label}</Form.Label>
                    <Form.Control
                      type={field.type}
                      name={field.name}
                      value={field.name.startsWith("scores.") ? updateData.scores[field.name.split('.')[1]] : updateData[field.name]}
                      onChange={handleChangeUpdate}
                      required
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>
            <div className="text-center mt-4">
              <Button type="submit" variant="primary" className="px-4">
                Update Employee
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EmployeeDatabase;