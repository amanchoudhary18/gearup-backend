const getRecentReviewsForUser = async (userId) => {
  try {
    const userReviews = await Game.aggregate([
      {
        $match: {
          $or: [
            {
              "player1Feedback.updated": true,
              "player1Feedback.reviewMessage": { $ne: null },
            },
            {
              "player2Feedback.updated": true,
              "player2Feedback.reviewMessage": { $ne: null },
            },
          ],
        },
      },
      {
        $project: {
          currentUserIsPlayer1: { $eq: ["$player1", userId] },
          reviewerFeedback: {
            $cond: [
              { $eq: ["$player1", userId] },
              "$player2Feedback",
              "$player1Feedback",
            ],
          },
        },
      },
      {
        $project: {
          name: {
            $concat: [
              {
                $cond: [
                  "$currentUserIsPlayer1",
                  "$player2.first_name",
                  "$player1.first_name",
                ],
              },
              " ",
              {
                $cond: [
                  "$currentUserIsPlayer1",
                  "$player2.last_name",
                  "$player1.last_name",
                ],
              },
            ],
          },
          img: {
            $cond: ["$currentUserIsPlayer1", "$player2.img", "$player1.img"],
          },
          review: "$reviewerFeedback.reviewMessage",
          rating: "$reviewerFeedback.rate_skills",
          review_date: {
            $convert: {
              input: "$reviewerFeedback.updatedAt",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      { $sort: { review_date: -1 } },
      { $limit: 3 },
      {
        $project: {
          _id: 0,
          name: 1,
          img: 1,
          review: 1,
          rating: 1,
          review_date: {
            $multiply: ["$review_date", 1000], // Convert seconds to milliseconds
          },
        },
      },
    ]);

    return userReviews;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
module.exports = getRecentReviewsForUser;
