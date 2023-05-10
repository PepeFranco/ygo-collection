const collection = require("../data/collection.json");

const boxes = [
  // 36.5 cards / cm
  { box: "White - Row 1", capacity: 1250 },
  { box: "White - Row 2", capacity: 1250 },
  { box: "White - Row 3", capacity: 1250 },
  { box: "White - Row 4", capacity: 1250 },
  { box: "Battle Academy 1", capacity: 820 },
  { box: "Battle Academy 2", capacity: 820 },
  { box: "Batle City 1", capacity: 820 },
  { box: "Batle City 2", capacity: 820 },
  { box: "Duelist of Shadows", capacity: 456 },
  { box: "Duelist of Shadows", capacity: 456 },
];

const initials = "0123456789abcdefghijklmnopqrstuvwxyz".split("");

const getCardsInBoxes = () => {
  console.log(collection.length);
  const commonAndRares = collection.filter((card) =>
    ["Common", "Rare", ""].includes(card.Rarity)
  );
  console.log(commonAndRares.length);
  const notInDecks = commonAndRares.filter((card) => card["In Deck"] === "");
  const cardsPerInitials = [];
  initials.map((initial) => {
    const cardsInInitial = notInDecks.filter((card) => {
      return card.Name.toLowerCase()[0] === initial;
    });
    cardsPerInitials.push({ initial, quantity: cardsInInitial.length });
  });

  const minCapacity = 0.75;
  const maxCapacity = 0.85;
  let sumOfCards = 0;
  let sumOfLetters = "";
  let boxArray = [...boxes];
  let iteration = 0;
  while (boxArray.length > 0) {
    iteration++;
    cardsPerInitials.sort((a, b) => {
      if (Math.random() <= 0.5) {
        return 1;
      }
      return -1;
    });

    cardsPerInitials.map((cardsPerInitial) => {
      console.log(sumOfCards);
      sumOfCards += cardsPerInitial.quantity;
      sumOfLetters += cardsPerInitial.initial + ", ";
      for (let b = 0; b < boxArray.length; b++) {
        //   console.log(boxArray[b]);
        const minimumCapacityOfNextBox = boxArray[b].capacity * minCapacity;
        const maximumCapacityOfNextBox = boxArray[b].capacity * maxCapacity;
        //   console.log({
        //     minimumCapacityOfNextBox,
        //     maximumCapacityOfNextBox,
        //   });

        if (
          sumOfCards >= minimumCapacityOfNextBox &&
          sumOfCards < maximumCapacityOfNextBox
        ) {
          // Found box
          const capacityUsed = (sumOfCards * 100) / boxArray[b].capacity;
          sumOfCards = 0;
          console.log(
            `${boxArray[b].box} will hold ${sumOfLetters} with capacity ${capacityUsed}`
          );
          sumOfLetters = "";
          boxArray.splice(b, 1);
          b = boxArray.length;
        }
      }
    });
    if (boxArray.length > 0) {
      console.log(`iteration ${iteration}`, JSON.stringify(cardsPerInitials));
      sumOfCards = 0;
      sumOfLetters = "";
      boxArray = [...boxes];
    }
  }
  console.log(boxArray);
  return notInDecks;
};

const findBoxesForLetters = () => {
  const cardsInBoxes = getCardsInBoxes();
};

findBoxesForLetters();
