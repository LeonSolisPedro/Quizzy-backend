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
import authorize, { checkAdmin } from "./authorize";
import { AccessStatus } from "./Enums/Enums";
import { UserResponse } from "./Entites/UserResponse";
import { Answer } from "./Entites/Answer";
import { In, Like } from "typeorm";
import { Topic } from "./Entites/Topic";
import { Question } from "./Entites/Question";
import { QuizzTag } from "./Entites/QuizzTag";
import { AllowedUser } from "./Entites/AllowedUser";

const app = express();
const port = 8080;
app.use(cors());
app.use(express.json());
context.initialize().then(async x => {
  await AppDbSeeder.SeedAsync(x)
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})

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
    order: { questions: { order: "ASC" } },
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
    order: { quizz: { questions: { order: "ASC" } } },
    where: { id, userId: req.user.id },
    relations: { quizz: { topic: true, quizzTags: { tag: true }, questions: true }, answers: true }
  })
  if (response == null) return res.status(404).send();
  const newQuestions = response.quizz.questions.map(x => ({
    ...x,
    answer: response.answers.find(y => y.questionId === x.id)
  }))
  response.quizz.questions = newQuestions;
  return res.status(200).json(response.quizz)
})


//Get the latest quizzes
app.get("/api/welcome/getLatest", async (req, res) => {
  const repoQuizz = context.getRepository(Quizz)
  let quizz = await repoQuizz.find({
    order: { creationDate: "ASC" },
    relations: { user: true },
    take: 6
  })
  //Filter by enum
  //https://stackoverflow.com/a/70157686
  quizz = quizz.filter(x => x.accessStatus == 0)
  return res.status(200).json(quizz)
})

//Get popular quizzes
app.get("/api/welcome/getPopular", async (req, res) => {
  const repoQuizz = context.getRepository(Quizz)
  let quizz = await repoQuizz.find({
    relations: { questions: true, userResponses: true, likes: true }
  })
  //Filter by enum
  //https://stackoverflow.com/a/70157686
  quizz = quizz.filter(x => x.accessStatus == 0)
  //Filter empty responses
  quizz = quizz.filter(x => x.userResponses.length > 0)
  //Sort by the highest
  quizz.sort((a, b) => {
    return a.userResponses.length < b.userResponses.length ? 1 : -1;
  })
  //Remove to only 5
  const newQuizz = quizz.slice(0, 4)
  return res.status(200).json(newQuizz)
})

//Gets popular tags
app.get("/api/welcome/getTags", async (req, res) => {
  const repoTags = context.getRepository(Tag)
  const tags = await repoTags.find()
  return res.status(200).json(tags)
})

//Get quizzes by tag
app.get("/api/welcome/getTag/:id", [
  param("id").isNumeric()
], validation, async (req, res) => {
  const { id } = req.params
  const repoTag = context.getRepository(Tag)
  const tag = await repoTag.findOneBy({ id })
  if (tag == null) return res.status(404).send()
  const repoQuizz = context.getRepository(Quizz)
  const quizz = await repoQuizz.find({
    where: { quizzTags: { tagId: id } },
    relations: { questions: true, userResponses: true, likes: true, quizzTags: true }
  })
  return res.status(200).json({ quizz, tag })
})


//Gets list of users
app.get("/api/users", authorize, checkAdmin, async (req, res) => {
  const repoUser = context.getRepository(User)
  const users = await repoUser.find()
  return res.status(200).json(users)
})


//Handles delete of user
app.delete("/api/users/:id", [param("id").isNumeric()], validation, authorize, checkAdmin, async (req, res) => {
  const { id } = req.params
  try {
    const idsResponse = (await context.manager.findBy(UserResponse, { userId: id })).map(x => x.id)
    const idsAnswers = (await context.manager.find(Answer, { where: { userResponseId: In(idsResponse) } })).map(x => x.id)
    if (idsAnswers.length > 0) await context.manager.delete(Answer, idsAnswers)
    if (idsResponse.length > 0) await context.manager.delete(UserResponse, idsResponse)
    await context.manager.delete(User, { id })
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete user" })
  }
  return res.status(200).send()
})

//Toggle Block
app.put("/api/users/:id/block", [param("id").isNumeric()], validation, authorize, checkAdmin, async (req, res) => {
  const { id } = req.params
  const repoUser = context.getRepository(User)
  const user = await repoUser.findOneBy({ id })
  await repoUser.update(id, { isBlocked: !user.isBlocked })
  return res.status(200).send()
})

//Toggle Admin
app.put("/api/users/:id/admin", [param("id").isNumeric()], validation, authorize, checkAdmin, async (req, res) => {
  const { id } = req.params
  const repoUser = context.getRepository(User)
  const user = await repoUser.findOneBy({ id })
  await repoUser.update(id, { isAdmin: !user.isAdmin })
  return res.status(200).send()
})

//Gets my quizzes
app.get("/api/myquizzes", authorize, async (req, res) => {
  const repoQuizz = context.getRepository(Quizz)
  const quizz = await repoQuizz.find({
    where: { userId: req.user.id },
    relations: { questions: true, userResponses: true }
  })
  return res.status(200).json(quizz)
})

//Gets all quizzes for the admin
app.get("/api/myquizzes/all", authorize, checkAdmin, async (req, res) => {
  const repoQuizz = context.getRepository(Quizz)
  const quizz = await repoQuizz.find({
    relations: { questions: true, userResponses: true }
  })
  return res.status(200).json(quizz)
})

//Settings
app.get("/api/myquizzes/:idQuizz/questions", authorize, async (req, res) => {
  const { idQuizz } = req.params
  const repoQuizz = context.getRepository(Quizz)
  const quizz = await repoQuizz.findOne({
    order: { questions: { order: "ASC" } },
    where: { id: idQuizz },
    relations: { topic: true, quizzTags: true, questions: { lastEditedAdmin: true } }
  })
  return res.status(200).json(quizz)
})

//Settings
app.get("/api/myquizzes/:idQuizz/results", authorize, async (req, res) => {
  const { idQuizz } = req.params
  const repoResponse = context.getRepository(UserResponse)
  const response = await repoResponse.find({
    where: { quizzId: idQuizz, },
    relations: { user: true }
  })
  return res.status(200).json(response)
})

//Settings
app.get("/api/myquizzes/:idQuizz/results/:idResponse", [
  param("idQuizz").isNumeric(),
  param("idResponse").isNumeric()
], validation, authorize, async (req, res) => {
  const { idQuizz, idResponse } = req.params
  const repoResponse = context.getRepository(UserResponse)
  const response = await repoResponse.findOne({
    order: { quizz: { questions: { order: "ASC" } } },
    where: { quizzId: idQuizz, id: idResponse },
    relations: { quizz: { topic: true, quizzTags: { tag: true }, questions: { lastEditedAdmin: true } }, answers: { lastEditedAdmin: true }, user: true }
  })
  if (response == null) return res.status(404).send();
  const newQuestions = response.quizz.questions.map(x => ({
    ...x,
    answer: response.answers.find(y => y.questionId === x.id)
  }))
  response.quizz.questions = newQuestions;
  return res.status(200).json(response)
})

//Settings
app.get("/api/myquizzes/:idQuizz/settings", authorize, async (req, res) => {
  const { idQuizz } = req.params
  const repoQuizz = context.getRepository(Quizz)
  const topicQuizz = context.getRepository(Topic)
  const quizz = await repoQuizz.findOne({
    where: { id: idQuizz },
    relations: { quizzTags: { tag: true }, allowedUsers: { user: true } }
  })
  const topics = await topicQuizz.find()
  return res.status(200).json({ quizz, topics })
})

//Settings
app.post("/api/myquizzes/:idQuizz/questions", authorize, async (req, res) => {
  const { questions, deletedIds } = req.body
  const { idQuizz } = req.params
  const repoQuestion = context.getRepository(Question)
  const repoAnswer = context.getRepository(Answer)
  if (deletedIds.length > 0) {
    const answersIds = (await repoAnswer.find({ where: { questionId: In(deletedIds) } })).map(x => x.id)
    if (answersIds.length > 0) await repoAnswer.delete(answersIds);
    await repoQuestion.delete(deletedIds)
  }
  await repoQuestion.save(questions)
  return res.status(200).json(questions)
})


app.delete("/api/myquizzes/:idQuizz/results/:idResponse", [
  param("idQuizz").isNumeric(),
  param("idResponse").isNumeric()
], validation, authorize, async (req, res) => {
  const { idQuizz, idResponse } = req.params
  const repoAnswer = context.getRepository(Answer)
  const repoResponse = context.getRepository(UserResponse)
  const answersIds = (await repoAnswer.find({ where: { userResponseId: idResponse } })).map(x => x.id)
  if (answersIds.length > 0) await repoAnswer.delete(answersIds);
  await repoResponse.delete({ id: idResponse })
  return res.status(200).send()
})


app.post("/api/myquizzes/:idQuizz/updateAnswers", authorize, async (req, res) => {
  const { answers, deletedIds } = req.body
  const repoAnswer = context.getRepository(Answer)
  if (deletedIds.length > 0) await repoAnswer.delete(deletedIds);
  await repoAnswer.save(answers)
  return res.status(200).json(answers)
})

app.delete("/api/myquizzes/:idQuizz", authorize, async (req, res) => {
  const idQuizz = req.params.idQuizz;
  const repoAnswer = context.getRepository(Answer)
  const repoQuestion = context.getRepository(Question)
  const repoReponse = context.getRepository(UserResponse)
  const repoQuizzTag = context.getRepository(QuizzTag)
  const repoQuizz = context.getRepository(Quizz)
  const repoAllowedUser = context.getRepository(AllowedUser)
  const question = await repoQuestion.find({ where: { quizzId: idQuizz }, relations: { answers: true } })
  const questionIds = question.map(x => x.id)
  const answerIds = question.flatMap(x => x.answers.map(answer => answer.id));
  if (answerIds.length > 0) await repoAnswer.delete(answerIds)
  if (questionIds.length > 0) await repoQuestion.delete(questionIds)
  await repoReponse.delete({ quizzId: idQuizz })
  await repoQuizzTag.delete({ quizzId: idQuizz })
  await repoAllowedUser.delete({ quizzId: idQuizz })
  await repoQuizz.delete({ id: idQuizz })
  return res.status(200).send()
})

app.post("/api/myquizzes/:idQuizz/settings", authorize, async (req, res) => {
  const { quizz, tags } = req.body
  const repoQuizz = context.getRepository(Quizz)
  await repoQuizz.save(quizz)

  // Check if there are different tags
  // By checking if the lenght is different
  // inside the QuizzTag (N:N) entity
  const repoTags = context.getRepository(Tag)
  const repoQuizzTag = context.getRepository(QuizzTag)
  const idsQuizzTags = (await repoQuizzTag.find({ where: { tagId: In(tags.map(x => x.id)), quizzId: quizz.id } })).map(x => x.id)
  //If there is, remove all of them
  //And add them again
  if (idsQuizzTags.length !== tags.length || tags.length === 0) {
    await repoTags.save(tags)
    await repoQuizzTag.delete({ quizzId: quizz.id })
    const quizzTag: QuizzTag[] = []
    for (const [i, tag] of tags.entries()) {
      quizzTag.push({ id: 0, order: i + 1, quizzId: quizz.id, tagId: tag.id })
    }
    await repoQuizzTag.save(quizzTag)
  }
  return res.status(200).send({ tags })
})

app.post("/api/myquizzes/:idQuizz/settings/findTags", authorize, async (req, res) => {
  const { query } = req.body
  const repoTags = context.getRepository(Tag)
  const tags = await repoTags.findBy({ name: Like(`%${query}%`) })
  return res.status(200).json(tags)
})



app.post("/api/myquizzes/create", authorize, async (req, res) => {
  const repoQuizz = context.getRepository(Quizz)
  const quizz1 = {
    id: 0,
    title: "Your Quizz",
    userId: req.user.id,
    description: "<p>Hello there!, this is your quizz!</p>",
    descriptionPlain: "Hello there!, this is your quizz!",
    imageURL: "https://wallaroo.app/images/wallpapers/019.jpg",
    topicId: 1,
    accessStatus: AccessStatus.PUBLIC,
    acceptMultipleAnswers: true,
    creationDate: new Date(Date.now()),
  }
  await repoQuizz.save(quizz1)
  return res.status(200).json(quizz1)
})

app.post("/api/myquizzes/searchTags")


