import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

// Utility function to format date as YYYY-MM-DD
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const Transfer = ({ formData = { transfer: {} }, onChange }) => {
    const [selectedOption, setSelectedOption] = useState(formData.transfer?.transferType || '');

    useEffect(() => {
        const currentTransferType = formData.transfer?.transferType || '';
        if (selectedOption !== currentTransferType) {
            let updatedTransfer = { transferType: selectedOption };

            if (selectedOption === 'retention') {
                updatedTransfer.retentionStartedAt = formatDate(formData.transfer?.retentionStartedAt);
            } else if (selectedOption === 'transfer') {
                updatedTransfer.fromVillage = formData.transfer?.fromVillage || '';
                updatedTransfer.toVillage = formData.transfer?.toVillage || '';
            } else if (selectedOption === 'recommendation' || selectedOption === 'new_post_recommendation') {
                updatedTransfer.recommendationLocation = formData.transfer?.recommendationLocation || '';
                updatedTransfer.recommendationPosition = formData.transfer?.recommendationPosition || '';
            }

            onChange({
                ...formData,
                transfer: updatedTransfer,
            });
        }
    }, [selectedOption]); // Only re-run when selectedOption changes

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        let updatedValue = value;

        if (name === 'retentionStartedAt') {
            updatedValue = formatDate(value); // Format the date
        }

        onChange({
            ...formData,
            transfer: {
                ...formData.transfer,
                [name]: updatedValue,
            },
        });
    };

    return (
        <Form>
            <Row className="mb-3">
                <Col md={12}>
                    <Form.Label>Transfer Options</Form.Label>
                    <Form.Group>
                        <Form.Check
                            type="radio"
                            label="Transfer"
                            value="transfer"
                            checked={selectedOption === 'transfer'}
                            onChange={handleOptionChange}
                            name="transferOption"
                        />
                        <Form.Check
                            type="radio"
                            label="Retention"
                            value="retention"
                            checked={selectedOption === 'retention'}
                            onChange={handleOptionChange}
                            name="transferOption"
                        />
                        <Form.Check
                            type="radio"
                            label="Recommendation"
                            value="recommendation"
                            checked={selectedOption === 'recommendation'}
                            onChange={handleOptionChange}
                            name="transferOption"
                        />
                        <Form.Check
                            type="radio"
                            label="New Post Recommendation"
                            value="new_post_recommendation"
                            checked={selectedOption === 'new_post_recommendation'}
                            onChange={handleOptionChange}
                            name="transferOption"
                        />
                    </Form.Group>
                </Col>
            </Row>

            {/* Conditional Fields */}
            {selectedOption === 'transfer' && (
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="fromVillage">
                            <Form.Label>From</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="From"
                                name="fromVillage"
                                value={formData.transfer?.fromVillage || ''}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="toVillage">
                            <Form.Label>To</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="To"
                                name="toVillage"
                                value={formData.transfer?.toVillage || ''}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            )}

            {selectedOption === 'retention' && (
                <Row className="mb-3">
                    <Col md={12}>
                        <Form.Group controlId="retentionStartedAt">
                            <Form.Label>Retention Started At</Form.Label>
                            <Form.Control
                                type="date"
                                name="retentionStartedAt"
                                value={formatDate(formData.transfer?.retentionStartedAt) || ''}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            )}

            {(selectedOption === 'recommendation' || selectedOption === 'new_post_recommendation') && (
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="recommendationLocation">
                            <Form.Label>At</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="At"
                                name="recommendationLocation"
                                value={formData.transfer?.recommendationLocation || ''}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="recommendationPosition">
                            <Form.Label>Position Designation</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Position Designation"
                                name="recommendationPosition"
                                value={formData.transfer?.recommendationPosition || ''}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            )}
        </Form>
    );
};

export default Transfer;
