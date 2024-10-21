import express from "express"
import cors from "cors"
import context from "./Entites/AppDbContext"
import AppDbSeeder from "./Entites/AppDbSeeder"
import { User } from "./Entites/User";
import { body } from "express-validator";
import validation from "./validation";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const app = express();
app.use(cors());
app.use(express.json());
context.initialize().then(x => AppDbSeeder.SeedAsync(x))


app.get("/", async (req, res) => {
  res.send("Hello world!")
})

app.post("/api/login", [
  body('email').notEmpty().isEmail(),
  body('password').notEmpty()
], validation, async (req, res) => {
  const { email, password } = req.body;
  try {
    const repoUser = context.getRepository(User)
    const user = await repoUser.findOneBy({email})
    if (user === null)
      return res.status(401).json({ message: 'Invalid credentials' })
    if(user.isBlocked)
      return res.status(401).json({ message: 'Your account is blocked, please contact pedro@wintercr.com' })
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, 'fantastic-and-cool-key');
    delete user.password;
    return res.json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: 'An error occured' });
  }
})


app.post('/api/register', [
  body('name').notEmpty(),
  body('email').notEmpty().isEmail(),
  body('password').notEmpty(),
  body('URLImage').notEmpty(),
], validation, async (req, res) => {
  const hpassword = await bcrypt.hash(req.body.password, 10);
  const user = { ...req.body, password: hpassword, id: 0, isAdmin: false, isBlocked: false }
  try {
    const repoUser = context.getRepository(User)
    await repoUser.save(user)
    delete user.password;
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(500).json({ message: 'Email is already taken' });
    return res.status(500).json({ message: 'An error occured' });
  }
  res.status(200).json({user})
});


const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
