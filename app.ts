import express from "express"
import cors from "cors"
import context from "./Entites/AppDbContext"
import AppDbSeeder from "./Entites/AppDbSeeder"
import { User } from "./Entites/User";
import { body, param } from "express-validator";
import validation from "./validation";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Quizz } from "./Entites/Quizz";
import { Tag } from "./Entites/Tag";
import authorize from "./authorize";
import { AccessStatus } from "./Enums/Enums";
import { UserResponse } from "./Entites/UserResponse";
import { Answer } from "./Entites/Answer";

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
    // https://stackoverflow.com/a/68690787/20961125
    const user = await repoUser
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
    if (user === null)
      return res.status(401).json({ message: 'Invalid credentials' })
    if (user.isBlocked)
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
  res.status(200).json({ user })
});

//Gets the quizz, exclusive for welcome page
app.get("/api/welcome/getQuizz/:id", [
  param("id").isNumeric()
], validation, async (req, res) => {
  const { id } = req.params
  const repoQuizz = context.getRepository(Quizz)
  const quizz = await repoQuizz.findOne({
    where: { id },
    relations: { topic: true, quizzTags: { tag: true }, questions: true }
  })
  if (quizz == null) return res.status(404).send()
  return res.status(200).json(quizz)
})

//Gets the quizz, exclusive for responding view
app.get("/api/responding/getQuizz/:id", [
  param("id").isNumeric()
], validation, async (req, res) => {
  const { id } = req.params
  const repoQuizz = context.getRepository(Quizz)
  const quizz = await repoQuizz.findOne({
    where: { id },
    relations: { topic: true, quizzTags: { tag: true }, questions: true, allowedUsers: true }
  })
  const token = req.headers['authorization']?.split(' ')[1];
  const userId = token ? jwt.verify(token, 'fantastic-and-cool-key').id : 0;
  const eligible = await eligibility(quizz, userId)
  return res.status(200).json({ quizz, eligible })
})


//Sets the answers of responding views
app.post("/api/responding/quizz/:id", [
  param("id").isNumeric(),
  body("answers").notEmpty()
], validation, authorize, async (req, res) => {
  const quizzId = req.params.id
  let { answers } = req.body
  const repoQuizz = context.getRepository(Quizz)
  const quizz = await repoQuizz.findOne({
    where: { id: quizzId },
    relations: { allowedUsers: true }
  })
  const response = await eligibility(quizz, req.user.id)
  if (!response.permission) return res.status(401).json({ message: "You don't have permissions to respond" });
  if (response.responded) return res.status(422).json({ message: "You can only respond once" });
  try {
    const repoResponse = context.getRepository(UserResponse)
    const repoAnswer = context.getRepository(Answer)
    const userResponse: UserResponse = {
      id: 0,
      responseDate: new Date(),
      userId: req.user.id,
      quizzId: quizz.id,
      Score: 0
    }
    await repoResponse.save(userResponse)
    answers = answers.map(x => ({ ...x, userResponse }))
    await repoAnswer.save(answers)
  } catch (error) {
    return res.status(500).json({ message: "An error has ocurred" });
  }
  return res.status(200).send()
})


const eligibility = async (quizz, userId) => {
  const repoResponse = context.getRepository(UserResponse)
  if (quizz == null) return { permission: false, responded: false };
  if (quizz.accessStatus === AccessStatus.PRIVATE) {
    const isAllowed = quizz.allowedUsers.some(x => x.userId == userId)
    if (!isAllowed) return { permission: false, responded: false };
  }
  if (quizz.acceptMultipleAnswers == false) {
    const exists = await repoResponse.existsBy({ quizzId: quizz.id, userId })
    if (exists) return { permission: true, responded: true };
  }
  return { permission: true, responded: false }
}


//Gets my answers
app.get("/api/myanswers", authorize, async (req, res) => {
  const repoResponse = context.getRepository(UserResponse)
  const responses = await repoResponse.find({
    where: { userId: req.user.id },
    relations: { quizz: true }
  })
  return res.status(200).json(responses)
})

//Gets specific answer
app.get("/api/myanswers/:id", [
  param("id").isNumeric()
], validation, authorize, async (req, res) => {
  const { id } = req.params
  const repoResponse = context.getRepository(UserResponse)
  const response = await repoResponse.findOne({
    where: { id, userId: req.user.id },
    relations: {quizz: {topic: true, quizzTags: { tag: true }, questions: true }, answers: true}
  })
  if (response == null) return res.status(404).send();
  const newQuestions = response.quizz.questions.map(x => ({ ...x,
    answer: response.answers.find(y=> y.questionId === x.id)
  }))
  response.quizz.questions = newQuestions;
  return res.status(200).json(response.quizz)
})


//Get the latest quizzes
app.get("/api/welcome/getLatest", async (req, res) => {
  const repoQuizz = context.getRepository(Quizz)
  const quizz = await repoQuizz.find({
    order: { creationDate: "ASC" },
    relations: {user: true},
    take: 6
  })
  return res.status(200).json(quizz)
})

//Get popular quizzes
app.get("/api/welcome/getPopular", async (req, res) => {
  const repoQuizz = context.getRepository(Quizz)
  const quizz = await repoQuizz.find({
    where: {questions: {visibleAtTable: true}},
    relations: {questions: true,userResponses: true, likes: true}
  })
  quizz.sort((a, b) => {
    return  a.userResponses.length < b.userResponses.length ? 1 : -1;
  })
  const newQuizz = quizz.slice(0, 4)
  return res.status(200).json(newQuizz)
})

//Gets popular tags
app.get("/api/welcome/getTags", async (req, res) => {
  const repoTags = context.getRepository(Tag)
  const tags = await repoTags.find()
  return res.status(200).json(tags)
})


const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
