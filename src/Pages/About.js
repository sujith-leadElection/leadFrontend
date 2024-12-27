import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import AddAC from "../Components/AddAC";
import Mandal from "../Components/Mandal";
import AllotmentComponent from "../Components/Allotment";
const About = () => {
  const [selectedContent, setSelectedContent] = useState('ac');

  const handleContentChange = (content) => setSelectedContent(content);

  return (
    <Container className="text-center my-4 dm-sans-googleFont">
      {/* Button Section */}
      <Row className="justify-content-center my-2">
        <Col xs="auto" className="d-flex justify-content-around">
          <button class="gem-c-button govuk-button" type="submit" onClick={() => handleContentChange('ac')}>
            Add AC
          </button>
          <button class="gem-c-button govuk-button" type="submit" onClick={() => handleContentChange('mandal')}>
            Add Mandal
          </button>
          <button class="gem-c-button govuk-button" type="submit" onClick={() => handleContentChange('allotment')}>
            Allotment
          </button>
        </Col>
      </Row>

      {/* Conditional Content Display */}
      <Row>
        <Col>
          <section className="content-section">
            {selectedContent === 'ac' && (
              <AddAC />
            )}
            {selectedContent === 'mandal' && (
              <Mandal />
            )}
            {selectedContent === 'allotment' && (
              <AllotmentComponent />
            )}
          </section>
        </Col>
      </Row>
    </Container>
  );
};

export default About;