/**
 * @param {string} dateString
 * @returns {number | string}
*/

// Calculates patient age.(never implemented)
export const calculateAge = (dateString) => {
  if (!dateString) return '';
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Filter date string to year only ( never implemented )
export const formatYear = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).getFullYear();
};

// Convert date to US format: MM/DD/YYYY
export const usDOB = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const dobConverted = `${month}/${day}/${year}`;
  return dobConverted;
}