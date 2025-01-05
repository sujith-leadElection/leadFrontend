import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2'; // Import chart components from react-chartjs-2
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'; // Import necessary chart.js elements
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from '../config';

// Register the necessary chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializePage = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          window.location.reload();
        } else {
          const tokenResponse = await axios.post(
            `${API_BASE_URL}/auth/getTokeninfo`,
            { token }
          );
          const { userId, role } = tokenResponse.data;
          setUserInfo({ userId, role });
          const profileResponse = await axios.get(`${API_BASE_URL}/employee/profile/${userId}`);
          setProfile(profileResponse.data);

          const response = await axios.get(
            `${API_BASE_URL}/grievances/consolidated-data/${userId}/${role}`
          );
          setData(response.data.data);
          console.log(response.data.data);

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
    return <div className="loading-screen">Loading...</div>;
  }

  if (!data) {
    return <div>Error loading data!</div>;
  }

  const grievanceCategories = data?.grievanceCategories || {};
  const grievanceLabels = Object.keys(grievanceCategories || {});
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const grievanceCounts = grievanceLabels.map((category) => ({
    category,
    count: grievanceCategories[category]?.length || 0,
  }));
  // Calculate grievances counts for today
  const todayGrievanceCounts = grievanceLabels.map((category) => {
    const grievances = grievanceCategories[category] || [];
    const todayCount = grievances.filter(
      (grievance) => grievance.createdAt && grievance.createdAt.startsWith(today)
    ).length;
    return { category, count: todayCount };
  });

  const transferTypes = ['transfer', 'retention', 'recommendation', 'new_post_recommended'];
  const totalEmployees = data.employees?.length || 0;
  const totalRecords = grievanceCounts.reduce(
    (acc, { count }) => acc + (count || 0),
    0
  );
  const pieChartData = {
    labels: grievanceCounts.map((item) => item.category),
    datasets: [
      {
        data: grievanceCounts.map((item) => item.count),
        backgroundColor: COLORS,
      },
    ],
  };

  // Pie chart options with legend below the chart
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom', // Set legend position to bottom
      },
    },
  };
  // Bar chart data and options
  const barChartData = {
    labels: grievanceCounts.map((item) => item.category),
    datasets: [
      {
        label: 'Grievances',
        data: grievanceCounts.map((item) => item.count),
        backgroundColor: COLORS,
      },
    ],
  };
  const barChartOptions = {
    scales: {
      x: {
        ticks: {
          font: {
            size: 10, // Adjust this value to set the desired font size
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 12, // You can also adjust the y-axis label size if needed
          },
        },
      },
    },
  };

  // Process data to count genders in each category
  const genderCountsByCategory = grievanceLabels.map((category) => {
    const grievances = grievanceCategories[category] || [];
    const genderCounts = grievances.reduce(
      (acc, grievance) => {
        acc[grievance.gender] = (acc[grievance.gender] || 0) + 1;
        return acc;
      },
      { Male: 0, Female: 0 }
    );
    return { category, ...genderCounts };
  });

  // Prepare data for the stacked bar chart
  const stackedBarChartData = {
    labels: grievanceLabels,
    datasets: [
      {
        label: 'Male',
        data: genderCountsByCategory.map((item) => item.Male),
        backgroundColor: '#0088FE',
      },
      {
        label: 'Female',
        data: genderCountsByCategory.map((item) => item.Female),
        backgroundColor: '#FF8042',
      },
    ],
  };

  // Stacked bar chart options
  const stackedBarChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: {
            size: 10, // Adjust this value to set the desired font size for x-axis labels
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          font: {
            size: 12, // You can also adjust the y-axis label size if needed
          },
        },
      },
    },
  };

  // Define age groups
  const ageGroups = ['<20', '20-29', '30-39', '40-49', '50+'];

  // Process data to count ages in each category
  const ageCountsByCategory = grievanceLabels.map((category) => {
    const grievances = grievanceCategories[category] || [];
    const ageCounts = grievances.reduce(
      (acc, grievance) => {
        const age = grievance.age || 0;
        if (age < 20) acc['<20'] += 1;
        else if (age >= 20 && age <= 29) acc['20-29'] += 1;
        else if (age >= 30 && age <= 39) acc['30-39'] += 1;
        else if (age >= 40 && age <= 49) acc['40-49'] += 1;
        else acc['50+'] += 1;
        return acc;
      },
      { '<20': 0, '20-29': 0, '30-39': 0, '40-49': 0, '50+': 0 }
    );
    return { category, ...ageCounts };
  });

  // Prepare data for the age distribution chart
  const ageDistributionChartData = {
    labels: grievanceLabels,
    datasets: ageGroups.map((group, index) => ({
      label: group,
      data: ageCountsByCategory.map((item) => item[group]),
      backgroundColor: COLORS[index % COLORS.length],
    })),
  };

  // Chart options
  const ageDistributionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: {
            size: 10, // Adjust this value to set the desired font size for x-axis labels
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          font: {
            size: 12, // You can also adjust the y-axis label size if needed
          },
        },
      },
    },
  };

  // Filter and process data for `transferType`
  const transferDataByGender = transferTypes.map((type) => {
    const genderCounts = (data.grievanceCategories.Transfer || []).reduce(
      (acc, record) => {
        if (record.transfer.transferType === type) {
          acc[record.gender] = (acc[record.gender] || 0) + 1;
        }
        return acc;
      },
      { Male: 0, Female: 0 }
    );
    return { type, ...genderCounts };
  });

  // Prepare data for the transfer type chart
  const transferTypeChartData = {
    labels: transferTypes,
    datasets: [
      {
        label: 'Male',
        data: transferDataByGender.map((item) => item.Male),
        backgroundColor: '#0088FE',
      },
      {
        label: 'Female',
        data: transferDataByGender.map((item) => item.Female),
        backgroundColor: '#FF8042',
      },
    ],
  };

  // Chart options
  const transferTypeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: {
            size: 10, // Adjust this value to set the desired font size for x-axis labels
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          font: {
            size: 12, // You can also adjust the y-axis label size if needed
          },
        },
      },
    },
  };
  // List of qualifications to consider
  const qualifications = [
    'SSC', 'INTERMEDIATE', 'ITI', 'POLYTECHNIC', 'DEGREE', 'BCOM', 'B.TECH',
    'BA', 'DEGREE BACHELORS', 'B.SC', 'B.ED', 'MASTERS', 'MBA', 'Others'
  ];

  // Filter and process data for qualifications
  const qualificationDataByGender = qualifications.map((qualification) => {
    const genderCounts = (data.grievanceCategories.JOBS || []).reduce(
      (acc, record) => {
        // Check if the record has a `jobs` field and matches the current qualification
        if (record.jobs?.qualification === qualification) {
          acc[record.gender] = (acc[record.gender] || 0) + 1;
        }
        return acc;
      },
      { Male: 0, Female: 0 }
    );
    return { qualification, ...genderCounts };
  });

  // Prepare data for the qualification chart
  const qualificationChartData = {
    labels: qualifications,
    datasets: [
      {
        label: 'Male',
        data: qualificationDataByGender.map((item) => item.Male || 0), // Default to 0 if no data
        backgroundColor: '#0088FE',
      },
      {
        label: 'Female',
        data: qualificationDataByGender.map((item) => item.Female || 0), // Default to 0 if no data
        backgroundColor: '#FF8042',
      },
    ],
  };
  // Chart options
  const qualificationChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: {
            size: 10, // Adjust this value to set the desired font size for x-axis labels
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          font: {
            size: 12, // You can also adjust the y-axis label size if needed
          },
        },
      },
    },
  };
  return (
    <Container>
      <h1 className="text-center my-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#4A90E2' }}>
        Welcome, {userInfo.role ? profile.name : `${profile.firstname} ${profile.lastname}`}
      </h1>
      <Row className="justify-content-center mt-4">
        <h2 style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '700',
          color: '#333',
          textAlign: 'center',
          letterSpacing: '1px'
        }}>
          Overall Count
        </h2>
      </Row>
      <Row>
        {grievanceCounts.map(({ category, count }, index) => (
          <Col xs={12 / todayGrievanceCounts.length} key={index} className="mb-4">
            <div className="card shadow-lg p-3 text-center">
              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '600', color: '#555', fontSize: '1rem' }}>{category}</h4>
              <div className="card-value" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{count}</div>
            </div>
          </Col>
        ))}
      </Row>
      <Row className="justify-content-center mt-4">
        <h2 style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '700',
          color: '#333',
          textAlign: 'center',
          letterSpacing: '1px'
        }}>
          Today's Count
        </h2>
      </Row>
      <Row className="gx-3 gy-3">
        {todayGrievanceCounts.map(({ category, count }, index) => (
          <Col xs={12 / todayGrievanceCounts.length} key={index} className="mb-4">
            <div className="card shadow-lg p-3 text-center">
              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '600', color: '#555', fontSize: '1rem' }}>{category}</h4>
              <div className="card-value" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{count}</div>
            </div>
          </Col>
        ))}
      </Row>
      <Row className="mt-4" style={{ justifyContent: 'center' }}>
        <Col xs={12} md={6} className="mb-4">
          <div className="card shadow-lg p-3 text-center">
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '700', color: '#555' }}>Total Records</h3>
            <div className="card-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalRecords}</div>
          </div>
        </Col>
        {(!userInfo.role) &&
          <Col xs={12} md={6}>
            <div className="card shadow-lg p-3 text-center">
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '700', color: '#555' }}>Total Employees</h3>
              <div className="card-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalEmployees}</div>
            </div>
          </Col>
        }
      </Row>
      <Row className="mb-4" style={{ marginBottom: "5rem" }}>
        <Col xs={12} md={6} className="mb-4 shadow-lg card">
          <div className="chart-card" style={{ height: '400px',paddingTop: '3px' }}>
            <h3 style={{ textAlign: 'center', fontFamily: 'Roboto, sans-serif', fontWeight: '600', color: '#333', fontSize: '1rem' }}>
              Grievance Distribution
            </h3>
            <Pie
              data={pieChartData}
              options={pieChartOptions}
              width={40}
              height={30}
              style={{ paddingBottom: '3rem' }}
            />
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="chart-card shadow-lg card" style={{ height: '400px', padding: '5px' }}>
            <h3 style={{ textAlign: "center", fontFamily: 'Roboto, sans-serif', fontWeight: '600', color: '#333', fontSize: '1rem' }}>
              Grievance Counts by Category
            </h3>
            <Bar data={barChartData} options={barChartOptions} width={60} height={40} style={{ paddingBottom: '3rem' }} />
          </div>
        </Col>
      </Row>
      <Row className="mt-10" style={{ marginTop: "2rem", paddingBottom: "1rem" }}> {/* Add padding-bottom here */}
        <Col xs={12} md={6} className="mb-4 shadow-lg card">
          <div className="chart-card" style={{ height: '400px', padding: '5px' }}>
            <h3 style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: '600', color: '#555', fontSize: '1rem' }}>
              Gender Distribution by Category (Based on Gender)
            </h3>
            <Bar data={stackedBarChartData} options={stackedBarChartOptions} width={50} height={30} style={{ paddingBottom: '3rem' }} />
          </div>
        </Col>
        <Col xs={12} md={6} className="mb-4 shadow-lg card" style={{ width: '630px', marginLeft: '1rem' }}>
          <div className="chart-card" style={{ height: '400px', padding: '5px' }}>
            <h3 style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: '600', color: '#555', fontSize: '1rem' }}>
              Age Distribution by Category
            </h3>
            <Bar data={ageDistributionChartData} options={ageDistributionChartOptions} width={60} height={40} style={{ paddingBottom: '3rem' }} />
          </div>
        </Col>
      </Row>
      <Row className="mt-10" style={{ marginTop: "2rem", paddingBottom: "1rem" }}> {/* Add padding-bottom here */}
        <Col xs={12} md={6} className="mb-4 shadow-lg card">
          <div className="chart-card" style={{ height: '400px', paddingTop: '10px' }}>
            <h3 style={{ textAlign: 'center', fontFamily: 'Roboto, sans-serif', fontWeight: '600', color: '#444', fontSize: '1rem' }}>
              Transfer Types by Gender
            </h3>
            <Bar data={transferTypeChartData} options={transferTypeChartOptions} width={50} height={30} style={{ paddingBottom: '3rem' }} />
          </div>
        </Col>
        <Col xs={12} md={6} className="mb-4 shadow-lg card" style={{ width: '630px', marginLeft: '1rem' }}>
          <div className="chart-card" style={{ height: '400px', paddingTop: '10px'}}>
            <h3 style={{ textAlign: 'center', fontFamily: 'Roboto, sans-serif', fontWeight: '600', color: '#444', fontSize: '1rem' }}>
              Qualifications by Gender
            </h3>
            <Bar data={qualificationChartData} options={qualificationChartOptions}  width={60} height={40} style={{ paddingBottom: '3rem' }} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;