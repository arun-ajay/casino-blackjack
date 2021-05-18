import React, { Props } from "react";
import Loader from "react-loader-spinner";
import styles from "../Prompt/Prompt.module.scss";

const Prompt = Props => {
  return (
    <div className={styles.promptContainer}>
      <div>{Props.message}</div>
    </div>
  );
};

export default Prompt;
