/**
 * Calculates patient age.
 * @param {string} dateString
 * @returns {number | string}
*/

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

/**
 * Filter date string to year only
 * @param {string} dateString
 * @returns {number | string}
 */

export const formatYear = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).getFullYear();
};


export const usDOB = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const dobConverted = `${month}/${day}/${year}`;
  return dobConverted;
}