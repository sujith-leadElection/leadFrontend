import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Table, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MdDriveFileRenameOutline } from "react-icons/md";
import { RiGovernmentLine } from "react-icons/ri";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoIosContact } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";

function errorMessage(statusCode, error) {
  switch (statusCode) {
    case 400:
      return error.response.data.message
    case 404:
      return "The server is unable to find the requested page or resource"
  }
}

const AddAC = () => {
  const [acs, setAcs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentAC, setCurrentAC] = useState({});
  const [newAC, setNewAC] = useState({
    name: '',
    parliamentaryConstituency: '',
    PCId: '',
    pocMobileNumber: '',
  });

  useEffect(() => {
    fetchACs();
  }, []);

  const fetchACs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/ac/getAll-ac');
      setAcs(response.data.data);
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: `AC Details could not be fetched.`,
        showConfirmButton: false,
        timer: 1500
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAC = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/ac/add-ac', newAC);
      // Append the new AC data to the existing `acs` state
      setAcs((prevAcs) => [...prevAcs, response.data.data]);

      // Reset the form fields
      setNewAC({ name: '', parliamentaryConstituency: '', PCId: '', pocMobileNumber: '' });
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Record added successfully",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      var msg = errorMessage(error.status, error);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: msg,
        showConfirmButton: false,
        timer: 1500
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (ac) => {
    setCurrentAC(ac);
    setShowModal(true);
  };

  const openDeleteAC = async (ac) => {
    try {
      // Show the confirmation dialog
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) { // Proceed only if the user confirms
        try {
          // Send a DELETE request to the server
          const response = await axios.delete(`http://localhost:8000/allotment/delete-ac/${ac._id}`);

          // If the deletion is successful
          if (response.status === 200) {
            // Filter out the deleted AC from the `acs` array
            const updatedACs = acs.filter((item) => item._id !== ac._id);

            // Update the state with the new AC array
            setAcs(updatedACs);

            // Show success alert
            Swal.fire({
              title: "Deleted!",
              text: "The AC has been successfully deleted.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: "Failed to delete the AC. Please try again.",
              icon: "error"
            });
          }
        } catch (error) {
          // Show error alert
          Swal.fire({
            title: "Error!",
            text: "An error occurred while deleting the AC. Please try again.",
            icon: "error"
          });
        }
      }
    } catch (error) {
      // Show error alert if something goes wrong with Swal or user cancels
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Couldn't delete the AC. Something went wrong.",
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const handleUpdateAC = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:8000/ac/edit-ac/${currentAC._id}`, {
        "name": currentAC.name,
        "parliamentaryConstituency": currentAC.parliamentaryConstituency,
        "PCId": currentAC.PCId,
        "pocMobileNumber": currentAC.pocMobileNumber
      });

      // Find the index of the updated AC in the existing `acs` array
      const updatedACIndex = acs.findIndex(ac => ac._id === currentAC._id);

      // Create a new array to hold the updated records
      const updatedACs = [...acs];

      // Replace the updated AC record with the response data
      if (updatedACIndex !== -1) {
        updatedACs[updatedACIndex] = response.data.data;
      }

      // Update the state with the new array
      setAcs(updatedACs);

      // Close the modal
      setShowModal(false);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "AC Updated successfully",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: `Could not update AC details`,
        showConfirmButton: false,
        timer: 1500
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewAC({ ...newAC, [e.target.name]: e.target.value });
  };

  const handleModalInputChange = (e) => {
    setCurrentAC({ ...currentAC, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4">
      <h2 style={{
        fontFamily: 'CustomFont',
        fontWeight: 900
      }}>Add Assembly Constituency</h2>
      <Form onSubmit={handleAddAC}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label><MdDriveFileRenameOutline className='me-1' />Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newAC.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label><RiGovernmentLine className='me-1' />Parliamentary Constituency</Form.Label>
              <Form.Control
                type="text"
                name="parliamentaryConstituency"
                value={newAC.parliamentaryConstituency}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label><IoPersonAddSharp className='me-1' />PC ID</Form.Label>
              <Form.Control
                type="text"
                name="PCId"
                value={newAC.PCId}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label><IoIosContact className='me-1' />POC Mobile Number</Form.Label>
              <Form.Control
                type="number" // Use 'text' to enforce maxLength
                name="pocMobileNumber"
                value={newAC.pocMobileNumber}
                onChange={(e) => {
                  if (e.target.value.length <= 10) {
                    handleInputChange(e); // Update the state only if within the limit
                  }
                }}
                maxLength={10} // Prevents typing beyond this limit
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <button className="gem-c-button govuk-button" style={{ width: '30%' }}>
          {loading ? (
            <Spinner as="span" animation="border" size="sm" />
          ) : (
            <>
              <IoMdAdd /> Add AC
            </>
          )}
        </button>
      </Form>
      <h2 className="mt-5">All Assembly Constituencies</h2>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p>Loading data...</p>
        </div>
      ) : (
        <Table bordered striped responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Parliamentary Constituency</th>
              <th>PC ID</th>
              <th>POC Mobile Number</th>
              <th>Actions</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {acs.map((ac) => (
              <tr key={ac._id}>
                <td>{ac.name}</td>
                <td>{ac.parliamentaryConstituency}</td>
                <td>{ac.PCId}</td>
                <td>{ac.pocMobileNumber}</td>
                <td>
                  <button class="gem-c-button govuk-button" onClick={() => openEditModal(ac)}>Update</button>
                </td>
                <td>
                  <button class="gem-c-button govuk-button" onClick={() => openDeleteAC(ac)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update AC</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentAC.name}
                onChange={handleModalInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Parliamentary Constituency</Form.Label>
              <Form.Control
                type="text"
                name="parliamentaryConstituency"
                value={currentAC.parliamentaryConstituency}
                onChange={handleModalInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>PC ID</Form.Label>
              <Form.Control
                type="text"
                name="PCId"
                value={currentAC.PCId}
                onChange={handleModalInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>POC Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="pocMobileNumber"
                value={currentAC.pocMobileNumber}
                onChange={handleModalInputChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateAC}>
            {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Update AC'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddAC;