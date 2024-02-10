const Game = require("../models/game.model");

const playedWith5 = async (userId) => {
  try {
    const userGames = await Game.find({
      $or: [{ player1: userId }, { player2: userId }],
      gameStatus: "Accepted",
    });

    const uniquePartnerIds = new Set();

    userGames.forEach((game) => {
      if (String(game.player1) === userId) {
        uniquePartnerIds.add(String(game.player2));
      } else {
        uniquePartnerIds.add(String(game.player1));
      }
    });

    return uniquePartnerIds.size === 5;
  } catch (error) {
    console.error(error);
    throw new Error("Error checking if played with 5 partners");
  }
};

const feedbackUpdatedFor5 = async (playerId) => {
  const games = await Game.find({
    $or: [{ player1: userId }, { player2: userId }],
    gameStatus: "Accepted",
  });

  const uniquePartners = new Set();

  games.forEach((game) => {
    if (game.player1.equals(playerId) && game.player1Feedback.updated) {
      uniquePartners.add(game.player2);
    } else if (game.player2.equals(playerId) && game.player2Feedback.updated) {
      uniquePartners.add(game.player1);
    }
  });

  return uniquePartners.size >= 5;
};

const feedbackReceivedFrom5 = async (userId) => {
  const games = await Game.find({
    $or: [{ player1: userId }, { player2: userId }],
    gameStatus: "Accepted",
  });

  const uniquePartners = new Set();

  games.forEach((game) => {
    if (game.player1.equals(playerId) && game.player2Feedback.updated) {
      uniquePartners.add(game.player2);
    } else if (game.player2.equals(playerId) && game.player1Feedback.updated) {
      uniquePartners.add(game.player1);
    }
  });

  return uniquePartners.size >= 5;
};

module.exports = { playedWith5, feedbackUpdatedFor5, feedbackReceivedFrom5 };
