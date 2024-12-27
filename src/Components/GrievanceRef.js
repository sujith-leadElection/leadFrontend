import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const GrievanceRef = ({ formData = { grievanceRef: { subject: '', content: '' } }, onChange }) => (
  <Form>
    <Row>
      <Col md={4}>
        <Form.Group controlId="subject">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter subject"
            value={formData.grievanceRef?.subject || ''}
            onChange={(e) =>
              onChange({
                ...formData,
                grievanceRef: {
                  ...formData.grievanceRef,
                  subject: e.target.value
                }
              })
            }
          />
        </Form.Group>
      </Col>
      <Col md={8}>
        <Form.Group controlId="content">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            placeholder="Enter content"
            value={formData.grievanceRef?.content || ''}
            onChange={(e) =>
              onChange({
                ...formData,
                grievanceRef: {
                  ...formData.grievanceRef,
                  content: e.target.value
                }
              })
            }
          />
        </Form.Group>
      </Col>
    </Row>
  </Form>
);

export default GrievanceRef;