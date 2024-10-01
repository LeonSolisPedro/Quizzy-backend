import express from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client"

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());


app.get("/", async (req, res) => {
  const user = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
      posts: {
        create: { title: 'Hello World' },
      },
      profile: {
        create: { bio: 'I like turtles' },
      },
    },
  })

  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true,
    },
  })

  return res.json(allUsers)
})


const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
