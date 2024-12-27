import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LeaveManagement from "../Components/EmployeeHRPlanner";
import AdminLeaveApproval from "../Components/AdminHRPlanner";
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
const AttendancePlanner = () => {
    const [userInfo, setUserInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const initializePage = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    window.location.reload();
                } else {
                    const tokenResponse = await axios.post(
                        `${API_BASE_URL}/auth/getTokeninfo`,
                        { token }
                    );
                    const { userId, role } = tokenResponse.data;
                    setUserInfo({ userId, role });

                    // Fetch consolidated data based on user role
                    const response = await axios.get(
                        `${API_BASE_URL}/grievances/consolidated-data/${userId}/${role}`
                    );
                    setData(response.data.data);
                }
            } catch (error) {
                sessionStorage.removeItem('token');
                window.location.reload();
            } finally {
                setLoading(false);
            }
        };

        initializePage();
    }, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {userInfo.role === 0 ? (
                <AdminLeaveApproval />
            ) : userInfo.role === 1 ? (
                <LeaveManagement employeeId={userInfo.userId} />
            ) : (
                <div>Unauthorized: Invalid Role</div>
            )}
        </>
    );
};

export default AttendancePlanner;