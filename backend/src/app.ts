import express from "express";
const app = express();
const port = 4001;
app.get("/", (req, res) => {
  res.send("EnglishMaster Backend API");
});
app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
