import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';

const AllotmentComponent = () => {
  const [acs, setAcs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedAcId, setSelectedAcId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [allotments, setAllotments] = useState([]);
  const [acMap, setAcMap] = useState({});
  const [employeeMap, setEmployeeMap] = useState({});

  useEffect(() => {
    // Fetch AC details
    axios.get('http://localhost:8000/ac/getAll-ac')
      .then((response) => {
        const acData = response.data.data;
        setAcs(acData);
        const acMapData = {};
        acData.forEach(ac => {
          acMapData[ac._id] = ac.name;
        });
        setAcMap(acMapData);
      })
      .catch(error => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: `AC Details could not be found. Please try again.`,
          showConfirmButton: false,
          timer: 1500
        });
      });

    // Fetch employee details
    axios.get('http://localhost:8000/allotment/getAll-employees')
      .then((response) => {
        const employeeData = response.data.employees;
        setEmployees(employeeData);
        const employeeMapData = {};
        employeeData.forEach(emp => {
          employeeMapData[emp._id] = emp.name;
        });
        setEmployeeMap(employeeMapData);
      })
      .catch(error => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: `Error in fetching employees. Please try again.`,
          showConfirmButton: false,
          timer: 1500
        });
      });

    // Fetch initial allotments
    fetchAllotments();
  }, []);

  // Function to fetch and set allotments
  const fetchAllotments = () => {
    axios.get('http://localhost:8000/allotment/allotments')
      .then((response) => {
        setAllotments(response.data.allotments);
      })
      .catch(error => {
        return
      });
  };

  // Handle allotment assignment
  const handleAssignAllotment = () => {
    axios.post('http://localhost:8000/allotment/add-allotment', {
      employeeId: selectedEmployeeId,
      acId: selectedAcId,
    })
      .then(response => {
        Swal.fire({
          title: "Successfully Added!",
          icon: "success"
        });
        setAllotments(prev => [...prev, response.data.allotment]);
        setSelectedAcId('');
        setSelectedEmployeeId('');
      })
      .catch(error => {
        switch (error.status) {
          case 403:
            Swal.fire({
              icon: "error",
              title: "Sorry",
              text: error.response.data.message
            });
        }
      });
  };

  const handleDeleteAllotment = (employeeId) => {
    axios.delete(`http://localhost:8000/allotment/delete-allotment/${employeeId}`)
      .then(() => {
        Swal.fire({
          title: "Allotment Deleted Successfully!",
          icon: "success"
        });
        setAllotments(prev => prev.filter(allotment => allotment.employee !== employeeId));
      })
      .catch(() => {
        Swal.fire({
          title: "Failed to Delete Allotment",
          icon: "error",
          showConfirmButton: false,
          timer: 1500
        });
      });
  };

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Allotment Assignment</h2>

      {/* Assignment Form */}
      <Row className="justify-content-center mb-5">
        <Col md={6}>
          <Form>
            <Form.Group controlId="acSelect" className="mb-3">
              <Form.Label>Allotment (AC)</Form.Label>
              <Form.Select
                value={selectedAcId}
                onChange={e => setSelectedAcId(e.target.value)}
              >
                <option value="">Select AC</option>
                {acs.map(ac => (
                  <option key={ac._id} value={ac._id}>{ac.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="employeeSelect" className="mb-3">
              <Form.Label>Employee</Form.Label>
              <Form.Select
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" onClick={handleAssignAllotment} className="w-100">
              Assign Allotment
            </Button>
          </Form>
        </Col>
      </Row>

      {/* Allotment List */}
      <h2 className="text-center mb-4">Allotment List</h2>
      <Row className="justify-content-center">
        <Col md={8}>
          <Table striped bordered hover responsive="sm">
            <thead>
              <tr>
                <th>Allotment (AC)</th>
                <th>Employee</th>
              </tr>
            </thead>
            <tbody>
              {allotments.map(allotment => (
                <tr key={allotment._id}>
                  <td>{acMap[allotment.ac]}</td>
                  <td>{employeeMap[allotment.employee]}</td>
                  <Button
                    className='m-1'
                    style={{ backgroundColor: '#FF7F7F', border: 'none' }}
                    onClick={() => handleDeleteAllotment(allotment.employee)}
                  >Delete</Button>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default AllotmentComponent;