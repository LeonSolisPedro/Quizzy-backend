import express from "express"
import cors from "cors"
import context from "./Entites/AppDbContext"

const app = express();
app.use(cors());
app.use(express.json());
context.initialize();


app.get("/", async (req, res) => {
  res.send("Hello world!")
})


const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
