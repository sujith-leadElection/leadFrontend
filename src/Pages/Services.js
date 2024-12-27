import React, { useState } from 'react';
import CreateEmployee from '../Components/CreateEmployee';
import EmployeeDatabase from '../Components/EmployeeDatabase';
import { Button, ButtonGroup } from 'react-bootstrap';

const EmployeeManagement = () => {
  const [activeSection, setActiveSection] = useState('create');

  return (
    <div>
      <div className="row mb-3 w-50">
        <div className="col">
          <button
            className={`gem-c-button govuk-button ${activeSection === 'create' ? '' : 'govuk-button--secondary'}`}
            onClick={() => setActiveSection('create')}
          >
            Create Employee
          </button>
        </div>
        <div className="col">
          <button
            className={`gem-c-button govuk-button ${activeSection === 'database' ? '' : 'govuk-button--secondary'}`}
            onClick={() => setActiveSection('database')}
          >
            Employee Database
          </button>
        </div>
      </div>

      {activeSection === 'create' && <CreateEmployee />}
      {activeSection === 'database' && <EmployeeDatabase />}
    </div>
  );
};

export default EmployeeManagement;