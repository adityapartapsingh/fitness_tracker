import React, { useState, useEffect } from 'react';
import { profileAPI } from '../api/profileAPI';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState({
    height: '',
    weight: '',
    age: '',
    gender: '',
    waterGoal: 2000,
  });

  const [bmi, setBmi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [edited, setEdited] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      const data = response.data || response;
      setProfile({
        height: data.height || '',
        weight: data.weight || '',
        age: data.age || '',
        gender: data.gender || '',
        waterGoal: data.waterGoal || 2000,
      });
      setEdited(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = async () => {
    try {
      const response = await profileAPI.calculateBMI();
      const data = response.data || response;
      setBmi(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    setEdited(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await profileAPI.updateProfile({
        height: profile.height ? parseInt(profile.height) : null,
        weight: profile.weight ? parseInt(profile.weight) : null,
        age: profile.age ? parseInt(profile.age) : null,
        gender: profile.gender || null,
        waterGoal: parseInt(profile.waterGoal),
      });
      setSuccessMessage('Profile updated successfully!');
      setEdited(false);
      calculateBMI();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Note: water intake UI handled in `WaterWidget` component.

  const getBMIColor = (category) => {
    switch (category) {
      case 'Underweight':
        return '#3b82f6';
      case 'Normal weight':
        return '#10b981';
      case 'Overweight':
        return '#f59e0b';
      case 'Obese':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="profile-container">
      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="profile-grid">
        {/* Profile Information Section */}
        <div className="profile-card">
          <h2>📋 Profile Information</h2>
          
          <div className="form-group">
            <label>Height (cm)</label>
            <input
              type="number"
              name="height"
              value={profile.height}
              onChange={handleInputChange}
              placeholder="Enter height in cm"
            />
          </div>

          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={profile.weight}
              onChange={handleInputChange}
              placeholder="Enter weight in kg"
            />
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={profile.age}
              onChange={handleInputChange}
              placeholder="Enter your age"
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={profile.gender} onChange={handleInputChange}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {edited && (
            <button 
              className="btn-primary" 
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          )}
        </div>

        {/* BMI Calculator Section */}
        <div className="profile-card">
          <h2>📊 BMI Calculator</h2>
          
          {!bmi ? (
            <button className="btn-primary" onClick={calculateBMI}>
              Calculate BMI
            </button>
          ) : (
            <div className="bmi-result">
              <div className="bmi-score" style={{ color: getBMIColor(bmi.category) }}>
                <div className="bmi-value">{bmi.bmi}</div>
                <div className="bmi-category">{bmi.category}</div>
              </div>
              <div className="bmi-info">
                <p><strong>Height:</strong> {bmi.height} cm</p>
                <p><strong>Weight:</strong> {bmi.weight} kg</p>
              </div>
              <button className="btn-secondary" onClick={calculateBMI}>
                Recalculate
              </button>
            </div>
          )}

          <div className="bmi-guide">
            <h4>BMI Categories</h4>
            <ul>
              <li><span style={{ color: '#3b82f6' }}>●</span> Underweight: &lt; 18.5</li>
              <li><span style={{ color: '#10b981' }}>●</span> Normal: 18.5 - 24.9</li>
              <li><span style={{ color: '#f59e0b' }}>●</span> Overweight: 25 - 29.9</li>
              <li><span style={{ color: '#ef4444' }}>●</span> Obese: ≥ 30</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
