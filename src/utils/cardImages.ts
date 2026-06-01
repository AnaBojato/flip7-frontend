import card0 from "../assets/cards/normalCards/card0.svg";
import card1 from "../assets/cards/normalCards/card1.svg";
import card2 from "../assets/cards/normalCards/card2.svg";
import card3 from "../assets/cards/normalCards/card3.svg";
import card4 from "../assets/cards/normalCards/card4.svg";
import card5 from "../assets/cards/normalCards/card5.svg";
import card6 from "../assets/cards/normalCards/card6.svg";
import card7 from "../assets/cards/normalCards/card7.svg";
import card8 from "../assets/cards/normalCards/card8.svg";
import card9 from "../assets/cards/normalCards/card9.svg";
import card10 from "../assets/cards/normalCards/card10.svg";
import card11 from "../assets/cards/normalCards/card11.svg";
import card12 from "../assets/cards/normalCards/card12.svg";

import freeze from "../assets/cards/specialCards/freeze.svg";
import secondChance from "../assets/cards/specialCards/secondChance.svg";
import x2 from "../assets/cards/specialCards/multiplier.svg";
import flipThree from "../assets/cards/specialCards/flipThree.svg";

export const getCardImage = (
  cardType: string,
  numericValue?: number
) => {
  if (cardType === "NUMBER") {
    const cards: Record<number, string> = {
      0: card0,
      1: card1,
      2: card2,
      3: card3,
      4: card4,
      5: card5,
      6: card6,
      7: card7,
      8: card8,
      9: card9,
      10: card10,
      11: card11,
      12: card12,
    };

    return cards[numericValue ?? 0];
  }

  switch (cardType) {
    case "FREEZE":
      return freeze;

    case "SECOND_CHANCE":
      return secondChance;

    case "MULTIPLIER":
      return x2;

    case "FLIP7":
      return flipThree;

    default:
      return flipThree;
  }
};