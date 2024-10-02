import express from "express"
import cors from "cors"
import context from "./Entites/AppDbContext.mjs"
import { Book } from "./Entites/Book.mjs";

const app = express();
app.use(cors());
app.use(express.json());
await context.initialize();


app.get("/", async (req, res) => {
  const book = {
    name: "Book1"
  }

  const repo = context.getRepository(Book)
  await repo.save(book)
  return res.json(book)
})


const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
