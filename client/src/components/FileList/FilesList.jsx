import React, { useState, useEffect } from "react";
import download from "downloadjs";
import axios from "axios";
import { API_URL } from "../../utils/constants";
import deleteIcon from "../../../public/deleteSVG.svg";
import filterIcon from "../../../public/filterSVG.svg";
import downloadIcon from "../../../public/downloadSVG.svg";
import editIcon from "../../../public/editSVG.svg";
import saveIcon from "../../../public/saveSVG.svg";
import closeIcon from "../../../public/closeSVG.svg";
import styles from "./FilesList.module.css";
import LoadAnim from "../../assets/LoadingAnimation.gif";

const FilesList = () => {
  const [filesList, setFilesList] = useState([]);
  const [search, setSearch] = useState("");
  const [sortedFilesList, setSortedFilesList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // const handleSearch = async () => {
  //   try {
  //     const { data } = await axios.get(`${API_URL}/searchFiles`, {
  //       params: { query: search, page: 1, limit: 20 },
  //     });
  //     setFilesList(data.files);
  //     setSortedFilesList(data.files);
  //     setTotalPages(data.totalPages);
  //     setCount(data.totalCount);
  //     setErrorMsg("");
  //   } catch (error) {
  //     setErrorMsg("Error while searching files. Try again later.");
  //   }
  // };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_URL}/search`, {
        params: { query: search },
      });
      setFilesList(resp.data);
      setSortedFilesList(resp.data);
      setTotalPages(0);
      setCount(resp.data.length);
      setErrorMsg("");
    } catch (error) {
      console.error("Error searching files:", error);
    } finally {
      setLoading(false); // Set loading state to false when request is complete
    }
  };

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
        filesList.map(async (file) => {
          const imageData = await handleImage(file.fileId, file.file_mimetype);
          return { ...file, imageData };
        })
      );
      setFilesList(images);
    };
    fetchImages();
  }, [filesList]);

  useEffect(() => {
    const getFilesList = async () => {
      try {
        setLoading(true);
        // const { data } = await axios.get(`${API_URL}/getAllFiles`);
        const { data } = await axios.get(`${API_URL}/getAllFileList`, {
          params: { page },
        });
        setErrorMsg("");
        setFilesList(data.files);
        setCount(data.totalCount);
        setTotalPages(data.totalPages);
        setSortedFilesList(data.files);
      } catch (error) {
        error.response && setErrorMsg(error.response.data);
      } finally {
        setLoading(false); // Set loading state to false when request is complete
      }
    };

    getFilesList();
  }, [page]);

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePrevPage = () => {
    setPage(page - 1);
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
        setTimeout(() => {
          setErrorMsg("");
        }, 3000);
      }
    }
  };

  const handleEdit = (id, title, description) => {
    setEditingId(id);
    setEditedTitle(title);
    setEditedDescription(description);
  };

  const handleSaveEdit = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to save this details?"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await axios.put(`${API_URL}/edit/${editingId}`, {
        title: editedTitle,
        description: editedDescription,
      });
      const updatedFilesList = filesList.map((file) => {
        if (file._id === editingId) {
          return {
            ...file,
            title: editedTitle,
            description: editedDescription,
          };
        }
        return file;
      });

      setFilesList(updatedFilesList);
      setSortedFilesList(updatedFilesList);
      setEditingId(null);
    } catch (error) {
      console.error("Error updating file:", error);
    }
  };
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      const resp = await axios.delete(`${API_URL}/delete/${id}`);
      const updateList = filesList.filter((file) => file._id !== id);
      const updatedSortedList = sortedFilesList.filter(
        (file) => file._id !== id
      );
      setFilesList(updateList);
      setSortedFilesList(updatedSortedList);
      setErrorMsg(resp.data);
      setTimeout(() => {
        setErrorMsg("");
      }, 3000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMsg("Error while deleting file. Try again later");
        setTimeout(() => {
          setErrorMsg("");
        }, 3000);
      }
    }
  };

  const handleFilterByFileType = async (type) => {
    try {
      const { data } = await axios.get(`${API_URL}/filesByMimeType/${type}`, {
        params: { page },
      });
      setFilesList(data.files);
      setCount(data.totalCount);
      setTotalPages(data.totalPages);
      setSortedFilesList(data.files);
      setErrorMsg("");
    } catch (error) {
      setErrorMsg("Error while fetching files. Try again later.");
      setTimeout(() => {
        setErrorMsg("");
      }, 3000);
    }
  };

  const handleCloseError = () => {
    setErrorMsg("");
  };

  return (
    <div className="files-container" style={{ padding: "20px", width: "80vw" }}>
      <div
        className="features"
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px",
          alignItems: "baseline",
        }}
      >
        <div className={styles.filterMenu}>
          <div
            style={{ display: "flex", marginBottom: "10px", cursor: "pointer" }}
          >
            <p style={{ marginRight: "2px" }}>Filter</p>
            <img src={filterIcon} alt="filter" />
          </div>
          {/* <div className={styles.filterDropdown}>
            <button onClick={() => sortFiles("title", "asc")}>
              Title (A-Z)
            </button>
            <button onClick={() => sortFiles("title", "desc")}>
              Title (Z-A)
            </button>
            <button onClick={() => sortFiles("fileSizeInMb", "asc")}>
              Size (Small-Large)
            </button>
            <button onClick={() => sortFiles("fileSizeInMb", "desc")}>
              Size (Large-Small)
            </button>
            <button onClick={() => sortFiles("width", "asc")}>
              Dimensions (Low-High)
            </button>
            <button onClick={() => sortFiles("width", "desc")}>
              Dimensions (High-Low)
            </button>
            <button onClick={() => setSortedFilesList(filesList)}>All</button>
          </div> */}
          <div className={styles.filterDropdown}>
            <button onClick={() => handleFilterByFileType("All")}>All</button>
            <button onClick={() => handleFilterByFileType("png")}>PNG</button>
            <button onClick={() => handleFilterByFileType("svg")}>SVG</button>
          </div>
        </div>
        <div>Total = {count} files</div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <input
            type="search"
            className={styles["material-ui-search"]}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ display: "flex" }}>
          <p className="errorMsg">{errorMsg}</p>
          <button
            style={{
              position: "absolute",
              backgroundColor: "transparent",
              color: "black",
              border: "none",
              outline: "none",
            }}
            onClick={handleCloseError}
          >
            x
          </button>
        </div>
      )}

      {loading ? (
        <div>
          <img src={LoadAnim} alt="Loading..." />
        </div>
      ) : (
        <table className="files-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>File</th>
              <th>Dimensions</th>
              <th>Size</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedFilesList.length > 0 ? (
              sortedFilesList.map(
                ({
                  _id,
                  title,
                  description,
                  file_name,
                  file_data,
                  file_mimetype,
                  width,
                  height,
                  fileSizeInMb,
                  fileSizeInKb,
                  imageData,
                }) => (
                  <tr key={_id}>
                    <td className="file-title">
                      {editingId === _id ? (
                        <input
                          className="file-input"
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                        />
                      ) : (
                        title
                      )}
                    </td>
                    <td className="file-description">
                      {editingId === _id ? (
                        <textarea
                          className="file-textarea"
                          type="text"
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                        />
                      ) : (
                        description
                      )}
                    </td>
                    <td>
                    {
                    imageData ? (
                      <img
                        src={imageData}
                        alt={title}
                        style={{ maxWidth: "100px", maxHeight: "100px" }}
                      />
                    ) : (
                      <div className="loader"></div>
                    )}
                    </td>
                    <td>
                      {width} x {height}
                    </td>
                    <td>
                      {Number(fileSizeInMb) > 1
                        ? fileSizeInMb.substring(0, 4) + "MB"
                        : fileSizeInKb.substring(0, 5) + "KB"}
                    </td>
                    <td>
                      <div style={{ display: "flex" }}>
                        {editingId === _id ? (
                          <>
                            <button
                              className={styles.saveButton}
                              onClick={handleSaveEdit}
                            >
                              <img src={saveIcon} alt="Save" />
                            </button>
                            <button
                              className={styles.cancelButton}
                              onClick={handleCancelEdit}
                            >
                              <img src={closeIcon} alt="Cancel" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className={styles.editButton}
                              onClick={() =>
                                handleEdit(_id, title, description)
                              }
                            >
                              <img src={editIcon} alt="Edit" />
                            </button>
                            <button className={styles.downloadButton}>
                              <a
                                href="#/"
                                onClick={() =>
                                  downloadFile(_id, file_name, file_mimetype)
                                }
                              >
                                <img src={downloadIcon} alt="Download" />
                              </a>
                            </button>
                            <button
                              className={styles.deleteButton}
                              onClick={() => handleDelete(_id)}
                            >
                              <img src={deleteIcon} alt="Delete" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan={3} style={{ fontWeight: "300" }}>
                  No files found. Please add some.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <div>
        <button onClick={handlePrevPage} disabled={page === 1}>
          {"<<"}
        </button>
        <button onClick={handleNextPage} disabled={page === totalPages}>
          {">>"}
        </button>
      </div>
    </div>
  );
};

export default FilesList;
