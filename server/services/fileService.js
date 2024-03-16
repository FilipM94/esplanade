const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Direktorij gdje će se spremiti slike
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage }).single("file");

exports.upload = async (req, res) => {
  console.log("FileService.upload");
  upload(req, res, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Greška prilikom uploada datoteke.");
      return;
    }

    const { id, tableName } = req.body;
    const fileName = req.file.filename;
    saveFileToTable(id, fileName, tableName);

    res.send("Datoteka uspješno spremljena.");
  });
};

exports.download = async (req, res) => {
  console.log("FileController.download", req.params.fileName);
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "../uploads/", fileName);

  if (fs.existsSync(filePath)) {
    //res.sendFile(filePath);
    const fileContent = fs.readFileSync(filePath, { encoding: "base64" });
    const base64Image = `data:image/jpeg;base64,${fileContent}`;
    const uid = -Math.floor(Math.random() * 1000) - 1;
    res.json({ uid: uid, name: fileName, status: "done", url: base64Image });
  } else {
    res.status(404).send("Datoteka nije pronađena.");
  }
};

exports.delete = async (req, res) => {
  console.log("FileController.delete", req.params.fileName);
  const fileName = req.params.fileName;
  const tableName = req.params.tableName;
  try {
    const filePath = path.join(__dirname, "../uploads/", fileName);
    if (fs.existsSync(filePath)) {
      await fs.unlinkSync(filePath);
      deleteFileFromTable(fileName, tableName);
      res.status(200).json({
        success: true,
        message: `Datoteka ${fileName} uspješno izbrisana.`
      });
    } else {
      res.status(404).send("Datoteka nije pronađena.");
    }
  } catch (error) {
    console.error(`Greška prilikom brisanja datoteke ${fileName}:`, error);
    res.status(500).json({
      success: false,
      message: `Greška prilikom brisanja datoteke ${fileName}.`
    });
  }
};

const saveFileToTable = (id, fileName, tableName) => {
  if (id != null && fileName != null && tableName != null) {
    switch (tableName) {
      case "users":
        break;
    }
  }
};

const deleteFileFromTable = (fileName, tableName) => {
  if (fileName != null && tableName != null) {
    switch (tableName) {
      case "users":
        break;
    }
  }
};
