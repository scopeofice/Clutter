import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../utils/constants";
import "../styles.css";
import downloadIcon from "../../public/downloadSVG.svg";
import copyIcon from "../../public/copySVG.svg";
import sizeIcon from "../../public/sizeSVG.svg";
import fileIcon from "../../public/fileSVG.svg";
import download from "downloadjs";
import styles from "./Cards.module.css";
import searchIcon from "../../public/searchSVG.svg";
import LoadAnim from "../assets/LoadingAnimation.gif";

export default function DisplayGrid() {
  const [fileList, setFileList] = useState([]);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);


  useEffect(() => {
    const getFilesList = async () => {
      try {
        setLoading(true);
        // const storedFiles = sessionStorage.getItem("AllFilesList");
        // if (storedFiles) {
        //   setFileList(JSON.parse(storedFiles));
        // } else {
        const { data } = await axios.get(`${API_URL}/getAllFiles`);
        setErrorMsg("");
        setFileList(data);
        // sessionStorage.setItem("AllFilesList", JSON.stringify(data));
        // }
      } catch (error) {
        error.response && setErrorMsg(error.response.data);
      } finally {
        setLoading(false); // Set loading state to false when request is complete
      }
    };

    getFilesList();
  }, []);

  const handleImage = async (fileId, fileType) => {
    try {
      const resp = await axios.get(`${API_URL}/getImages`, {
        params: { query: fileId },
      });
      return `data:${fileType};base64,${resp.data}`;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      const images = await Promise.all(
        fileList.map(async (file) => {
          const imageData = await handleImage(file.fileId, file.file_mimetype);
          return { ...file, imageData };
        })
      );
      setFileList(images);
    };
    fetchImages();
  }, [fileList]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_URL}/search`, {
        params: { query: search },
      });
      setFileList(resp.data);
    } catch (error) {
      console.error("Error searching files:", error);
    } finally {
      setLoading(false); // Set loading state to false when request is complete
    }
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setSearch(value);
  };

  const downloadFile = async (id, filename, mimetype) => {
    try {
      const result = await axios.get(`${API_URL}/download/${id}`, {
        responseType: "blob",
      });

      setErrorMsg("");
      return download(result.data, filename, mimetype);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMsg("Error while downloading file. Try again later");
      }
    }
  };
  const copyToClipboard = async (id, mimeType) => {
    try {
      const result = await axios.get(`${API_URL}/download/${id}`, {
        responseType: "blob",
      });

      const blob = result.data;

      if (mimeType === "image/svg+xml") {
        const text = await blob.text();
        await navigator.clipboard.writeText(text);
      } else {
        const items = [new ClipboardItem({ [mimeType]: blob })];
        await navigator.clipboard.write(items);
      }

      setErrorMsg("Image copied to clipboard successfully.");
      setTimeout(() => {
        setErrorMsg("");
      }, 3000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMsg("Error while copying file. Try again later");
        setTimeout(() => {
          setErrorMsg("");
        }, 3000);
      } else {
        setErrorMsg(
          "Error while copying image to clipboard. Please try again later."
        );
        setTimeout(() => {
          setErrorMsg("");
        }, 3000);
      }
    }
  };

  return (
    <>
      <section>
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <input
            type="search"
            className={styles["material-ui-search"]}
            value={search}
            placeholder="Search"
            onChange={handleInputChange}
            onKeyDown={handleSearch}
          />
          <button
            className={styles["material-ui-search-btn"]}
            onClick={handleSearch}
          >
            <img src={searchIcon} alt="search" />
          </button>
        </div>
      </section>

      {loading ? (
        <div>
          <img src={LoadAnim} alt="Loading..." />
        </div>
      ) : (
        <section className="grid-container">
          {/* <h1 style={{ marginBottom: "20px" }}>{type.toUpperCase()}</h1> */}
          <div className="card-container">
            {Array.isArray(fileList) &&
              fileList.map((file) => (
                <div className="card" key={file._id}>
                  <div className={styles.card}>
                    {file.imageData ? (
                      <img
                        className={`image ${imageLoaded ? "loaded" : ""}`}
                        src={file.imageData}
                        alt="Image"
                        onLoad={() => setImageLoaded(true)}
                      />
                    ) : (
                      <div
                        className={`loader-preview ${
                          imageLoaded ? "loaded" : ""
                        }`}
                      >
                        <div className="loader"></div>
                      </div>
                    )}

                    <div className={styles["card-overlay"]}>
                      <div className={styles["card-header"]}>
                        <div>
                          <p>
                            {file.file_mimetype.includes("svg") ? "SVG" : "PNG"}
                          </p>
                        </div>
                        <div style={{ display: "flex" }}>
                          <a
                            href="#/"
                            onClick={() =>
                              downloadFile(
                                file._id,
                                file.file_name,
                                file.file_mimetype
                              )
                            }
                          >
                            <img src={downloadIcon} alt="Download" />
                          </a>
                          <a
                            href="#/"
                            onClick={() =>
                              copyToClipboard(file._id, file.file_mimetype)
                            }
                          >
                            <img src={copyIcon} alt="Copy" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles["card-content"]}>
                    <h3 className={styles["card-title"]}>{file.title}</h3>
                  </div>
                  <div className="card-body">
                    <div className="card-cotent">
                      <img className="icon" src={sizeIcon} alt="Resolution" />{" "}
                      {file.width} x {file.height}
                    </div>
                    <div className="card-cotent">
                      <img className="icon" src={fileIcon} alt="Size" />{" "}
                      {file.fileSizeInMb > 1
                        ? file.fileSizeInMb.substring(0, 4) + " MB"
                        : file.fileSizeInKb.substring(0, 6) + " KB"}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </>
  );
}
