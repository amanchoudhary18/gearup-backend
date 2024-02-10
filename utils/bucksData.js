const bucksData = [
  {
    id: 1,
    title: "Play with 5 people",
    description: "Get 500 bucks for playing with 5 different partners.",
    reward: 500,
  },
  {
    id: 2,
    title: "Check-In",
    description: "10 bucks for check-in at ground.",
    reward: 10,
  },
  {
    id: 3,
    title: "Review 5 people",
    description: "Give feedback after match to 5 different partners",
    reward: 200,
  },
  {
    id: 4,
    title: "Get 5 reviews",
    description: "Get 500 bucks if you gets 5 reviews",
    reward: 200,
  },
];

const bucksDataMap = new Map();

bucksData.forEach((task) => {
  bucksDataMap.set(task.id, {
    title: task.title,
    description: task.description,
    reward: task.reward,
  });
});

module.exports = bucksDataMap;
