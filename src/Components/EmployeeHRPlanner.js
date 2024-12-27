import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import './LeaveManagement.css';
import Swal from 'sweetalert2';

const LeaveManagement = ({ employeeId }) => {
    const [leaveData, setLeaveData] = useState([]);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [extraLeaves, setExtraLeaves] = useState(0);
    const [leaveType, setLeaveType] = useState('sick');
    const [leaveDate, setLeaveDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchLeaveData = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/employee/leave-data/${employeeId}`);
                setLeaveData(response.data.leaveData);
                setExtraLeaves(response.data.extraLeaves);
            } catch (err) {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: `Error in fetching leave data. Please try again.`,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        };

        const fetchLeaveHistory = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/employee/leave-history/${employeeId}`);
                setLeaveHistory(response.data);
            } catch (err) {
                return
            }
        };

        fetchLeaveData();
        fetchLeaveHistory();
    }, [employeeId]);

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/employee/apply-leave', {
                employeeId,
                date: leaveDate,
                type: leaveType,
                purpose,
            });
            setSuccess(response.data.message);
            setError('');
            setLeaveDate('');
            setPurpose('');
            // Refetch data after successful application
            const resLeaveData = await axios.get(`http://localhost:8000/employee/leave-data/${employeeId}`);
            setLeaveData(resLeaveData.data.leaveData);
            setExtraLeaves(resLeaveData.data.extraLeaves);
            const resLeaveHistory = await axios.get(`http://localhost:8000/employee/leave-history/${employeeId}`);
            setLeaveHistory(resLeaveHistory.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error applying for leave');
            setSuccess('');
        }
    };

    const handleCancelLeave = async (leaveId) => {
        try {
            const response = await axios.put(`http://localhost:8000/employee/cancel-leave/${employeeId}/${leaveId}`);
            setSuccess(response.data.message);
            setError('');
            // Refetch data after successful application
            const resLeaveData = await axios.get(`http://localhost:8000/employee/leave-data/${employeeId}`);
            setLeaveData(resLeaveData.data.leaveData);
            setExtraLeaves(resLeaveData.data.extraLeaves);
            const resLeaveHistory = await axios.get(`http://localhost:8000/employee/leave-history/${employeeId}`);
            setLeaveHistory(resLeaveHistory.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error canceling leave');
            setSuccess('');
        }
    };
    return (
        <Container className="leave-management-container">
            <Row>
                {/* Left Section: Apply Leave */}
                <Col md={6} className="apply-leave">
                    <h2>Apply for Leave</h2>
                    <Form onSubmit={handleApplyLeave}>
                        <Form.Group controlId="leaveDate">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={leaveDate}
                                onChange={(e) => setLeaveDate(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="leaveType">
                            <Form.Label>Leave Type</Form.Label>
                            <Form.Control
                                as="select"
                                value={leaveType}
                                onChange={(e) => setLeaveType(e.target.value)}
                                required
                            >
                                <option value="sick">Sick Leave</option>
                                <option value="casual">Casual Leave</option>
                                <option value="extra">Extra Leave</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="purpose">
                            <Form.Label>Purpose</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button type="submit" className="submit-button mt-3">Apply Leave</Button>
                    </Form>

                    {success && <Alert variant="success" className="mt-3">{success}</Alert>}
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                    <Alert variant="info" className="mt-4">
                        <h5>Leave Application Rules:</h5>
                        <ListGroup>
                            <ListGroup.Item className="rule-item">
                                <strong>Sick Leave</strong> must be applied for the <span className="highlight">previous day</span>.
                            </ListGroup.Item>
                            <ListGroup.Item className="rule-item">
                                <strong>Casual and Extra Leave</strong> must be applied for a date between <span className="highlight">3 and 15 days from today</span>.
                            </ListGroup.Item>
                        </ListGroup>
                    </Alert>
                </Col>

                {/* Right Section: Leave Data */}
                <Col md={6} className="leave-data">
                    <h2>Leave Data</h2>
                    {leaveData.length > 0 ? (
                        <table className="leave-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Sick Leave</th>
                                    <th>Casual Leave</th>
                                    <th>Total Leave Left</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveData.map((data) => (
                                    <tr key={`${data.month}-${data.year}`}>
                                        <td>{data.month}</td>
                                        <td>{data.sickLeave}</td>
                                        <td>{data.casualLeave}</td>
                                        <td>{data.totalLeaveLeft}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="empty-message">No leave data available</p>
                    )}

                    <h3>Extra Leaves: {extraLeaves}</h3>

                    <h2>Leave History</h2>
                    {leaveHistory.length > 0 ? (
                        <table className="leave-history-table">
                            <thead>
                                <tr>
                                    <th>Leave Date</th>
                                    <th>Type</th>
                                    <th>Purpose</th>
                                    <th>Approved</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveHistory.map((leave, index) => (
                                    <tr key={index}>
                                        <td>{new Date(leave.date).toLocaleDateString()}</td>
                                        <td>{leave.type}</td>
                                        <td>{leave.purpose}</td>
                                        <td>{leave.approved}</td>
                                        <td>
                                            {leave.approved === 'NOT YET APPROVED' && (
                                                <Button
                                                    onClick={() => handleCancelLeave(leave._id)}
                                                    className="cancel-button"
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="empty-message">No leave history available</p>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default LeaveManagement;