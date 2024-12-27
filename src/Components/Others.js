import React, { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Others = ({ formData, onChange }) => (
  <Form>
    <Row>
      <Col md={4}>
        <Form.Group controlId="subject">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter subject"
            value={formData.others?.subject || ''}
            onChange={(e) =>
              onChange({
                ...formData,
                others: {
                  ...formData.others,
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
            value={formData.others?.content || ''}
            onChange={(e) =>
              onChange({
                ...formData,
                others: {
                  ...formData.others,
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

export default Others;