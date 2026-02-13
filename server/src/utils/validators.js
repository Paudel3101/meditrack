// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};

// Medical Record Number validation
const validateMRN = (mrn) => {
  // MRN should be alphanumeric, 6-20 characters
  const mrnRegex = /^[A-Z0-9]{6,20}$/;
  return mrnRegex.test(mrn);
};

// Date validation (ISO format)
const validateDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Time validation (HH:MM format)
const validateTime = (timeString) => {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

// Password strength validation
const validatePassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Gender validation
const validateGender = (gender) => {
  const validGenders = ['Male', 'Female', 'Other'];
  return validGenders.includes(gender);
};

// Appointment status validation
const validateAppointmentStatus = (status) => {
  const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'No-show'];
  return validStatuses.includes(status);
};

// Staff role validation
const validateRole = (role) => {
  const validRoles = ['Admin', 'Doctor', 'Nurse', 'Receptionist'];
  return validRoles.includes(role);
};

// Blood type validation
const validateBloodType = (bloodType) => {
  const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validBloodTypes.includes(bloodType);
};

// Age calculation
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Check if patient is adult (>= 18 years)
const isAdult = (dateOfBirth) => {
  return calculateAge(dateOfBirth) >= 18;
};

// Sanitize string input
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

module.exports = {
  validateEmail,
  validatePhone,
  validateMRN,
  validateDate,
  validateTime,
  validatePassword,
  validateGender,
  validateAppointmentStatus,
  validateRole,
  validateBloodType,
  calculateAge,
  isAdult,
  sanitizeString
};
