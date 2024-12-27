import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const JOBS = ({ 
  formData = { jobs: { referencePersonName: '', referencePhoneNumber: '', qualification: '', otherQualification: '' } }, 
  onChange 
}) => {
  const [showOtherInput, setShowOtherInput] = useState(false);

  // Ensure `formData.jobs` is always initialized
  const jobsData = formData.jobs || { 
    referencePersonName: '', 
    referencePhoneNumber: '', 
    qualification: '', 
    otherQualification: '' 
  };

  const handleQualificationChange = (e) => {
    const selectedQualification = e.target.value;
    setShowOtherInput(selectedQualification === 'Others');
    onChange({
      ...formData,
      jobs: {
        ...jobsData, // Use `jobsData` to ensure default values are handled
        qualification: selectedQualification,
        otherQualification: selectedQualification === 'Others' ? jobsData.otherQualification : '' // Clear otherQualification if not 'Others'
      }
    });
  };

  return (
    <Form>
      {/* Reference Details */}
      <h5>Reference Details</h5>
      <Row>
        <Col md={4}>
          <Form.Group controlId="referencePerson">
            <Form.Label>Reference Person</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter reference person"
              value={jobsData.referencePersonName}
              onChange={(e) => onChange({
                ...formData,
                jobs: {
                  ...jobsData,
                  referencePersonName: e.target.value
                }
              })}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="referencePhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter phone number"
              value={jobsData.referencePhoneNumber}
              onChange={(e) => onChange({
                ...formData,
                jobs: {
                  ...jobsData,
                  referencePhoneNumber: e.target.value
                }
              })}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Qualifications */}
      <h5 className="mt-4">Qualifications</h5>
      <Row>
        <Col>
          {[
            'SSC', 'INTERMEDIATE', 'ITI', 'POLYTECHNIC', 'DEGREE', 'BCOM', 'B.TECH',
            'BA', 'DEGREE BACHELORS', 'B.SC', 'B.ED', 'MASTERS', 'MBA', 'Others'
          ].map((qualification) => (
            <Form.Check
              key={qualification}
              type="radio"
              label={qualification}
              name="qualification"
              value={qualification}
              checked={jobsData.qualification === qualification}
              onChange={handleQualificationChange}
            />
          ))}

          {/* Show other qualification input if "Others" is selected */}
          {(showOtherInput || jobsData.qualification === 'Others') && (
            <Form.Group controlId="otherQualification" className="mt-2">
              <Form.Label>Other Qualification</Form.Label>
              <Form.Control
                type="text"
                placeholder="Specify other qualification"
                value={jobsData.otherQualification}
                onChange={(e) => onChange({
                  ...formData,
                  jobs: {
                    ...jobsData,
                    otherQualification: e.target.value
                  }
                })}
              />
            </Form.Group>
          )}
        </Col>
      </Row>
    </Form>
  );
};

export default JOBS;