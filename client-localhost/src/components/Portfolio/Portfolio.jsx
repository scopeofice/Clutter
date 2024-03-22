import React, { useEffect, useState } from 'react';
import styles from './Portfolio.module.css';
import Cards from './Cards/Cards';
import { API_URL } from '../../utils/constants';
import axios from 'axios';
import EmptySearch from "../../../public/EmptySearch.json"
import Lottie from 'lottie-react';

export default function Portfolio() {
  const [filesList, setFilesList] = useState([]);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const getFilesList = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/getAllFiles`);
        setErrorMsg('');
        setFilesList(data);
      } catch (error) {
        error.response && setErrorMsg(error.response.data);
      }
    };

    getFilesList();
  }, []);

  const handleSearch = async () => {
    try {
      const resp = await axios.get(`${API_URL}/search`, {
        params: { query: search }
      });
      setFilesList(resp.data);
    } catch (error) {
      console.error("Error searching files:", error);
    }
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
    <section id='portfolio' className={styles.portfolio}>
      {errorMsg && <p className="errorMsg">{errorMsg}</p>}
      <div className='container'>
        
       <div style={{display:"flex",justifyContent:"center"}}>
       <input type='search'  className={styles['material-ui-search']} value={search} onChange={(e) => setSearch(e.target.value)} onKeyPress={handleSearch} />
        <button onClick={handleSearch}>Search</button>
       </div>
        {currentItems.length === 0 ? <div style={{margin:"20px"}}>
          <div className="lottie-container">
            <Lottie animationData={EmptySearch} loop={false} />
          </div>
          <p>Nothing to display</p>
        </div> :  <ul className={styles.cards}>
          {currentItems.map(({ _id, title, description, file_path, file_data, file_mimetype }) => (
            <Cards key={_id} id={_id} image={`data:${file_mimetype};base64,${file_data}`} title={title} description={description} filePath={file_path} fileMimetype={file_mimetype} />
          ))}
        </ul>}
        
        {/* Pagination */}
        <div className="pagination" >
          <button onClick={handlePrev} disabled={currentPage === 1}>{"<"}</button>
          {renderPaginationButtons()}
          <button onClick={handleNext} disabled={currentPage === totalPageCount}>{">"}</button>
        </div>
        
      </div>
    </section>
  );
}
