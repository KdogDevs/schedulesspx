import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Admin = ({ weekSchedule, setWeekSchedule, fetchSchedule }) => {
  const { currentTheme } = useTheme();
  const { user, isAuthorized } = useAuth();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [newPeriod, setNewPeriod] = useState({ name: '', start: '', end: '' });
  const [saveStatus, setSaveStatus] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [currentAnnouncement, setCurrentAnnouncement] = useState({ title: '', message: '' });
  const [userStats, setUserStats] = useState({ totalUsers: 0, activeUsers: 0 });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (Object.keys(weekSchedule).length === 0) {
      fetchSchedule();
    }
    fetchCurrentAnnouncement();
    fetchUserStats();
  }, []);

  console.log("Admin - Current user:", user);
  console.log("Admin - Is authorized:", isAuthorized());

  const fetchCurrentAnnouncement = async () => {
    try {
      const response = await fetch('https://schedule-api.devs4u.workers.dev/api/announcement');
      if (response.ok) {
        const data = await response.json();
        setCurrentAnnouncement(data);
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('https://schedule-api.devs4u.workers.dev/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats({ totalUsers: data.totalUsers, activeUsers: data.activeUsers });
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleAddPeriod = () => {
    if (newPeriod.name && newPeriod.start && newPeriod.end) {
      const newPeriodString = `${newPeriod.name} - ${newPeriod.start}-${newPeriod.end}`;
      const updatedSchedule = {
        ...weekSchedule,
        [selectedDay]: [...weekSchedule[selectedDay], newPeriodString]
      };
      setWeekSchedule(updatedSchedule);
      setNewPeriod({ name: '', start: '', end: '' });
      saveSchedule(updatedSchedule);
    }
  };

  const handleRemovePeriod = (index) => {
    const updatedSchedule = {
      ...weekSchedule,
      [selectedDay]: weekSchedule[selectedDay].filter((_, i) => i !== index)
    };
    setWeekSchedule(updatedSchedule);
    saveSchedule(updatedSchedule);
  };

  const handleBulkInput = () => {
    const lines = bulkInput.trim().split('\n');
    const newPeriods = lines.slice(1).map(line => {
      const [name, start, end] = line.split('\t');
      return `${name} - ${start}-${end}`;
    });

    const updatedSchedule = {
      ...weekSchedule,
      [selectedDay]: newPeriods
    };
    setWeekSchedule(updatedSchedule);
    saveSchedule(updatedSchedule);
    setBulkInput('');
  };

  const saveSchedule = async (schedule) => {
    try {
      setSaveStatus('Saving...');
      const response = await fetch('https://schedule-api.devs4u.workers.dev/api/schedule', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(schedule)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Save response:', result);
      setSaveStatus('Schedule saved successfully');
      setTimeout(() => setSaveStatus(''), 3000);
      fetchSchedule();
    } catch (error) {
      console.error('Error saving schedule:', error);
      setSaveStatus(`Failed to save schedule: ${error.message}`);
    }
  };

  const saveAnnouncement = async () => {
    try {
      setSaveStatus('Saving announcement...');
      const response = await fetch('https://schedule-api.devs4u.workers.dev/api/announcement', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(announcement)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Save announcement response:', result);
      setSaveStatus('Announcement saved successfully');
      setTimeout(() => setSaveStatus(''), 3000);
      fetchCurrentAnnouncement();
    } catch (error) {
      console.error('Error saving announcement:', error);
      setSaveStatus(`Failed to save announcement: ${error.message}`);
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      const response = await fetch(`https://schedule-api.devs4u.workers.dev/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchUserStats();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`https://schedule-api.devs4u.workers.dev/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchUserStats();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const response = await fetch(`https://schedule-api.devs4u.workers.dev/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchUserStats();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const inputStyle = `w-full p-2 mb-2 border rounded ${currentTheme.input} text-gray-900`;

  if (!user || !isAuthorized()) {
    console.log("Admin - User not authorized");
    return (
      <div className={`${currentTheme.main} rounded-lg shadow-lg w-full border-2 ${currentTheme.border} relative h-full flex flex-col justify-center items-center`}>
        <p className={`${currentTheme.text} text-center`}>You are not authorized to access the admin panel.</p>
      </div>
    );
  }

  console.log("Admin - User authorized, rendering admin panel");
  return (
    <div className={`flex flex-col h-screen ${currentTheme.main} ${currentTheme.text}`}>
      <div className="flex-grow overflow-y-auto">
        <div className="container mx-auto p-6">
          <div className={`${currentTheme.secondary} border-2 ${currentTheme.border} p-6 rounded-lg shadow-lg`}>
            <h2 className={`text-2xl font-bold mb-6`}>Admin Console</h2>

            {/* User Statistics Section */}
            <div className="mb-8">
              <h3 className={`text-xl font-semibold mb-4`}>User Statistics</h3>
              <p>Total Users: {userStats.totalUsers}</p>
              <p>Active Users: {userStats.activeUsers}</p>
            </div>

            {/* User Management Section */}
            <div className="mb-8">
              <h3 className={`text-xl font-semibold mb-4`}>User Management</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="border px-4 py-2">{user.email}</td>
                        <td className="border px-4 py-2">
                          <button onClick={() => handleUpdateUser(user.id)} className={`${currentTheme.accent} px-2 py-1 rounded mr-2`}>Update</button>
                          <button onClick={() => handleDeleteUser(user.id)} className={`${currentTheme.accent} px-2 py-1 rounded mr-2`}>Delete</button>
                          <button onClick={() => handleBanUser(user.id)} className={`${currentTheme.accent} px-2 py-1 rounded`}>Ban</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Announcement Section */}
            <div className="mb-8">
              <h3 className={`text-xl font-semibold mb-4`}>Manage Announcement</h3>
              <div className="mb-4">
                <h4 className={`text-lg font-medium mb-2`}>Current Announcement</h4>
                <p>Title: {currentAnnouncement.title}</p>
                <p>Message: {currentAnnouncement.message}</p>
              </div>
              <div className="mb-4">
                <h4 className={`text-lg font-medium mb-2`}>Set New Announcement</h4>
                <input
                  type="text"
                  placeholder="Announcement Title"
                  value={announcement.title}
                  onChange={(e) => setAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  className={inputStyle}
                />
                <textarea
                  placeholder="Announcement Message"
                  value={announcement.message}
                  onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                  className={inputStyle}
                  rows="3"
                />
                <button
                  onClick={saveAnnouncement}
                  className={`${currentTheme.accent} px-4 py-2 rounded hover:opacity-80`}
                >
                  Save Announcement
                </button>
              </div>
            </div>

            {/* Schedule Management Section */}
            <div className="mb-8">
              <h3 className={`text-xl font-semibold mb-4`}>Manage Schedule</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddPeriod}
                    className={`${currentTheme.accent} px-4 py-2 rounded hover:opacity-80`}
                  >
                    Add Period
                  </button>
                  <button
                    onClick={handleBulkInput}
                    className={`${currentTheme.accent} px-4 py-2 rounded hover:opacity-80`}
                  >
                    Add Bulk Periods
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className={`block mb-2`}>Select Day:</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className={inputStyle}
                >
                  {Object.keys(weekSchedule).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <h4 className={`text-lg font-medium mb-2`}>{selectedDay}'s Schedule</h4>
                <ul className="space-y-2">
                  {weekSchedule[selectedDay] && weekSchedule[selectedDay].map((period, index) => (
                    <li key={index} className={`flex justify-between items-center`}>
                      <span>{period}</span>
                      <button
                        onClick={() => handleRemovePeriod(index)}
                        className={`${currentTheme.accent} px-2 py-1 rounded hover:opacity-80`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <h4 className={`text-lg font-medium mb-2`}>Add New Period</h4>
                <input
                  type="text"
                  placeholder="Period Name"
                  value={newPeriod.name}
                  onChange={(e) => setNewPeriod(prev => ({ ...prev, name: e.target.value }))}
                  className={inputStyle}
                />
                <input
                  type="time"
                  value={newPeriod.start}
                  onChange={(e) => setNewPeriod(prev => ({ ...prev, start: e.target.value }))}
                  className={inputStyle}
                />
                <input
                  type="time"
                  value={newPeriod.end}
                  onChange={(e) => setNewPeriod(prev => ({ ...prev, end: e.target.value }))}
                  className={inputStyle}
                />
              </div>
              <div className="mb-4">
                <h4 className={`text-lg font-medium mb-2`}>Bulk Add Periods</h4>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Paste formatted schedule here..."
                  className={inputStyle}
                  rows="10"
                />
              </div>
            </div>

            {saveStatus && (
              <p className={`mt-2 ${saveStatus.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
                {saveStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
