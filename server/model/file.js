const mongoose = require('mongoose');

const fileSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    file_name: {
      type: String,
      required: true
    },
    file_mimetype: {
      type: String,
      required: true
    },
    width: {
     type: String,
      required: true
    },
    height: {
     type: String,
      required: true
    },
    fileSizeInBytes: {
     type: String,
      required: true
    },
    fileSizeInKb: {
     type: String,
      required: true
    },
    fileSizeInMb: {
     type: String,
      required: true
    },
    messageId:{
      type: String,
      required: true
    },
    fileId:{
      type: String,
      required: true
    },
    thumbnailId:{
      type: String,
      required: true
    }
  },
  
  {
    timestamps: true
  }
);

const File = mongoose.model('Files', fileSchema);

module.exports = File;
