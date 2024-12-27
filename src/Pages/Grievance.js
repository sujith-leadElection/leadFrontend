import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, Container, Row, Col, Spinner } from 'react-bootstrap';
import GrievanceRefForm from '../Components/GrievanceRef';
import CmrfForm from '../Components/CMRF';
import Jobs from '../Components/Jobs';
import Development from '../Components/Development';
import Transfer from '../Components/Transfer';
import Others from '../Components/Others';
import { validateForm } from './GrievancesValidation';
import axios from 'axios';
import Swal from 'sweetalert2';

const LetterRequestForm = () => {
  const [loading, setLoading] = useState(true); // Loading state
  const [tokenInfo, setUserInfo] = useState({ userId: '', role: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [acData, setAcData] = useState({});
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedAc, setSelectedAc] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [isAcAllocated, setIsAcAllocated] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    relation: '',
    fatherName: '',
    age: '',
    aadharId: '',
    phoneNumber: '',
    letterRequired: false,
    to: '',
    purpose: '',
    acId: '',
    mandalId: '',
    villageId: ''
  });
  const location = useLocation();
  const grievanceId = location.state?.grievanceId || null;
  const navigate = useNavigate();

  useEffect(() => {
    const initializePage = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login');
          window.location.reload();
        } else {
          const tokenResponse = await axios.post('http://localhost:8000/auth/getTokeninfo', { token });
          const { userId, role } = tokenResponse.data;
          setUserInfo({ userId, role });

          if (role === 1) {
            await fetchEmployeeAcDetails(userId);
          } else if (role === 0) {
            await fetchAllAcData();
          }

          if (grievanceId) {
            await fetchGrievanceData(grievanceId);
          }
        }
      } catch (error) {
        sessionStorage.removeItem('token');
        window.location.reload();
      } finally {
        setLoading(false); // Set loading to false after all requests complete
      }
    };

    initializePage();
  }, [grievanceId]);

  const fetchGrievanceData = async (grievanceId) => {
    try {
      const response = await axios.get(`http://localhost:8000/grievances/getdocument/${grievanceId}`);
      const letterRequestData = response.data.letterRequest;
      setFormData(letterRequestData);
      if (letterRequestData.acId) {
        setSelectedAc(letterRequestData.acId);
        if (letterRequestData.mandalId) setSelectedMandal(letterRequestData.mandalId);
        if (letterRequestData.villageId) setSelectedVillage(letterRequestData.villageId);
      }
      setSelectedCategory(letterRequestData.category);

      await fetchAllAcData(letterRequestData.acId, letterRequestData.mandalId, letterRequestData.villageId);
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: `Error in fetching Data`,
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const fetchEmployeeAcDetails = async (employeeId) => {
    try {
      const { data } = await axios.get(`http://localhost:8000/allotment/employee-allotment/${employeeId}`);
      const allotedACId = data.allotedACId;

      if (!allotedACId) {
        setIsAcAllocated(false); // AC is not allocated
        return;
      }

      setFormData({
        ...formData,
        acId: allotedACId,
      });

      const acDetails = await axios.get('http://localhost:8000/ac/getAll-ac');
      createAcMap(acDetails.data, allotedACId);
    } catch (error) {
      setIsAcAllocated(false); // Handle the error as "AC not allocated"
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: `Error fetching AC details`,
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const fetchAllAcData = async (allotedACId = '', allocatedMandalId = '', allocatedVillageId = '') => {
    try {
      const { data } = await axios.get('http://localhost:8000/ac/getAll-ac');
      createAcMap(data, allotedACId, allocatedMandalId, allocatedVillageId);
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: `Error in fetching AC details`,
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const createAcMap = (data, allotedACId = '', allocatedMandalId = '', allocatedVillageId = '') => {
    const acMap = {};
    data.data.forEach((ac) => {
      acMap[ac._id] = {
        name: ac.name,
        mandals: ac.mandals.reduce((acc, mandal) => {
          acc[mandal._id] = {
            name: mandal.name,
            village: mandal.villages
          };
          return acc;
        }, {})
      };
    });
    setAcData(acMap);
    if (allotedACId && acMap[allotedACId]) {
      setSelectedAc(allotedACId);
      setMandals(Object.entries(acMap[allotedACId].mandals).map(([key, value]) => ({ key, value })));
    }
    if (grievanceId) {
      setVillages(acMap[allotedACId]?.mandals[allocatedMandalId]?.village || []);
    }
  };

  const handleAcChange = (e) => {
    const acId = e.target.value;
    setSelectedAc(acId);
    setMandals(Object.keys(acData[acId]?.mandals || {}));
    let arr = [];
    setFormData({
      ...formData,
      acId: acId
    })
    Object.entries(acData[acId]?.mandals).forEach(([key, value]) => {
      arr.push({
        key: key,
        value: value
      });
    });
    setMandals(arr);
    setSelectedMandal('');
    setSelectedVillage('');
    setVillages([]);
    setFormData({
      ...formData,
      mandalId: '',
      villageId: ''
    })
  };

  const handleMandalChange = (e) => {
    const mandalId = e.target.value;
    setSelectedMandal(mandalId);
    setFormData({
      ...formData,
      mandalId: mandalId,
      villageId: ''
    })
    setSelectedVillage('');
    setVillages(acData[selectedAc]?.mandals[mandalId].village || []);
  };

  const handleVillageChange = (e) => {
    const villageId = e.target.value;
    setSelectedVillage(villageId);
    setFormData({
      ...formData,
      villageId: villageId
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };
  const handleAadharInputChange = (e) => {
    let { value } = e.target;

    // Remove any non-digit characters
    value = value.replace(/\D/g, '');

    // Format the value as xxxx-xxxx-xxxx
    if (value.length > 4) value = value.slice(0, 4) + '-' + value.slice(4);
    if (value.length > 9) value = value.slice(0, 9) + '-' + value.slice(9);

    // Update the form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      aadharId: value,
    }));
  };

  const handleRelationChange = (e) => {
    setFormData({ ...formData, relation: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm(formData)) {
      return
    }
    // Determine whether to make a POST or PUT request
    const url = grievanceId
      ? `http://localhost:8000/grievances/${grievanceId}`
      : `http://localhost:8000/grievances/${tokenInfo.userId}/${selectedCategory}/${tokenInfo.role}`;

    const method = grievanceId ? "put" : "post"; // Use 'put' for updates, 'post' for creation
    axios({
      method,
      url,
      data: {
        ...formData,
        acId: selectedAc,
        mandalId: selectedMandal,
        villageId: selectedVillage
      }, // send formData as the request body
      headers: {
        'Content-Type': 'application/json', // specify JSON content type
      },
    })
      .then((response) => {
        setSelectedCategory('');
        setFormData({
          name: '',
          gender: '',
          relation: '',
          fatherName: '',
          age: '',
          aadharId: '',
          phoneNumber: '',
          letterRequired: false,
          to: '',
          purpose: '',
          acId: tokenInfo.role ? selectedAc : '',
          mandalId: '',
          villageId: ''
        });
        setSelectedMandal('');
        setSelectedVillage('');
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `${grievanceId ? "Record Updated Successfully" : "Record Added Successfully"}`,
          showConfirmButton: false,
          timer: 1500
        });
      })
      .catch((error) => {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: `${error.response.data.message}`,
          showConfirmButton: false,
          timer: 1500
        });
      });
  };

  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setFormData({ ...formData, letterRequired: checked, to: '', purpose: '' });
  };

  const renderCategoryForm = () => {
    switch (selectedCategory) {
      case 'GrievanceRef':
        return <GrievanceRefForm formData={formData} onChange={setFormData} />;
      case 'CMRF':
        return <CmrfForm formData={formData} onChange={setFormData} userRole={tokenInfo.role}
          acData={acData}
          assignedAc={selectedAc} grievanceId={grievanceId} />;
      case 'JOBS':
        return <Jobs formData={formData} onChange={setFormData} />;
      case 'DEVELOPMENT':
        return <Development
          formData={formData}
          onChange={setFormData}
          userRole={tokenInfo.role}
          acData={acData}
          assignedAc={selectedAc}
          grievanceId={grievanceId}
        />
      case 'Transfer':
        return <Transfer formData={formData} onChange={setFormData} />
      case 'Others':
        return <Others formData={formData} onChange={setFormData} />
      default:
        return null;
    }
  };

  const handleCategoryClick = (category) => {
    const updatedFormData = { ...formData };
    switch (selectedCategory) {
      case 'GrievanceRef':
        delete updatedFormData['grievanceRef'];
        break;
      case 'CMRF':
        delete updatedFormData['cmrf'];
        break;
      case 'JOBS':
        delete updatedFormData['jobs'];
        break;
      case 'DEVELOPMENT':
        delete updatedFormData['development'];
        break;
      case 'Transfer':
        delete updatedFormData['transfer'];
        break;
      case 'Others':
        delete updatedFormData['others'];
        break;
      default:
        break;
    }
    updatedFormData.category = category;
    setFormData(updatedFormData);
    setSelectedCategory(category);
  };

  const currentDate = new Date().toLocaleDateString();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center dm-sans-googleFont" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  } else if (!isAcAllocated) {
    return (
      <Container className="d-flex justify-content-center align-items-center dm-sans-googleFont" style={{ height: '100vh' }}>
        <h3>No allotment found for the employee</h3>
      </Container>
    );
  }
  else {
    return (
      <Container className='dm-sans-googleFont'>
        <Row className="align-items-center">
          <Col>
            <h6 className="text-primary fw-bold">
              📅 Current Date: {currentDate}
            </h6>
          </Col>
        </Row>
        <h3 className="my-4 me-3 ps-2">Letter Request Form</h3>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formGender">
                <Form.Label>Gender</Form.Label>
                <Form.Control
                  as="select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formRelation">
                <Form.Label>Relation</Form.Label>
                <div className="d-flex">
                  <Form.Check
                    type="radio"
                    label="S/O"
                    name="relation"
                    value="S/O"
                    checked={formData.relation === 'S/O'}
                    onChange={handleRelationChange}
                    inline
                  />
                  <Form.Check
                    type="radio"
                    label="D/O"
                    name="relation"
                    value="D/O"
                    checked={formData.relation === 'D/O'}
                    onChange={handleRelationChange}
                    inline
                  />
                  <Form.Check
                    type="radio"
                    label="O/O"
                    name="relation"
                    value="O/O"
                    checked={formData.relation === 'O/O'}
                    onChange={handleRelationChange}
                    inline
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="formFatherName">
                <Form.Label>Father's Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formAge">
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formAadharId">
                <Form.Label>Aadhar ID</Form.Label>
                <Form.Control
                  type="text"
                  name="aadharId"
                  value={formData.aadharId}
                  onChange={handleAadharInputChange}
                  maxLength="14" // Limit input length to account for hyphens
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="formPhoneNumber">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Form.Check
                type="checkbox"
                label="Letter Required"
                checked={formData.letterRequired}
                onChange={handleCheckboxChange}
              />
            </Col>
          </Row>
          {formData.letterRequired && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formTo">
                  <Form.Label>To</Form.Label>
                  <Form.Control
                    type="text"
                    name="to"
                    value={formData.to}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formPurpose">
                  <Form.Label>Purpose</Form.Label>
                  <Form.Control
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
          <Row className="mb-4">
            <Col>
              <h5>Select Category</h5>
              <div className="d-flex justify-content-between">
                {['GrievanceRef', 'CMRF', 'JOBS', 'DEVELOPMENT', 'Transfer', 'Others'].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'primary' : 'outline-primary'}
                    onClick={() => handleCategoryClick(cat)}
                    className="me-2"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
          {tokenInfo.role === 0 ? (
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="formAcSelect">
                  <Form.Label>AC</Form.Label>
                  <Form.Control as="select" value={selectedAc} onChange={handleAcChange}>
                    <option value="">Select AC</option>
                    {Object.keys(acData).map(acId => (
                      <option key={acId} value={acId}>
                        {acData[acId].name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
          ) : (
            <>
              <h5>Employee AC ID:</h5>
              {acData[selectedAc] ? (
                <p>{acData[selectedAc].name}</p>
              ) : (
                <p>Loading AC information...</p>
              )}
            </>
          )}

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="formMandalSelect">
                <Form.Label>Mandal</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedMandal}
                  onChange={handleMandalChange}
                >
                  <option value="">Select Mandal</option>
                  {mandals.map((mandal) => (
                    <option key={mandal.key} value={mandal.key}>
                      {mandal.value.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formVillageSelect">
                <Form.Label>Village</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedVillage}
                  onChange={handleVillageChange}
                  disabled={!selectedMandal} // Disable if selectedMandal is empty
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
          {renderCategoryForm()}
          <Row style={{ textAlign: 'center' }}>
            <Col>
              <button class="gem-c-button govuk-button" type="submit" style={{ width: '30%', margin: '20px' }}>
                {grievanceId ? "Update" : "Submit"}
              </button>
            </Col>
          </Row>
        </Form>
      </Container>
    );
  }
};

export default LetterRequestForm;