import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const CMRF = ({
  formData,
  onChange,
  userRole,
  acData,
  assignedAc,
  grievanceId = ''
}) => {
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [mandalselectedDropdown, setmandalselectedDropdown] = useState('');
  const [villageselectedDropdown, setvillageselectedDropdown] = useState('');

  useEffect(() => {
    if (assignedAc) {
      const selectedAcMandals = acData[assignedAc]?.mandals || {};
      let filteredMandals = Object.entries(selectedAcMandals).map(([mandalId, mandalInfo]) => ({
        id: mandalId,
        name: mandalInfo.name,
        villages: mandalInfo.village || []
      }))
      setMandals(Object.entries(selectedAcMandals).map(([mandalId, mandalInfo]) => ({
        id: mandalId,
        name: mandalInfo.name,
        villages: mandalInfo.village || []
      })));
      if (("cmrf" in formData) && ("mandal" in formData.cmrf)) {
        const filteredVillage = mandals.filter(ind => ind.id == formData.cmrf.mandal);
        if (filteredVillage.length > 0) {
          setVillages(filteredVillage[0].villages);
          if ((filteredVillage[0].villages).some((element) => element._id == formData.cmrf.village)) {
            setmandalselectedDropdown(formData.cmrf.mandal)
            setvillageselectedDropdown(formData.cmrf.village)
          }
        } else {
          setvillageselectedDropdown('');
          setmandalselectedDropdown('');
        }
      } else {
        setvillageselectedDropdown('');
        setmandalselectedDropdown('');
      }
    } else {
      setvillageselectedDropdown('');
      setmandalselectedDropdown('');
    }
  }, [assignedAc, acData, userRole]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Extract 'yyyy-MM-dd'
  };

  const handleMandalChange = (event) => {
    const mandalId = event.target.value;
    const selectedMandal = mandals.find((m) => m.id === mandalId);
    const updatedVillages = selectedMandal ? selectedMandal.villages : [];
    setVillages(updatedVillages); // Update villages state
    setmandalselectedDropdown(mandalId);
    setvillageselectedDropdown('');
    // Call the parent's onChange function with updated data
    onChange({
      ...formData,
      cmrf: {
        ...formData.cmrf,
        mandal: mandalId,
        village: ''
      }
    });
  };

  const handleVillageChange = (event) => {
    const villageId = event.target.value;
    setvillageselectedDropdown(villageId)
    const updatedFormData = {
      ...formData,
      cmrf: {
        ...formData.cmrf,
        village: villageId
      }
    };
    // Call the parent's onChange function with updated data
    onChange(updatedFormData);
  };
  const handleAadharInputChange = (e) => {
    let { value } = e.target;

    // Remove any non-digit characters
    value = value.replace(/\D/g, '');

    // Format the value as xxxx-xxxx-xxxx
    if (value.length > 4) value = value.slice(0, 4) + '-' + value.slice(4);
    if (value.length > 9) value = value.slice(0, 9) + '-' + value.slice(9);
    // Update the formData with the formatted value
    onChange({
      ...formData,
      cmrf: {
        ...formData.cmrf,
        patientAadharId: value, // Use the formatted value
      },
    });
  };

  return (
    <Form>
      {/* Patient Details */}
      <h5>Patient Details</h5>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group controlId="mandal-select">
            <Form.Label>Select Mandal</Form.Label>
            <Form.Control
              as="select"
              value={mandalselectedDropdown}
              onChange={handleMandalChange}
            >
              <option value="">Select Mandal</option>
              {mandals.map((mandal) => (
                <option key={mandal.id} value={mandal.id}>
                  {mandal.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={12}>
          <Form.Group controlId="village-select">
            <Form.Label>Select Village</Form.Label>
            <Form.Control
              as="select"
              value={villageselectedDropdown}
              onChange={handleVillageChange}
            >
              <option value="">Select Village</option>
              {villages.map((village) => (
                <option key={village._id} value={village._id}>
                  {village.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <Form.Group controlId="patientName">
            <Form.Label>Patient Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter patient name"
              value={formData.cmrf?.patientName || ''}
              onChange={(e) =>
                onChange({
                  ...formData,
                  cmrf: {
                    ...formData.cmrf,
                    patientName: e.target.value
                  }
                })
              }
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="relation">
            <Form.Label>Relation</Form.Label>
            <Form.Control
              as="select"
              value={formData.cmrf?.relation || ''}
              onChange={(e) =>
                onChange({
                  ...formData,
                  cmrf: {
                    ...formData.cmrf,
                    relation: e.target.value
                  }
                })
              }
            >
              <option value="" disabled>Select Relation</option>
              <option value="S/O">S/O</option>
              <option value="D/O">D/O</option>
              <option value="O/O">O/O</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="fatherName">
            <Form.Label>Father's Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter father's name"
              value={formData.cmrf?.fatherName || ''}
              onChange={(e) =>
                onChange({
                  ...formData,
                  cmrf: {
                    ...formData.cmrf,
                    fatherName: e.target.value
                  }
                })
              }
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="aadharCard">
            <Form.Label>Aadhar Card</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Aadhar card number"
              value={formData.cmrf?.patientAadharId || ''} // Display the formatted value
              onChange={handleAadharInputChange}
              maxLength="14"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="phoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter phone number"
              value={formData.cmrf?.patientPhoneNumber || ''} // Corrected key
              onChange={(e) =>
                onChange({
                  ...formData,
                  cmrf: {
                    ...formData.cmrf,
                    patientPhoneNumber: e.target.value // Corrected key
                  }
                })
              }
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter address"
              value={formData.cmrf?.address || ''}
              onChange={(e) =>
                onChange({
                  ...formData,
                  cmrf: {
                    ...formData.cmrf,
                    address: e.target.value
                  }
                })
              }
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Hospital Details */}
      <h5 className="mt-4">Hospital Details</h5>
      <Row>
        <Col md={4}>
          <Form.Group controlId="hospitalName">
            <Form.Label>Hospital Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter hospital name"
              value={formData.cmrf?.hospitalName || ''}
              onChange={(e) =>
                onChange({
                  ...formData,
                  cmrf: {
                    ...formData.cmrf,
                    hospitalName: e.target.value
                  }
                })
              }
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="disease">
            <Form.Label>Disease Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter disease name"
              value={formData.cmrf?.disease || ''}
              onChange={(e) =>
                onChange({
                  ...formData,
                  cmrf: {
                    ...formData.cmrf,
                    disease: e.target.value
                  }
                })
              }
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="dateOfAdmission">
            <Form.Label>Date of Admission</Form.Label>
            <Form.Control
              type="date"
              value={formatDate(formData.cmrf?.dateOfAdmission)} // Format the date
              onChange={(e) =>
                onChange({
                  ...formData,
                  cmrf: {
                    ...formData.cmrf,
                    dateOfAdmission: e.target.value, // Save in 'yyyy-MM-dd' format
                  },
                })
              }
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="dateOfDischarge">
            <Form.Label>Date of Discharge</Form.Label>
            <Form.Control
              type="date"
              value={formatDate(formData.cmrf?.dateOfDischarge)} // Format the date
              onChange={(e) =>
                onChange({
                  ...formData,
                  cmrf: {
                    ...formData.cmrf,
                    dateOfDischarge: e.target.value, // Save in 'yyyy-MM-dd' format
                  },
                })
              }
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="totalAmount">
            <Form.Label>Total Amount</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter total amount"
              value={formData.cmrf?.totalAmount || ''}
              onChange={(e) =>
                onChange({
                  ...formData,
                  cmrf: {
                    ...formData.cmrf,
                    totalAmount: e.target.value
                  }
                })
              }
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default CMRF;