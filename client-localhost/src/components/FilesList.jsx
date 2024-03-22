import React, { useState, useEffect } from "react";
import download from "downloadjs";
import axios from "axios";
import { API_URL } from "../utils/constants";
import deleteIcon from "../../public/deleteSVG.svg";
import filterIcon from "../../public/filterSVG.svg";
import downloadIcon from "../../public/downloadSVG.svg";
import editIcon from "../../public/editSVG.svg";
import saveIcon from "../../public/saveSVG.svg";
import closeIcon from "../../public/closeSVG.svg";
import styles from "./FilesList.module.css";

const FilesList = () => {
  const [filesList, setFilesList] = useState([]);
  const [search, setSearch] = useState("");
  const [sortedFilesList, setSortedFilesList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleSearch = async () => {
    try {
      const resp = await axios.get(`${API_URL}/search`, {
        params: { query: search },
      });
      setFilesList(resp.data);
      setSortedFilesList(resp.data)
    } catch (error) {
      console.error("Error searching files:", error);
    }
  };

  useEffect(() => {
    const getFilesList = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/getAllFiles`);
        setErrorMsg("");
        setFilesList(data);
        setSortedFilesList(data);
      } catch (error) {
        error.response && setErrorMsg(error.response.data);
      }
    };

    getFilesList();
  }, []);

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

  const handleEdit = (id, title, description) => {
    setEditingId(id);
    setEditedTitle(title);
    setEditedDescription(description);
  };

  const handleSaveEdit = async () => {
    alert(editingId + " " + editedTitle + " " + editedDescription);
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
    try {
      await axios.delete(`${API_URL}/delete/${id}`);
      setFilesList(filesList.filter((file) => file._id !== id));
      setSortedFilesList(sortedFilesList.filter((file) => file._id !== id));
      setErrorMsg("");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMsg("Error while deleting file. Try again later");
      }
    }
  };

  // Function to sort files based on the selected field and direction
  const sortFiles = (field, direction) => {
    const sorted = [...sortedFilesList].sort((a, b) => {
      if (direction === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
    setSortedFilesList(sorted);
  };

  const totalPageCount = Math.ceil(filesList.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filesList.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPaginationButtons = () => {
    const paginationButtons = [];
    if (totalPageCount <= 5) {
      for (let i = 1; i <= totalPageCount; i++) {
        paginationButtons.push(
          <button key={i} onClick={() => paginate(i)} className={currentPage === i ? 'active' : ''}>
            {i}
          </button>
        );
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          paginationButtons.push(
            <button key={i} onClick={() => paginate(i)} className={currentPage === i ? 'active' : ''}>
              {i}
            </button>
          );
        }
      } else if (currentPage >= totalPageCount - 2) {
        for (let i = totalPageCount - 4; i <= totalPageCount; i++) {
          paginationButtons.push(
            <button key={i} onClick={() => paginate(i)} className={currentPage === i ? 'active' : ''}>
              {i}
            </button>
          );
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          paginationButtons.push(
            <button key={i} onClick={() => paginate(i)} className={currentPage === i ? 'active' : ''}>
              {i}
            </button>
          );
        }
      }
    }
    return paginationButtons;
  };

  const handleNext = () => {
    if (currentPage < totalPageCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="files-container" style={{ padding: "20px", width: "80vw" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px",
          alignItems:"baseline"
        }}
      >
        
        <div className={styles.filterMenu}>
          <div
            style={{ display: "flex", marginBottom: "10px", cursor: "pointer" }}
          >
            <p style={{ marginRight: "2px" }}>Filter</p>
            <img src={filterIcon} alt="filter" />
          </div>
          <div className={styles.filterDropdown}>
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
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <input
            type="search"
            className={styles["material-ui-search"]}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleSearch}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>
      {errorMsg && <p className="errorMsg">{errorMsg}</p>}
      <div className="pagination" style={{marginBottom:"20px"}} >
          <button onClick={handlePrev} disabled={currentPage === 1}>{"<"}</button>
          {renderPaginationButtons()}
          <button onClick={handleNext} disabled={currentPage === totalPageCount}>{">"}</button>
        </div>
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
          {currentItems.length > 0 ? (
            currentItems.map(
              ({
                _id,
                title,
                description,
                file_path,
                file_data,
                file_mimetype,
                width,
                height,
                fileSizeInMb,
                fileSizeInKb,
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
                    {file_mimetype.startsWith("image") ? (
                      <img
                        src={`data:${file_mimetype};base64,${file_data}`}
                        alt={title}
                        style={{ maxWidth: "100px", maxHeight: "100px" }}
                      />
                    ) : (
                      <a
                        href={`data:${file_mimetype};base64,${file_data}`}
                        download={title}
                      >
                        <img src={downloadIcon} alt="Download" />
                      </a>
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
                            onClick={() => handleEdit(_id, title, description)}
                          >
                            <img src={editIcon} alt="Edit" />
                          </button>
                          <button className={styles.downloadButton}>
                            <a
                              href="#/"
                              onClick={() =>
                                downloadFile(_id, file_path, file_mimetype)
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
      <div className="pagination" style={{marginTop:"20px"}}>
          <button onClick={handlePrev} disabled={currentPage === 1}>{"<"}</button>
          {renderPaginationButtons()}
          <button onClick={handleNext} disabled={currentPage === totalPageCount}>{">"}</button>
        </div>
    </div>
  );
};

export default FilesList;
