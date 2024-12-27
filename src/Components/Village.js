import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const VillagesModal = ({ acId, mandalId, closeModal }) => {
  const [villages, setVillages] = useState([]);
  const [newVillageName, setNewVillageName] = useState('');
  const [editingVillage, setEditingVillage] = useState(null);

  // Fetch villages for the given mandal
  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const response = await axios.get(`/getAll-mandal/${acId}`);
        const mandal = response.data.mandal.find(m => m._id === mandalId);
        if (mandal) setVillages(mandal.villages);
      } catch (error) {
        console.error('Error fetching villages:', error);
      }
    };
    fetchVillages();
  }, [acId, mandalId]);

  // Handle adding a new village
  const addVillage = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/ac/add-village/${acId}/${mandalId}`, { name: newVillageName });
      setVillages([...villages, response.data.data]);
      setNewVillageName('');
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Village Added Successfully",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error adding village:', error);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: error.response.data.message,
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  // Handle editing a village
  const updateVillage = async (villageId, updatedName) => {
    try {
      const response = await axios.put(`http://localhost:8000/ac/edit-village/${acId}/${mandalId}/${villageId}`, { name: updatedName });
      setVillages(villages.map(village => village._id === villageId ? { ...village, name: updatedName } : village));
      setEditingVillage(null); // Close the editing pop-up
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Village Updated Successfully",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error updating village:', error);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: error.response.data.message,
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  return (
    <div className="villages-modal">
      <button onClick={closeModal}>Close</button>
      <h2>Villages in Mandal</h2>
      <input
        type="text"
        placeholder="New Village Name"
        value={newVillageName}
        onChange={(e) => setNewVillageName(e.target.value)}
      />
      <button onClick={addVillage}>Add Village</button>

      <table>
        <thead>
          <tr>
            <th>Village Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {villages.map(village => (
            <tr key={village._id}>
              <td>{village.name}</td>
              <td>
                <button onClick={() => setEditingVillage(village)}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingVillage && (
        <div className="edit-village-popup">
          <h3>Edit Village</h3>
          <input
            type="text"
            value={editingVillage.name}
            onChange={(e) => setEditingVillage({ ...editingVillage, name: e.target.value })}
          />
          <button onClick={() => updateVillage(editingVillage._id, editingVillage.name)}>Save</button>
          <button onClick={() => setEditingVillage(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default VillagesModal;