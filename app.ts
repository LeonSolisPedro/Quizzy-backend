import express from "express"
import cors from "cors"
import context from "./Entites/AppDbContext"
import { Book } from "./Entites/Book";
import { Cover } from "./Entites/Cover";

const app = express();
app.use(cors());
app.use(express.json());
context.initialize();


app.get("/", async (req, res) => {
  const repo1 = context.getRepository(Book)
  const repo2 = context.getRepository(Cover)


  const book  = {
    name: "Book1",
  }
  const cover = {
    synopsis: "This is the Synopsis",
    book: book
  }
  await repo1.save(book)
  await repo2.save(cover)
  return res.json(book)
})


const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
