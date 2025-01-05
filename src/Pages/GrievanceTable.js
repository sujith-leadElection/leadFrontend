import React, { useEffect, useState } from 'react';
import { Table, Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import JsonToPdf from './PDFView';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import { jsPDF } from "jspdf";

const GrievanceTable = () => {
  const [grievanceCategories, setGrievanceCategories] = useState([]);
  const [grievances, setGrievances] = useState({});
  const [allGrievances, setAllGrievances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [acData, setAcData] = useState({});
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedAc, setSelectedAc] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [isAcAllocated, setIsAcAllocated] = useState(true);
  const [token, setToken] = useState('');
  const [acMap, setAcMap] = useState(new Map());
  const [mandalMap, setMandalMap] = useState(new Map());
  const [villageMap, setVillageMap] = useState(new Map());
  const [selectedDate, setSelectedDate] = useState("");
  const [tokenInfo, setUserInfo] = useState({
    userId: '',
    role: ''
  });
  const navigate = useNavigate();
  useEffect(() => {
    const initializePage = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login');
          window.location.reload();
          return;
        }

        const tokenResponse = await axios.post(`${API_BASE_URL}/auth/getTokeninfo`, { token });
        const { userId, role } = tokenResponse.data;

        setUserInfo({ userId, role }); // Update user info

        // Fetch data based on role
        if (role === 1) {
          await fetchEmployeeAcDetails(userId);
        } else if (role === 0) {
          await fetchAllAcData();
        }
        await fetchGrievances(userId, role);
      } catch (error) {
        sessionStorage.removeItem('token'); // Clear token on error
        window.location.reload();
      } finally {
        setLoading(false); // Ensure loading state is cleared
      }
    };

    initializePage();
  }, []); // Empty dependency array ensures effect runs only once on mount  
  const fetchAllACMandalVillageData = (jsonData) => {
    const acMapTemp = new Map();
    const mandalMapTemp = new Map();
    const villageMapTemp = new Map();

    // Populate temporary maps
    jsonData.data.forEach(ac => {
      acMapTemp.set(ac._id, ac.name);
      ac.mandals.forEach(mandal => {
        mandalMapTemp.set(mandal._id, mandal.name);
        mandal.villages.forEach(village => {
          villageMapTemp.set(village._id, village.name);
        });
      });
    });

    // Update state with the populated maps
    setAcMap(acMapTemp);
    setMandalMap(mandalMapTemp);
    setVillageMap(villageMapTemp);
  };
  const fetchEmployeeAcDetails = async (employeeId) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/allotment/employee-allotment/${employeeId}`);
      const allotedACId = data.allotedACId;

      if (!allotedACId) {
        setIsAcAllocated(false);
        return;
      }

      const acDetails = await axios.get(`${API_BASE_URL}/ac/getAll-ac`);
      fetchAllACMandalVillageData(acDetails.data)
      createAcMap(acDetails.data, allotedACId);
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: `Employee's AC details count not be fetched`,
        showConfirmButton: false,
        timer: 1500
      });
      setIsAcAllocated(false);
    }
  };

  const fetchAllAcData = async (allotedACId = '', allocatedMandalId = '', allocatedVillageId = '') => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/ac/getAll-ac`);
      fetchAllACMandalVillageData(data);
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
  };
  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleAcChange = (e) => {
    const acId = e.target.value;
    setSelectedAc(acId);
    if (acId) {
      setMandals(Object.keys(acData[acId]?.mandals || {}));
      let arr = [];
      Object.entries(acData[acId]?.mandals).forEach(([key, value]) => {
        arr.push({
          key: key,
          value: value
        });
      });
      setMandals(arr);
      setSelectedMandal('');
      setVillages([]);
    } else {
      setMandals([]);
      setVillages([]);
    }
  };

  const handleMandalChange = (e) => {
    const mandalId = e.target.value;
    setSelectedMandal(mandalId);
    if (mandalId) {
      setVillages(acData[selectedAc]?.mandals[mandalId].village || []);
    } else {
      setVillages([]);
    }
  };

  const handleTokenChange = (e) => {
    setToken(e.target.value); // Update state on input change
  };

  const handleVillageChange = (e) => {
    const villageId = e.target.value;
    setSelectedVillage(villageId);
  }

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
  };

  const fetchGrievances = async (userId, role) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grievances/getdocuments/${userId}/${role}`);
      if (!response.ok) {
        throw new Error('Failed to fetch grievances');
      }
      const data = await response.json();
      setGrievances(data.grievanceCategories);
      setAllGrievances(data.grievanceCategories);
      // Extract keys and update the grievanceCategories state
      const categories = Object.keys(data.grievanceCategories);
      setGrievanceCategories(categories);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const totalGrievances = Object.values(grievances).reduce(
    (acc, categoryGrievances) => acc + categoryGrievances.length,
    0
  );

  if (loading) {
    return (
      <Container className="text-center mt-5 dm-sans-googleFont">
        <Spinner animation="border" variant="primary" />
        <p>Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 dm-sans-googleFont">
        <Alert variant="danger">
          Error: {error}
        </Alert>
      </Container>
    );
  }

  const handleEdit = (grievanceId) => {
    navigate('/grievances', { state: { grievanceId } });
  };

  const deleteEdit = async (grievanceId, category) => {
    try {
      // Call the delete API
      const response = await axios.get(`${API_BASE_URL}/grievances/delete-grievance/${grievanceId}`);
      if (response.status === 200) {
        // Update the grievances state by removing the deleted grievance from the specific category
        setGrievances((prevGrievances) => {
          const updatedCategory = prevGrievances[category].filter(
            (grievance) => grievance._id !== grievanceId
          );
          return {
            ...prevGrievances,
            [category]: updatedCategory,
          };
        });
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Successfully Deleted",
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: `Failed to delete Record`,
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: `Error in deleting the Record`,
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const renderGrievanceRows = (grievanceCategory, startIndex) => {
    return grievanceCategory.map((grievance, index) => (
      <tr key={index}>
        <td style={cellStyle}>{startIndex + index}</td>
        <td style={cellStyle}>{grievance.category}</td>
        <td style={cellStyle}>{grievance.token}</td>
        <td style={cellStyle}>{grievance.name}</td>
        <td style={cellStyle}>{acMap.get(grievance.acId)}</td>
        <td style={cellStyle}>{mandalMap.get(grievance.mandalId)}</td>
        <td style={cellStyle}>{villageMap.get(grievance.villageId)}</td>
        <td style={cellStyle}>{grievance.phoneNumber}</td>
        <td style={actionCellStyle}>
          <Button variant="primary" size="sm" onClick={() => handleEdit(grievance._id)}>
            Edit
          </Button>
        </td>
        <td style={actionCellStyle}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => deleteEdit(grievance._id, grievance.category)}
          >
            Delete
          </Button>
        </td>
        <td style={actionCellStyle}>
          <JsonToPdf
            jsonData={grievance}
            acName={acMap}
            mandalName={mandalMap}
            villageName={villageMap}
          />
        </td>
      </tr>
    ));
  };
  // Styles for the table cells
  const cellStyle = {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    textAlign: 'left',
    padding: '0.75rem',
    verticalAlign: 'middle',
    border: '1px solid #dee2e6',
  };
  const actionCellStyle = {
    ...cellStyle,
    textAlign: 'center',
  };
  const handleButtonClick = () => {
    // Flatten all grievance arrays from the category keys
    const allGrievancesjson = Object.values(grievances).flat();
    // Filtering logic
    const filteredGrievances = allGrievancesjson.filter((doc) => {
      // Apply filters only if respective values are selected
      const matchesAc = selectedAc ? doc.acId === selectedAc : true;
      const matchesMandal = selectedMandal ? doc.mandalId === selectedMandal : true;
      const matchesVillage = selectedVillage ? doc.villageId === selectedVillage : true;
      const matchesCategory = selectedCategory ? doc.category === selectedCategory : true;
      const matchesToekn = token ? doc.token === token : true;
      console.log(selectedDate);
      const matchesDate = selectedDate
        ? new Date(doc.createdAt).toISOString().slice(0, 10) === selectedDate
        : true;
      // All conditions must match
      return matchesAc && matchesMandal && matchesVillage && matchesCategory && matchesToekn && matchesDate;
    });
    // Grouping the filtered grievances by category
    const groupedGrievances = filteredGrievances.reduce((acc, doc) => {
      const category = doc.category; // Default to "Uncategorized" if no category is found
      if (!acc[category]) {
        acc[category] = []; // Initialize the category array if it doesn't exist
      }
      acc[category].push(doc); // Add the document to the appropriate category
      return acc;
    }, {});
    // Updating the grievances state with the grouped data
    setGrievances(groupedGrievances);
  };
  const handleGeneratePdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const tableMarginTop = 10;

    let currentY = margin;

    const addHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Grievance Records", pageWidth / 2, currentY, {
        align: "center",
      });
      currentY += tableMarginTop;
    };

    const addCategoryTable = (category, grievancesList) => {
      // Category title
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(category, margin, currentY);
      currentY += 10;

      // Table data
      const tableData = grievancesList.map((grievance, index) => [
        index + 1,
        grievance.name,
        grievance.token,
        acMap.get(grievance.acId),
        mandalMap.get(grievance.mandalId),
        villageMap.get(grievance.villageId),
        grievance.phoneNumber,
      ]);

      const tableHeaders = [
        "SNo",
        "Name",
        "Token",
        "AC ID",
        "Mandal ID",
        "Village ID",
        "Phone Number",
      ];

      // Check if adding this table will exceed the page height
      if (currentY + tableData.length * 10 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        currentY = margin;
      }

      doc.autoTable({
        startY: currentY,
        head: [tableHeaders],
        body: tableData,
        margin: { top: 10 },
        styles: { fontSize: 8, cellPadding: 2 },
      });

      currentY = doc.autoTable.previous.finalY + tableMarginTop;
    };

    addHeader();

    // Iterate over grievances grouped by category
    Object.keys(grievances).forEach((category) => {
      if (grievances[category].length > 0) {
        addCategoryTable(category, grievances[category]);
      }
    });

    // Save the PDF
    doc.save("EmployeeGrievanceRecords.pdf");
  };
  return (
    <Container className="mt-5 dm-sans-googleFont">
      <h2>Employee Grievance Records</h2>
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
            <p>AC Not Available</p>
          )}
        </>
      )}

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="formMandalSelect">
            <Form.Label>Mandal</Form.Label>
            <Form.Control as="select" value={selectedMandal} onChange={handleMandalChange}>
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
            <Form.Control as="select" value={selectedVillage} onChange={handleVillageChange}>
              <option value="">Select Village</option>
              {villages.map((village) => (
                <option key={village._id} value={village._id}>
                  {village.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="formCategorySelect">
            <Form.Label>Category</Form.Label>
            <Form.Control as="select" value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">Select Category</option>
              {grievanceCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="formTokenField">
            <Form.Label>Token</Form.Label>
            <Form.Control
              type="text"
              value={token}
              placeholder="Enter Token"
              onChange={handleTokenChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="formDateField">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button variant="primary" onClick={handleButtonClick}>
            Submit
          </Button>
          <Button
            variant="secondary"
            className="ml-3"
            onClick={handleGeneratePdf}
            style={{marginLeft: '10px'}}
          >
            View All Records in PDF
          </Button>
        </Col>
      </Row>
      {/* Display the total number of grievances */}
      <Row className="mb-3">
        <Col>
          <h4>Total Grievances: {totalGrievances}</h4>
        </Col>
      </Row>
      {Object.keys(grievances).reduce((acc, category, categoryIdx) => {
        // Skip to the next iteration if the current category has no grievances
        if (grievances[category].length === 0) {
          return acc;
        }

        const rows = renderGrievanceRows(grievances[category], acc.currentIndex);
        acc.currentIndex += grievances[category].length;
        acc.elements.push(
          <Row key={categoryIdx} className="mb-4">
            <Col md={12}>
              <div className="category-section">
                <h4 className="category-title">{category}</h4>
                <Table striped bordered hover className="equal-spacing-table">
                  <thead>
                    <tr>
                      <th>SNo</th>
                      <th>Category</th>
                      <th>Token</th>
                      <th>Name</th>
                      <th>AC</th>
                      <th>Mandal</th>
                      <th>Village</th>
                      <th>Phone Number</th>
                      <th>Edit</th>
                      <th>Delete</th>
                      <th>Export</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>
              </div>
            </Col>
          </Row>
        );
        return acc;
      }, { elements: [], currentIndex: 1 }).elements}
    </Container>
  );
};

export default GrievanceTable;