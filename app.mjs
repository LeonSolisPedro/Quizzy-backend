import express from "express"
import cors from "cors"

const app = express();
app.use(cors());
app.use(express.json());


app.get("/", async (req, res) => {
  return res.send("Hello world!")
})


const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
