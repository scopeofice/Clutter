import React, { useState } from "react";
import styles from "./Cards.module.css";
import { IoIosArrowDropdownCircle  } from "react-icons/io";
import { API_URL } from "../../../utils/constants";
import axios from "axios";
import download from "downloadjs";

export default function Cards({
  id,
  image,
  title,
  description,
  filePath,
  fileMimetype,
}) {
  const [errorMsg, setErrorMsg] = useState("");

  const downloadFile = async (id, path, mimetype) => {
    try {
      const result = await axios.get(`${API_URL}/download/${id}`, {
        responseType: "blob",
      });
      const split = path.split("/");
      const filename = split[split.length - 1];
      setErrorMsg("");
      return download(result.data, filename, mimetype);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMsg("Error while downloading file. Try again later");
      }
    }
  };

  return (
    <li>
      <div className={styles.card}>
        {errorMsg && <p className="errorMsg">{errorMsg}</p>}
        <img src={image} alt="Nothing to view" />
        
        <div className={styles["card-overlay"]}>
          <div className={styles["card-header"]}>
          <a
                href="#/"
                onClick={() => downloadFile(id, filePath, fileMimetype)}
              >
                <IoIosArrowDropdownCircle size={35} className={styles['card-icon']}/>
              </a>
            <div className={styles["card-content"]}>
              <h3 className={styles["card-title"]}>{title}</h3>
              
            </div>
          </div>
          <p className={styles["card-description"]}>{description}</p>
        </div>
      </div>
    </li>
  );
}
