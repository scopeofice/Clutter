const express = require('express');
const File = require('../model/file');
const Router = express.Router();
const axios = require('axios');


Router.use(express.json());

Router.post("/", (req, resp) => {
  console.log(req.body);
  resp.send("OK")
})

Router.get("/", (req, resp) => {
  resp.send("OK")
})



Router.post("/telebot", async (req, resp) => {
  try {
    const telegramBotURL = `https://api.telegram.org/bot${process.env.API_TOKEN}`;
    const chatId = `${process.env.CHAT_ID}`;
    const requestBody = {
      chat_id: chatId, 
      text: req.body.message,
    };
    const response = await axios.post(`${telegramBotURL}/sendMessage`, requestBody)
    resp.send("Working")
  } catch (error) {
    console.log("error sending message to bot")
    resp.send("Not Working");
  }
})

Router.delete("/deleteAll", async (req, res) => {
  try {
    await File.deleteMany({});
    res.send("All files have been deleted successfully.");
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).send("Internal server error occurred while deleting files.");
  }
});

Router.post("/dbupload", async (req, resp) => {
  try {
    const file = new File({
      title: req.body.title,
      description: req.body.description,
      file_name: req.body.file_name,
      file_mimetype: req.body.file_mimetype,
      width: req.body.width,
      height: req.body.height,
      fileSizeInBytes: req.body.fileSizeInBytes,
      fileSizeInKb: req.body.fileSizeInKb,
      fileSizeInMb: req.body.fileSizeInMb,
      messageId: req.body.messageId,
      fileId: req.body.fileId,
      thumbnailId: req.body.thumbnailId
    });

    await file.save();
    resp.send('file uploaded successfully.');
  } catch (error) {
    console.log("error occured saving in db");
    resp.send("unable to save")
  }
})


Router.put('/edit/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found.');
    }
    file.title = title;
    file.description = description;
    await file.save();
    res.send('File updated successfully.');
  } catch (error) {
    res.status(400).send('Error while updating file. Try again later.');
  }
});

Router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    const files = await File.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });

    const sortedByCreationDate = files.sort((a, b) => b.createdAt - a.createdAt);
    const filesWithImageData = await Promise.all(sortedByCreationDate.map(async (file) => {
      const response = await axios.get(`https://api.telegram.org/bot${process.env.API_TOKEN}/getFile?file_id=${file.fileId}`);
      const filePath = response.data.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${process.env.API_TOKEN}/${filePath}`;
      const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const data = Buffer.from(fileResponse.data, 'binary').toString('base64');
      return {
        _id: file._id,
        title: file.title,
        description: file.description,
        file_name: file.file_name,
        file_mimetype: file.file_mimetype,
        file_data: data,
        width: file.width.toString(),
        height: file.height.toString(),
        fileSizeInBytes: file.fileSizeInBytes.toString(),
        fileSizeInKb: file.fileSizeInKb.toString(),
        fileSizeInMb: file.fileSizeInMb.toString(),
        messageId: file.messageId,
        fileId: file.fileId,
        thumbnailId: file.thumbnailId
      };
    }));
    res.send(filesWithImageData);
  } catch (error) {
    res.status(400).send('Error while searching files. Try again later.');
  }
});

Router.get('/searchFiles', async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;

    const totalCount = await File.countDocuments({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });

    const totalPages = Math.ceil(totalCount / limit);

    const files = await File.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .skip((page - 1) * limit)
    .limit(limit);

    const filesWithImageData = await Promise.all(files.map(async (file) => {
      const response = await axios.get(`https://api.telegram.org/bot${process.env.API_TOKEN}/getFile?file_id=${file.fileId}`);
      const filePath = response.data.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${process.env.API_TOKEN}/${filePath}`;
      const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const data = Buffer.from(fileResponse.data, 'binary').toString('base64');
      
      
      return {
        _id: file._id,
        title: file.title,
        description: file.description,
        file_name: file.file_name,
        file_mimetype: file.file_mimetype,
        file_data: data,
        width: file.width.toString(),
        height: file.height.toString(),
        fileSizeInBytes: file.fileSizeInBytes.toString(),
        fileSizeInKb: file.fileSizeInKb.toString(),
        fileSizeInMb: file.fileSizeInMb.toString(),
        messageId: file.messageId,
        fileId: file.fileId,
        thumbnailId: file.thumbnailId
      };
    }));

    res.send({ files: filesWithImageData, totalCount, totalPages });
  } catch (error) {
    res.status(400).send('Error while searching files. Try again later.');
  }
});



Router.get('/getAllFileList', async (req, res) => {
  try {
    // const files = await File.find({});
    // const sortedByCreationDate = files.sort((a, b) => b.createdAt - a.createdAt);

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const totalCount = await File.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const files = await File.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const filesWithImageData = await Promise.all(files.map(async (file) => {
      const response = await axios.get(`https://api.telegram.org/bot${process.env.API_TOKEN}/getFile?file_id=${file.fileId}`);
      const filePath = response.data.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${process.env.API_TOKEN}/${filePath}`;
      const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const data = Buffer.from(fileResponse.data, 'binary').toString('base64');
      
      
      return {
        _id: file._id,
        title: file.title,
        description: file.description,
        file_name: file.file_name,
        file_mimetype: file.file_mimetype,
        file_data: data,
        width: file.width.toString(),
        height: file.height.toString(),
        fileSizeInBytes: file.fileSizeInBytes.toString(),
        fileSizeInKb: file.fileSizeInKb.toString(),
        fileSizeInMb: file.fileSizeInMb.toString(),
        messageId: file.messageId,
        fileId: file.fileId,
        thumbnailId: file.thumbnailId
      };
    }));
    res.send({ files: filesWithImageData, totalPages, totalCount });
  } catch (error) {
    console.log("error sending list");
    res.status(400).send('Check your internet connection. Try again later.');
  }
});

Router.get('/getToken',(req,resp)=>{
  resp.send(process.env.API_TOKEN);
})

Router.get('/getImages', async (req ,resp)=>{
  try {
    const { query } = req.query;
    const response = await axios.get(`https://api.telegram.org/bot${process.env.API_TOKEN}/getFile?file_id=${query}`);
      const filePath = response.data.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${process.env.API_TOKEN}/${filePath}`;
      const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const data = Buffer.from(fileResponse.data, 'binary').toString('base64');
      resp.send(data);

  } catch (error) {
    console.log("error sending list");
    // resp.status(400).send('Check your internet connection. Try again later.');
  }
})

Router.get('/getAllFiles', async (req, res) => {
  try {
    const files = await File.find({})
      .sort({ createdAt: -1 })
      .limit(50);

    const filesWithImageData = await Promise.all(files.map(async (file) => {
      // const response = await axios.get(`https://api.telegram.org/bot${process.env.API_TOKEN}/getFile?file_id=${file.fileId}`);
      // const filePath = response.data.result.file_path;
      // const fileUrl = `https://api.telegram.org/file/bot${process.env.API_TOKEN}/${filePath}`;
      // const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      // const data = Buffer.from(fileResponse.data, 'binary').toString('base64');
      
      
      return {
        _id: file._id,
        title: file.title,
        description: file.description,
        file_name: file.file_name,
        file_mimetype: file.file_mimetype,
        // file_data: data,
        width: file.width.toString(),
        height: file.height.toString(),
        fileSizeInBytes: file.fileSizeInBytes.toString(),
        fileSizeInKb: file.fileSizeInKb.toString(),
        fileSizeInMb: file.fileSizeInMb.toString(),
        messageId: file.messageId,
        fileId: file.fileId,
        thumbnailId: file.thumbnailId
      };
    }));
    res.send(filesWithImageData);
  } catch (error) {
    console.log("error sending list");
    res.status(400).send('Check your internet connection. Try again later.');
  }
});

Router.get('/filesByMimeType/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    let totalCount, totalPages, files;

    if (type === 'png') {
      totalCount = await File.countDocuments({ file_mimetype: "image/png" });
      totalPages = Math.ceil(totalCount / limit);
      files = await File.find({ file_mimetype: "image/png" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else if (type === 'svg') {
      totalCount = await File.countDocuments({ file_mimetype: "image/svg+xml" });
      totalPages = Math.ceil(totalCount / limit);
      files = await File.find({ file_mimetype: "image/svg+xml" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else {
       totalCount = await File.countDocuments();
       totalPages = Math.ceil(totalCount / limit);
       files = await File.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    }

    const filesWithImageData = await Promise.all(files.map(async (file) => {
      const response = await axios.get(`https://api.telegram.org/bot${process.env.API_TOKEN}/getFile?file_id=${file.fileId}`);
      const filePath = response.data.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${process.env.API_TOKEN}/${filePath}`;
      const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const data = Buffer.from(fileResponse.data, 'binary').toString('base64');
      
      return {
        _id: file._id,
        title: file.title,
        description: file.description,
        file_name: file.file_name,
        file_mimetype: file.file_mimetype,
        file_data: data,
        width: file.width.toString(),
        height: file.height.toString(),
        fileSizeInBytes: file.fileSizeInBytes.toString(),
        fileSizeInKb: file.fileSizeInKb.toString(),
        fileSizeInMb: file.fileSizeInMb.toString(),
        messageId: file.messageId,
        fileId: file.fileId,
        thumbnailId: file.thumbnailId
      };
    }));

    res.send({ files: filesWithImageData, totalPages, totalCount });
  } catch (error) {
    console.log("error sending list");
    res.status(400).send('Error while getting list of files. Try again later.');
  }
});






Router.get('/download/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    const response = await axios.get(`https://api.telegram.org/bot${process.env.API_TOKEN}/getFile`, {
      params: {
        file_id: file.fileId,
      },
    });


    const filePath = response.data.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${process.env.API_TOKEN}/${filePath}`;

    res.setHeader('Content-Type', file.file_mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);


    const fileResponse = await axios.get(fileUrl, { responseType: 'stream' });
    fileResponse.data.pipe(res);
    // console.log('download successfull');
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(400).send('Error while downloading file. Try again later.');
  }
});


Router.delete('/delete/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found.');
    }
    const telegramBotURL = `https://api.telegram.org/bot${process.env.API_TOKEN}`;
    const deleteMessageEndpoint = `${telegramBotURL}/deleteMessage`;
    const deleteMessageRequest = {
      chat_id: `${process.env.CHAT_ID}`, 
      message_id: file.messageId 
    };
    const respo = await axios.post(deleteMessageEndpoint, deleteMessageRequest);
    file.remove();
    res.send("file has been removed")
  } catch (error) {
    console.log("error occurred")
    res.status(400).send('Error while deleting file. Try again later.');
  }
});


module.exports = Router;
