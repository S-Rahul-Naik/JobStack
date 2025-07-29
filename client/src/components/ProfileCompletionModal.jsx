import React, { useState } from 'react';

const ProfileCompletionModal = ({ isOpen, onClose, onSubmit, userRole }) => {
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');

  const experienceOptions = userRole === 'recruiter' ? [
    'New to Recruiting - Less than 1 year',
    '1-3 years - Junior Recruiter',
    '3-5 years - Experienced Recruiter',
    '5-10 years - Senior Recruiter',
    '10+ years - Recruiting Expert',
    'HR Professional - Multiple years in HR',
    'Talent Acquisition Specialist'
  ] : [
    'Student - Currently pursuing studies',
    '0 years - Fresh Graduate',
    '1-2 years - Junior Level',
    '2-4 years - Mid Level',
    '4-6 years - Senior Level',
    '6+ years - Expert Level',
    'Career Changer - New to this field'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!experience) {
      alert('Please select your experience level');
      return;
    }

    const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    try {
      await onSubmit({ experience, skills: skillsArray });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Complete Your Profile</h2>
        <p className="text-gray-600 mb-6">
          {userRole === 'recruiter' 
            ? 'Help us understand your recruiting background and experience in talent acquisition.'
            : 'Help us understand your background better by providing your experience level.'
          }
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {userRole === 'recruiter' ? 'Recruiting Experience *' : 'Experience Level *'}
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{userRole === 'recruiter' ? 'Select your recruiting experience' : 'Select your experience level'}</option>
              {experienceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {userRole === 'applicant' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills (Optional)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js (comma separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple skills with commas
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Save Profile
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Skip for Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
