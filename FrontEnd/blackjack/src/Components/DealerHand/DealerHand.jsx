import React, { Props, useState, useEffect } from "react";
import Card from "../Card/Card";
import styles from "../DealerHand/DealerHand.module.scss";

const DealerHand = Props => {
  const [deck, setDeck] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setDeck(Props.deckData);
    setTotal(
      Props.deckData.reduce(function (r, { value }) {
        var val1 = r;
        var val2 = value;
        switch (r) {
          case "A":
            total + 11 < 21 ? (val1 = 11) : (val1 = 1);
            break;
          case "K":
            val1 = 10;
            break;
          case "Q":
            val1 = 10;
            break;
          case "J":
            val1 = 10;
            break;
          default:
            break;
        }
        switch (value) {
          case "A":
            total + 11 < 21 ? (val2 = 11) : (val2 = 1);
            break;
          case "K":
            val2 = 10;
            break;
          case "Q":
            val2 = 10;
            break;
          case "J":
            val2 = 10;
            break;
          default:
            break;
        }
        return val1 + val2;
      }, 0)
    );
  }, [Props]);

  return (
    <div className={styles.dealerHandContainer}>
      {deck.length != 0 ? (
        <div className={styles.title}>
          {Props.revealPhase ? (
            <div>Dealer's hand: {total} </div>
          ) : (
            <div>Dealer's hand: ??? </div>
          )}
        </div>
      ) : null}
      <div className={styles.cards}>
        {deck
          ? deck.map((card, index) => (
              <div className={styles.innerCards}>
                <Card number={card.value} suit={card.suit} color={card.color} />{" "}
                {Props.revealPhase ? null : <Card />}
              </div>
            ))
          : null}
      </div>
    </div>
  );
};

export default DealerHand;
