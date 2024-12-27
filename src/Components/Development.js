import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const Development = ({
    formData = {
        development: {
            ac: '',
            mandal: '',
            village: '',
            authority: '',
            issue: '',
            letterIssue: false,
        }
    },
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
            setMandals(Object.entries(selectedAcMandals).map(([mandalId, mandalInfo]) => ({
                id: mandalId,
                name: mandalInfo.name,
                villages: mandalInfo.village || []
            })));
            if (("development" in formData) && ("mandal" in formData.development)) {
                const filteredVillage = mandals.filter(ind => ind.id == formData.development.mandal);
                if (filteredVillage.length > 0) {
                    setVillages(filteredVillage[0].villages);
                    if ((filteredVillage[0].villages).some((element) => element._id == formData.development.village)) {
                        setmandalselectedDropdown(formData.development.mandal)
                        setvillageselectedDropdown(formData.development.village)
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
            development: {
                ...formData.development,
                mandal: mandalId,
                village: ''
            }
        });
    };

    const handleVillageChange = (event) => {
        const villageId = event.target.value;
        setvillageselectedDropdown(villageId)
        onChange({
            ...formData,
            development: {
                ...formData.development,
                village: villageId
            }
        });
    };

    const handleAuthorityChange = (event) => {
        const authority = event.target.value;
        onChange({
            ...formData,
            development: {
                ...formData.development,
                authority
            }
        });
    };

    const handleIssueChange = (event) => {
        const issue = event.target.value;
        onChange({
            ...formData,
            development: {
                ...formData.development,
                issue
            }
        });
    };

    const handleLetterIssueChange = (event) => {
        const letterIssue = event.target.value === "yes";
        onChange({
            ...formData,
            development: {
                ...formData.development,
                letterIssue
            }
        });
    };

    return (
        <Form>
            <Row className="mb-3">
                <Col md={12}>
                    <Form.Group controlId="mandal-select">
                        <Form.Label>Select Mandal</Form.Label>
                        <Form.Control
                            as="select"
                            value={formData.development?.mandal || ''}
                            onChange={handleMandalChange}
                            disabled={!assignedAc}
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
                            value={formData.development?.village || ''}
                            onChange={handleVillageChange}
                            disabled={!formData.development?.mandal}
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

            <Row className="mb-3">
                <Col md={12}>
                    <Form.Group controlId="authority">
                        <Form.Label>Authority</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Authority"
                            value={formData.development?.authority || ''}
                            onChange={handleAuthorityChange}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={12}>
                    <Form.Group controlId="issue">
                        <Form.Label>Issue</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Issue"
                            value={formData.development?.issue || ''}
                            onChange={handleIssueChange}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={12}>
                    <Form.Group controlId="letter-issue">
                        <Form.Label>Letter Issue</Form.Label>
                        <Form.Control
                            as="select"
                            value={formData.development?.letterIssue === undefined ? "" : formData.development.letterIssue ? "yes" : "no"}
                            onChange={handleLetterIssueChange}
                        >
                            <option value="" disabled>
                                Select an option
                            </option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
};

export default Development;