import React, { useState, useRef, useEffect } from "react";
import Dropzone from "react-dropzone";
import axios from "axios";
import { Form, Row, Col, Button } from "react-bootstrap";
import { API_URL } from "../utils/constants";
import "../styles.css";

const Upload = () => {
  const [fileInfos, setFileInfos] = useState([]);
  const [state, setState] = useState({
    title: "",
    description: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const dropRef = useRef();

  const handleInputChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };

  const onDrop = (files) => {
    if (files.length > 2) {
      setErrorMsg("You can upload only 2 files at a time.");
      setTimeout(() => {
        setErrorMsg('');
      }, 3000);
      return; // Exit the function if more than 2 files are dropped
    }
    const filePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const image = new Image();
          image.src = fileReader.result;
          image.onload = () => {
            resolve({
              file: file,
              width: image.width,
              height: image.height
            });
          };
        };
        fileReader.onerror = reject;
        fileReader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises)
      .then(fileInfos => {
        setFileInfos(fileInfos);
      })
      .catch(error => {
        console.error('Error reading files:', error);
        setErrorMsg("Unable to upload files.")
        setTimeout(() => {
          setErrorMsg('');
        }, 3000);
      });
  };

  const updateBorder = (dragState) => {
    if (dragState === "over") {
      dropRef.current.style.border = "2px solid #000";
    } else if (dragState === "leave") {
      dropRef.current.style.border = "2px dashed #e9ebeb";
    }
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();

    try {
      const { title, description } = state;
      if (title.trim() !== "" && description.trim() !== "") {
        if (fileInfos.length > 0) {
          for (let i = 0; i < fileInfos.length; i++) {
            const { file, width, height } = fileInfos[i];
            const allowedFileTypes = ["image/png", "image/svg+xml"];

            if (allowedFileTypes.includes(file.type)) {
              const formData = new FormData();
              formData.append("document", file);

              const currentDate = new Date();
              const fileName = `${currentDate.getTime()}_${file.name}`;
              const mimeType = file.type;
              const fileSizeInBytes = file.size.toString();
              const fileSizeInKb = (fileSizeInBytes / 1024).toString();
              const fileSizeInMb = (fileSizeInKb / 1024).toString();

              const caption = `Title: ${title}\nDescription: ${description}\nFile Name: ${fileName}\nFile Type: ${mimeType}\nSizeInBytes: ${fileSizeInBytes} bytes\nSizeInKb: ${fileSizeInKb} KB\nSizeInMb: ${fileSizeInMb} MB\nResolution: ${width} x ${height}`;

              formData.append("chat_id", "631175283");
              formData.append("caption", caption);
              const token = await axios.get(`${API_URL}/getToken`);
              const response = await axios.post(
                `https://api.telegram.org/bot${token.data}/sendDocument`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              console.log(response.data);

              const tumbId = mimeType === 'image/svg+xml' ? response.data.result.document.file_id : response.data.result.document.thumbnail.file_id;

              try {
                const requestBody = {
                  title,
                  description,
                  file_name: `${currentDate.getTime()}_${fileName}`,
                  file_mimetype: mimeType,
                  width: width,
                  height: height,
                  fileSizeInBytes,
                  fileSizeInKb,
                  fileSizeInMb,
                  messageId: response.data.result.message_id,
                  fileId: response.data.result.document.file_id,
                  thumbnailId: tumbId,
                };

                const re = await axios.post(`${API_URL}/dbupload`, requestBody);
                console.log(re.data);
              } catch (error) {
                console.log("error sending data to database", error);
              }
            } else {
              setErrorMsg("Please select a file of type: PNG or SVG.");
              setTimeout(() => {
                setErrorMsg('');
              }, 3000);
            }
          }

          setErrorMsg("Files Uploaded");
          setTimeout(() => {
            setErrorMsg('');
          }, 3000);

          // Reset state after all files are uploaded
          setFileInfos([]);
          setState({
            title: "",
            description: "",
          });
        } else {
          setErrorMsg("Please select at least one file to add.");
          setTimeout(() => {
            setErrorMsg('');
          }, 3000);
        }
      } else {
        setErrorMsg("Please enter all the field values.");
        setTimeout(() => {
          setErrorMsg('');
        }, 3000);
      }
    } catch (error) {
      setErrorMsg("Unable to send to Telegram bot.");
      setTimeout(() => {
        setErrorMsg('');
      }, 3000);
    }
  };

  const handleCloseError = () => {
    setErrorMsg("");
  };

  return (
    <React.Fragment>
      <Form
        className="search-form"
        style={{ padding: "20px", width: "80vw" }}
        onSubmit={handleOnSubmit}
      >
        <h1 style={{ padding: "20px" }}>Upload New File </h1>
        {errorMsg && (
          <div style={{ display: "flex" }}>
            <p className={errorMsg === "Files Uploaded" ? "successMsg" : "errorMsg"}>{errorMsg}</p>
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
        <Row>
          <Col>
            <Form.Group controlId="title">
              <Form.Control
                type="text"
                name="title"
                value={state.title || ""}
                placeholder="Enter title"
                onChange={handleInputChange}
                className="material-ui-input"
                autoComplete="on"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="description">
              <Form.Control
                as="textarea"
                name="description"
                value={state.description || ""}
                placeholder="Enter description"
                onChange={handleInputChange}
                className="material-ui-input"
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="upload-section">
          <Dropzone
            onDrop={onDrop}
            onDragEnter={() => updateBorder("over")}
            onDragLeave={() => updateBorder("leave")}
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps({ className: "drop-zone" })} ref={dropRef}>
                <input {...getInputProps()} />
                <p>Drag and drop a file OR click here to select a file</p>
                {fileInfos.map((fileInfo, index) => (
                  <div key={index}>
                    <strong>Selected file:</strong> {fileInfo.file.name}
                  </div>
                ))}
              </div>
            )}
          </Dropzone>
        </div>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </React.Fragment>
  );
};

export default Upload;
