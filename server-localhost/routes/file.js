const path = require('path');
const express = require('express');
const multer = require('multer');
const File = require('../db/db');
const Router = express.Router();
const fs = require('fs');
const sizeOf = require('image-size');


//real deal


Router.use(express.json());


const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './files');
    },
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}_${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 10000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png|svg)$/)) {
      return cb(
        new Error(
          'only upload files with jpg, jpeg, png, or svg format.'
        )
      );
    }
    cb(undefined, true);
  }
});




Router.post('/upload', upload.single('file'), async (req, res) => {
  try {
      const { title, description } = req.body;
      const { path: filePath, mimetype } = req.file;

      const dimensions = sizeOf(filePath);
      const { width, height } = dimensions;

      const stats = fs.statSync(filePath);
      const fileSizeInBytes = stats.size;
      const fileSizeInKb = fileSizeInBytes / 1024; 
      const fileSizeInMb = fileSizeInBytes / (1024 * 1024); 

      const sql = `INSERT INTO files (title, description, file_path, file_mimetype, width, height, fileSizeInBytes, fileSizeInKb, fileSizeInMb) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [title, description, filePath, mimetype, width, height, fileSizeInBytes, fileSizeInKb, fileSizeInMb];

       File.query(sql, values);
      res.send('File uploaded successfully.');
  } catch (error) {
      console.error(error);
      res.status(400).send('Error while uploading file. Try again later.');
  }
});


Router.put('/edit/:id', async (req, res) => {
  try {
      const { title, description } = req.body;
      const sql = `UPDATE files SET title=?, description=? WHERE id=?`;
      const values = [title, description, req.params.id];
       File.query(sql, values);
      res.send('File updated successfully.');
  } catch (error) {
      console.error(error);
      res.status(400).send('Error while updating file. Try again later.');
  }
});


Router.get('/search', async (req, res) => {
  try {
      const { query } = req.query; 
      const sql = `SELECT * FROM files WHERE title LIKE '%${query}%' OR description LIKE '%${query}%'`;
      const files =  File.query(sql);
      const filesWithImageData = files.map(file => ({
          _id: file.id,
          title: file.title,
          description: file.description,
          file_path: file.file_path,
          file_mimetype: file.file_mimetype,
          file_data: fs.readFileSync(path.join(__dirname, '..', file.file_path)).toString('base64'), 
          width: file.width.toString(),
          height: file.height.toString(),
          fileSizeInBytes: file.fileSizeInBytes.toString(),
          fileSizeInKb: file.fileSizeInKb.toString(), 
          fileSizeInMb: file.fileSizeInMb.toString() 
      }));
      res.send(filesWithImageData);
  } catch (error) {
      console.error(error);
      res.status(400).send('Error while searching files. Try again later.');
  }
});




Router.get('/getAllFiles', async (req, res) => {
  try {
      const sql = `SELECT * FROM files ORDER BY createdAt DESC`;
      const files =  File.query(sql);
      const filesWithImageData = files.map(file => ({
          _id: file.id,
          title: file.title,
          description: file.description,
          file_path: file.file_path,
          file_mimetype: file.file_mimetype,
          file_data: fs.readFileSync(path.join(__dirname, '..', file.file_path)).toString('base64'), 
          width: file.width.toString(),
          height: file.height.toString(),
          fileSizeInBytes: file.fileSizeInBytes.toString(),
          fileSizeInKb: file.fileSizeInKb.toString(), 
          fileSizeInMb: file.fileSizeInMb.toString() 
      }));
      res.send(filesWithImageData);
  } catch (error) {
      console.error(error);
      res.status(400).send('Error while getting list of files. Try again later.');
  }
});





Router.get('/download/:id', async (req, res) => {
  try {
      const sql = `SELECT file_path, file_mimetype FROM files WHERE id=?`;
      const [result] =  File.query(sql, req.params.id);
      if (!result) {
          return res.status(404).send('File not found.');
      }
      const { file_path, file_mimetype } = result;
      res.set({
          'Content-Type': file_mimetype
      });
      res.sendFile(path.join(__dirname, '..', file_path));
  } catch (error) {
      console.error(error);
      res.status(400).send('Error while downloading file. Try again later.');
  }
});



Router.delete('/delete/:id', async (req, res) => {
  try {
      const sql = `SELECT file_path FROM files WHERE id=?`;
      const [result] =  File.query(sql, req.params.id);
      if (!result) {
          return res.status(404).send('File not found.');
      }
      const filePath = result.file_path;
      fs.unlink(filePath, async (err) => {
          if (err) {
              console.error('Error deleting file:', err);
              return res.status(500).send('Error deleting file.');
          } else {
              const deleteSql = `DELETE FROM files WHERE id=?`;
               File.query(deleteSql, req.params.id);
              console.log('File deleted successfully');
              res.send('File deleted successfully.');
          }
      });
  } catch (error) {
      console.error(error);
      res.status(400).send('Error while deleting file. Try again later.');
  }
});




module.exports = Router;
