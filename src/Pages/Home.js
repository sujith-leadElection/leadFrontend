import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2'; // Import chart components from react-chartjs-2
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'; // Import necessary chart.js elements
import 'bootstrap/dist/css/bootstrap.min.css';

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
            'http://localhost:8000/auth/getTokeninfo',
            { token }
          );
          const { userId, role } = tokenResponse.data;
          setUserInfo({ userId, role });
          const profileResponse = await axios.get(`http://localhost:8000/employee/profile/${userId}`);
          setProfile(profileResponse.data);

          const response = await axios.get(
            `http://localhost:8000/grievances/consolidated-data/${userId}/${role}`
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
  const grievanceCounts = grievanceLabels.map((category) => ({
    category,
    count: grievanceCategories[category]?.length || 0,
  }));

  const transferTypes = ['transfer', 'retention', 'recommendation', 'new_post_recommended'];

  const totalACs = data.allAC?.length || 0;
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
      },
      y: {
        stacked: true,
        beginAtZero: true,
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
      },
      y: {
        stacked: true,
        beginAtZero: true,
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
      },
      y: {
        stacked: true,
        beginAtZero: true,
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
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };
  return (
    <Container>
      <h1 className="text-center my-4">
        Welcome, {userInfo.role ? profile.name : `${profile.firstname} ${profile.lastname}`}
      </h1>
      <Row className="mb-4" style={{ marginBottom: "5rem"}}>
        {/* Charts in one row */}
        <Col xs={12} md={6} className="mb-4 shadow-lg card">
          <div className="chart-card" style={{ height: '400px' }}>
            <h3 style={{ textAlign: 'center' }}>Grievance Distribution</h3>
            {/* Pie Chart with legend below */}
            <Pie
              data={pieChartData}
              options={pieChartOptions}
              width={40}
              height={30}
              style={{ paddingBottom: '3rem' }} // Added margin to provide space below the pie chart
            />
          </div>
        </Col>

        <Col xs={12} md={6}>
          <div className="chart-card shadow-lg card" style={{ height: '400px' }}>
            <h3 style={{ textAlign: "center" }}>Grievance Counts by Category</h3>
            {/* Bar Chart */}
            <Bar data={barChartData} width={40} height={30} style={{ paddingBottom: '3rem' }}/>
          </div>
        </Col>
      </Row>
      <Row className="mt-10" style={{ marginTop: "5rem", gap:'1rem'}}>
        <Col xs={12} md={5.5} className="mb-4 shadow-lg card">
          <div className="chart-card" style={{ height: '400px' }}>
            <h3 style={{ textAlign: 'center' }}>Gender Distribution by Category (Based on Gender)</h3>
            <Bar data={stackedBarChartData} options={stackedBarChartOptions} style={{ paddingBottom: '3rem' }} />
          </div>
        </Col>
        <Col xs={12} md={5.5} className="mb-4 shadow-lg card">
          <div className="chart-card" style={{ height: '400px' }}>
            <h3 style={{ textAlign: 'center' }}>Age Distribution by Category</h3>
            <Bar data={ageDistributionChartData} options={ageDistributionChartOptions} style={{ paddingBottom: '3rem' }} />
          </div>
        </Col>
      </Row>
      <Row className="mt-10" style={{ marginTop: "4rem" }}>
        <Col xs={12} md={5.5} className="mb-4 shadow-lg card">
          <div className="chart-card" style={{ height: '400px' }}>
            <h3 style={{ textAlign: 'center' }}>Transfer Types by Gender</h3>
            <Bar data={transferTypeChartData} options={transferTypeChartOptions}  style={{ paddingBottom: '3rem' }}/>
          </div>
        </Col>
        <Col xs={12} md={5.5} className="mb-4 shadow-lg card">
          <div className="chart-card" style={{ height: '400px' }}>
            <h3 style={{ textAlign: 'center' }}>Qualifications by Gender</h3>
            <Bar data={qualificationChartData} options={qualificationChartOptions}  style={{ paddingBottom: '3rem' }}/>
          </div>
        </Col>
      </Row>
      <Row className="mt-4" style={{ justifyContent: 'center' }}>
        <Col xs={12} md={6} className="mb-4">
          <div className="card shadow-lg p-3 text-center">
            <h3 className="text-center">Total Records</h3>
            <div className="card-value">{totalRecords}</div>
          </div>
        </Col>
        {(!userInfo.role)
          ?
          <Col xs={12} md={6}>
            <div className="card shadow-lg p-3 text-center">
              <h3 className="text-center">Total Employees</h3>
              <div className="card-value">{totalEmployees}</div>
            </div>
          </Col>
          : null}
      </Row>
      <Row>
        {grievanceCounts.map(({ category, count }, index) => (
          <Col xs={12} md={4} key={index} className="mb-4">
            <div className="card shadow-lg p-3 text-center">
              <h4>{category}</h4>
              <div className="card-value">{count}</div>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Home;