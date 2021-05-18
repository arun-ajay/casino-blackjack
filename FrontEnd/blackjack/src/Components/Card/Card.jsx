import React, { Props } from "react";
import styles from "../Card/Card.module.scss";

const Card = Props => {
  if (Props.color == "black") {
    if (Props.type === "small") {
      return (
        <div className={styles.cardContainerSmol}>
          {Props.number}
          {Props.suit}
        </div>
      );
    } else {
      return (
        <div className={styles.cardContainerBlack}>
          {Props.number}
          {Props.suit}
        </div>
      );
    }
  } else {
    if (Props.type === "small") {
      return (
        <div className={styles.cardContainerSmolRed}>
          {Props.number}
          {Props.suit}
        </div>
      );
    } else {
      return (
        <div className={styles.cardContainerRed}>
          {Props.number}
          {Props.suit}
        </div>
      );
    }
  }
};

export default Card;
