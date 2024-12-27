import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminLeaveApproval.css';
import Swal from 'sweetalert2';

const AdminLeaveApproval = () => {
  const [notApprovedLeaves, setNotApprovedLeaves] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [rejectedLeaves, setRejectedLeaves] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        const response = await axios.get('http://localhost:8000/employee/getAllHistoryOfAllEmployees');
        setNotApprovedLeaves(response.data.notApprovedLeaves);
        setApprovedLeaves(response.data.approvedLeaves);
        setRejectedLeaves(response.data.rejectedLeaves);
      } catch (error) {
        setError('Error fetching leave history. Please try again later.');
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: `Error fetching leave history. Please try again later.`,
          showConfirmButton: false,
          timer: 1500
        });
      }
    };

    fetchLeaveHistory();
  }, []);

  const handleApprove = async (leaveId, employeeId) => {
    try {
      await axios.put(`http://localhost:8000/employee/approve-leave/${leaveId}/${employeeId}`);
      const approvedLeave = notApprovedLeaves.find(leave => leave._id === leaveId);
      setNotApprovedLeaves(notApprovedLeaves.filter(leave => leave._id !== leaveId));
      setApprovedLeaves([...approvedLeaves, { ...approvedLeave, approved: 'APPROVED' }]);
    } catch (error) {
      setError('Error approving leave. Please try again.');
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: `Leave has been cancelled by the Employee.`,
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const handleReject = async (leaveId, employeeId) => {
    try {
      await axios.put(`http://localhost:8000/employee/reject-leave/${leaveId}/${employeeId}`);
      const rejectedLeave = notApprovedLeaves.find(leave => leave._id === leaveId);
      setNotApprovedLeaves(notApprovedLeaves.filter(leave => leave._id !== leaveId));
      setRejectedLeaves([...rejectedLeaves, { ...rejectedLeave, approved: 'REJECTED',
        _doc: {
          date: rejectedLeave.date,
          type: rejectedLeave.type,
          purpose: rejectedLeave.purpose
        }
       }]);
    } catch (error) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: `Leave has been cancelled by the Employee.`,
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  return (
    <div className="admin-leave-approval-container" style={{
      fontFamily: 'CustomFont',
      fontWeight: 900,
      textAlign:'left'
    }}>
      <h1 className="title">Admin Leave Approval</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="section" style={{textAlign:'left'}}>
        <h2>Leaves Not Yet Approved</h2>
        {notApprovedLeaves.length > 0 ? (
          <table className="leave-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Purpose</th>
                <th>Employee Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notApprovedLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{new Date(leave.date).toLocaleDateString('en-GB')}</td>
                  <td>{leave.type}</td>
                  <td>{leave.purpose}</td>
                  <td>{leave.employeeName}</td>
                  <td>
                    <button className="approve-button" onClick={() => handleApprove(leave._id, leave.employeeId)}>Approve</button>
                    <button className="reject-button" onClick={() => handleReject(leave._id, leave.employeeId)}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-message">No leaves pending approval.</p>
        )}
      </div>

      <div className="section">
        <h2>Approved Leaves</h2>
        {approvedLeaves.length > 0 ? (
          <table className="leave-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Purpose</th>
                <th>Employee Name</th>
              </tr>
            </thead>
            <tbody>
              {approvedLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{new Date(leave.date).toLocaleDateString('en-GB')}</td>
                  <td>{leave.type}</td>
                  <td>{leave.purpose}</td>
                  <td>{leave.employeeName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-message">No approved leaves yet.</p>
        )}
      </div>

      <div className="section">
        <h2>Rejected Leaves</h2>
        {rejectedLeaves.length > 0 ? (
          <table className="leave-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Purpose</th>
                <th>Employee Name</th>
              </tr>
            </thead>
            <tbody>
              {rejectedLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td>{new Date(leave._doc.date).toLocaleDateString('en-GB')}</td>
                  <td>{leave._doc.type}</td>
                  <td>{leave._doc.purpose}</td>
                  <td>{leave.employeeName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-message">No rejected leaves yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminLeaveApproval;