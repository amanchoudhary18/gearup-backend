// Calculate average rating for each game
const calculateAverageRating = (feedback) => {
  const parameters = [
    "rate_skills",
    "punctuality",
    "sportsmanship",
    "teamPlayer",
    "competitiveness",
    "respectful",
  ];
  const totalRating = parameters.reduce((total, parameter) => {
    return total + (feedback[parameter] !== null ? feedback[parameter] : 0);
  }, 0);

  const validParametersCount = parameters.filter(
    (parameter) => feedback[parameter] !== null
  ).length;

  return validParametersCount > 0 ? totalRating / validParametersCount : null;
};

module.exports = calculateAverageRating;
