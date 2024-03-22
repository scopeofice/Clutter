import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Admin from './components/Admin';
import FilesList from './components/FilesList';
import Home from './components/Home';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/list" element={<FilesList />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
