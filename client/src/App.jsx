import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Upload from './components/Upload';
import FilesList from './components/FileList/FilesList';
import Home from './components/Home';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/list" element={<FilesList />} />
          </Routes>
        </div>
        <Footer/>
      </div>
    </BrowserRouter>
  );
}

export default App;
