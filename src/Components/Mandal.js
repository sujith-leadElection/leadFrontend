import React, { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Table, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Mandal.css'
const Mandal = () => {
  const [acs, setAcs] = useState([]);
  const [selectedAc, setSelectedAc] = useState(null);
  const [mandals, setMandals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newMandalName, setNewMandalName] = useState('');
  const [selectedMandal, setSelectedMandal] = useState(null);
  const [updateMandalName, setUpdateMandalName] = useState('');
  const [showVillageModal, setShowVillageModal] = useState(false);
  const [villages, setVillages] = useState([]);
  const [newVillageName, setNewVillageName] = useState('');
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [updateVillageName, setUpdateVillageName] = useState('');

  // Fetch all ACs
  useEffect(() => {
    axios.get('http://localhost:8000/ac/getAll-ac')
      .then((response) => {
        setAcs(response.data.data);
      })
      .catch((error) => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Error in fetching ACs. Please try again.",
          showConfirmButton: false,
          timer: 1500
        });
      });
  }, []);

  // Fetch mandals for selected AC
  const handleAcChange = (event) => {
    const acId = event.target.value;
    const selectedAcData = acs.find(ac => ac._id === acId);
    setSelectedAc(selectedAcData);
    setMandals(selectedAcData.mandals);
  };

  // Show add modal
  const openAddModal = () => setShowAddModal(true);

  // Close add modal
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewMandalName('');
  };

  // Add mandal
  const addMandal = () => {
    axios.post(`http://localhost:8000/ac/add-mandal/${selectedAc._id}`, { name: newMandalName })
      .then((response) => {
        setMandals([...mandals, response.data.data]);
        closeAddModal();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Mandal added successfully",
          showConfirmButton: false,
          timer: 1500
        });
      })
      .catch((error) => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: error.response.data.message,
          showConfirmButton: false,
          timer: 1500
        });
      });
  };

  // Show update modal
  const openUpdateModal = (mandal) => {
    setSelectedMandal(mandal);
    setUpdateMandalName(mandal.name);
    setShowUpdateModal(true);
  };

  // Close update modal
  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedMandal(null);
    setUpdateMandalName('');
  };

  // Update mandal
  const updateMandal = () => {
    axios.put(`http://localhost:8000/ac/edit-mandal/${selectedAc._id}/${selectedMandal._id}`, { name: updateMandalName })
      .then(() => {
        const updatedMandals = mandals.map(m => m._id === selectedMandal._id ? { ...m, name: updateMandalName } : m);
        setMandals(updatedMandals);
        closeUpdateModal();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Mandal updated successfully",
          showConfirmButton: false,
          timer: 1500
        });
      })
      .catch((error) => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: error.response.data.message,
          showConfirmButton: false,
          timer: 1500
        });
      });
  };

  // Open Village Modal
  const openVillageModal = (mandal) => {
    setSelectedMandal(mandal);
    setVillages(mandal.villages);
    setShowVillageModal(true);
  };

  const deleteMandal = async (mandal) => {
    try {
      // Show confirmation dialog before deleting the Mandal
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete the mandal "${mandal.name}". This action cannot be undone!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) { // Proceed only if the user confirms
        try {
          // Call the API to delete the Mandal
          const response = await axios.delete(
            `http://localhost:8000/allotment/delete-mandal/${mandal._id}/${selectedAc._id}`,
            {
              headers: {
                "Content-Type": "application/json"
              }
            }
          );

          if (response.status === 200) {
            // Update the mandals state by filtering out the deleted Mandal
            setMandals((prevMandals) =>
              prevMandals.filter((m) => m._id !== mandal._id)
            );
            Swal.fire({
              title: "Deleted!",
              text: `The mandal "${mandal.name}" has been successfully deleted.`,
              icon: "success",
              timer: 1500,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: "Failed to delete the mandal. Please try again.",
              icon: "error"
            });
          }
        } catch (error) {
          // Handle API errors
          if (error.response) {
            Swal.fire({
              title: "Error!",
              text: error.response.data.message || "Failed to delete the mandal.",
              icon: "error"
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: "An error occurred while deleting the mandal. Please try again.",
              icon: "error"
            });
          }
        }
      }
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Couldn't delete the mandal. Something went wrong.",
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  // Close Village Modal
  const closeVillageModal = () => {
    setShowVillageModal(false);
    setSelectedMandal(null);
    setVillages([]);
  };

  // Add village
  const addVillage = () => {
    axios.post(`http://localhost:8000/ac/add-village/${selectedAc._id}/${selectedMandal._id}`, { name: newVillageName })
      .then((response) => {
        setVillages([...villages, response.data.data]);
        setNewVillageName('');
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Village Added Successfully",
          showConfirmButton: false,
          timer: 1500
        });
      })
      .catch((error) => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: error.response.data.message,
          showConfirmButton: false,
          timer: 1500
        });
      });
  };

  // Show update modal for Village
  const openUpdateVillageModal = (village) => {
    setSelectedVillage(village);
    setUpdateVillageName(village.name);
  };

  const openDeleteVillageModal = async (village) => {
    try {
      // Show confirmation dialog before deleting the village
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete the village "${village.name}". This action cannot be undone!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) { // Proceed only if the user confirms
        try {
          // Call the API to delete the Village
          const response = await fetch(
            `http://localhost:8000/allotment/delete-village/${village._id}/${selectedMandal._id}/${selectedAc._id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json"
              }
            }
          );

          if (response.ok) {
            // Update the mandals state to remove the deleted village
            setMandals((prevMandals) =>
              prevMandals.map((mandal) =>
                mandal._id === selectedMandal._id
                  ? {
                    ...mandal,
                    villages: mandal.villages.filter((v) => v._id !== village._id)
                  }
                  : mandal
              )
            );

            // Update the villages state to remove the deleted village
            setVillages((prevVillages) =>
              prevVillages.filter((v) => v._id !== village._id)
            );
            // Show success alert
            Swal.fire({
              title: "Deleted!",
              text: `The village "${village.name}" has been successfully deleted.`,
              icon: "success",
              timer: 1500,
              showConfirmButton: false
            });
          } else {
            const errorData = await response.json();
            Swal.fire({
              title: "Error!",
              text: errorData.message || "Failed to delete the village. Please try again.",
              icon: "error"
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "An error occurred while deleting the village. Please try again.",
            icon: "error"
          });
        }
      }
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Couldn't delete the village. Something went wrong.",
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  // Update village
  const updateVillage = () => {
    axios.put(`http://localhost:8000/ac/edit-village/${selectedAc._id}/${selectedMandal._id}/${selectedVillage._id}`, { name: updateVillageName })
      .then(() => {
        const updatedVillages = villages.map(v => v._id === selectedVillage._id ? { ...v, name: updateVillageName } : v);
        setVillages(updatedVillages);
        setSelectedVillage(null);
        setUpdateVillageName('');
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Village Updated Successfully",
          showConfirmButton: false,
          timer: 1500
        });
      })
      .catch((error) => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: error.response.data.message,
          showConfirmButton: false,
          timer: 1500
        });
      });
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Form.Select onChange={handleAcChange} defaultValue="">
            <option value="" disabled>Select an AC</option>
            {acs.map(ac => (
              <option key={ac._id} value={ac._id}>{ac.name}</option>
            ))}
          </Form.Select>
        </Col>
        <Col>
          {selectedAc && (
            <Button variant="primary" onClick={openAddModal}>
              Add Mandal
            </Button>
          )}
        </Col>
      </Row>

      {/* Mandal Table */}
      {mandals.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Mandal Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mandals.map(mandal => (
              <tr key={mandal._id}>
                <td>{mandal.name}</td>
                <td>
                  <Button className='me-2' variant="outline-secondary" onClick={() => openUpdateModal(mandal)}>Update Mandal</Button>
                  <Button className='me-2' variant="outline-secondary" onClick={() => openVillageModal(mandal)}>Village</Button>
                  <Button variant="outline-secondary" onClick={() => deleteMandal(mandal)}>Delete Mandal</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add Mandal Modal */}
      <Modal show={showAddModal} onHide={closeAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Mandal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="mandalName">
            <Form.Label>Mandal Name</Form.Label>
            <Form.Control
              type="text"
              value={newMandalName}
              onChange={(e) => setNewMandalName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAddModal}>Close</Button>
          <Button variant="primary" onClick={addMandal}>Submit</Button>
        </Modal.Footer>
      </Modal>

      {/* Update Mandal Modal */}
      <Modal show={showUpdateModal} onHide={closeUpdateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Mandal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="updateMandalName">
            <Form.Label>Mandal Name</Form.Label>
            <Form.Control
              type="text"
              value={updateMandalName}
              onChange={(e) => setUpdateMandalName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeUpdateModal}>Close</Button>
          <Button variant="primary" onClick={updateMandal}>Update</Button>
        </Modal.Footer>
      </Modal>

      {/* Village Modal */}
      <Modal show={showVillageModal} onHide={closeVillageModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Villages in {selectedMandal && selectedMandal.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="villageName">
            <Form.Label>New Village Name</Form.Label>
            <Form.Control
              type="text"
              value={newVillageName}
              onChange={(e) => setNewVillageName(e.target.value)}
            />
            <Button variant="primary" className="mt-2" onClick={addVillage}>Add Village</Button>
          </Form.Group>
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Village Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {villages.map(village => (
                <tr key={village._id}>
                  <td>{village.name}</td>
                  <td>
                    <Button className='m-2' variant="outline-secondary" onClick={() => openUpdateVillageModal(village)}>Update</Button>
                    <Button variant="outline-secondary" onClick={() => openDeleteVillageModal(village)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeVillageModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Update Village Modal */}
      {selectedVillage && (
        <Modal show={true} onHide={() => setSelectedVillage(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Village</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="updateVillageName">
              <Form.Label>Village Name</Form.Label>
              <Form.Control
                type="text"
                value={updateVillageName}
                onChange={(e) => setUpdateVillageName(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setSelectedVillage(null)}>Close</Button>
            <Button variant="primary" onClick={updateVillage}>Update</Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default Mandal;