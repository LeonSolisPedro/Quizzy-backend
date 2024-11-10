import { DataSource } from "typeorm";
import { User } from "./User";
import { AccessStatus, Language, SettingDarkMode, TypeOfQuestion } from "../Enums/Enums";
import { Quizz } from "./Quizz";
import { Topic } from "./Topic";
import { Tag } from "./Tag";
import { QuizzTag } from "./QuizzTag";
import { Question } from "./Question";
import bcrypt from "bcrypt"


export default abstract class AppDbSeeder {

  static async SeedAsync(context: DataSource) {
    const repoUser = context.getRepository(User)
    const count = await repoUser.count()

    if (count !== 0)
      return;

    const repoTopic = context.getRepository(Topic)
    const repoQuizz = context.getRepository(Quizz)
    const repoTag = context.getRepository(Tag)
    const repoQuizzTag = context.getRepository(QuizzTag)
    const repoQuestion = context.getRepository(Question)

    // Adding user
    const user1: User = {
      id: null,
      name: "Pedro León",
      email: "pedro@wintercr.com",
      password: await bcrypt.hash("pedro@wintercr.com", 10),
      isAdmin: true,
      URLImage: "https://cdn.pfps.gg/pfps/8302-beluga.png",
      settingDarkMode: SettingDarkMode.AUTO,
      preferredLanguage: Language.ENG,
      isBlocked: false
    }
    await repoUser.save(user1)

    //Creating topics
    const topic1: Topic = { id: null, name: "Education" }
    const topic2: Topic = { id: null, name: "Quizz" }
    const topic3: Topic = { id: null, name: "Other" }
    await repoTopic.save([topic1, topic2, topic3])

    // Adding a quizz
    const quizz1: Quizz = {
      id: null,
      title: "Test Quizz",
      userId: 0,
      user: user1,
      description: "<p>Hello there!, this is a test quizz!</p>",
      descriptionPlain: "Hello there!, this is a test quizz!",
      imageURL: "https://hagleysbeauty.com/wp-content/uploads/2023/03/test-button-1.jpg",
      topicId: 0,
      topic: topic3,
      accessStatus: AccessStatus.PUBLIC,
      acceptMultipleAnswers: true,
      creationDate: new Date(Date.now()),
    }
    await repoQuizz.save(quizz1)

    //Creating tags
    const tag1: Tag = { id: null, name: "Test" }
    const tag2: Tag = { id: null, name: "Debugging" }
    await repoTag.save([tag1, tag2])

    //Link tags with quizzes (Many-to-Many)
    const quizzTag1: QuizzTag = { id: null, quizzId: 0,quizz: quizz1, tagId: 0,tag: tag1, order: 1 };
    const quizzTag2: QuizzTag = { id: null, quizzId: 0,quizz: quizz1, tagId: 0,tag: tag2, order: 2 };
    await repoQuizzTag.save([quizzTag1, quizzTag2])

    //Creating questions
    const question1: Question =  {
      id: null,
      typeOfQuestion: TypeOfQuestion.SINGLELINE,
      title: "Question 1",
      description: "Say sunday",
      visibleAtTable: true,
      quizzId: 0,
      quizz: quizz1,
      order: 1
    }

    const question2: Question =  {
      id: null,
      typeOfQuestion: TypeOfQuestion.SINGLELINE,
      title: "Question 2",
      description: "Say monday",
      visibleAtTable: true,
      quizzId: 0,
      quizz: quizz1,
      order: 2
    }
    await repoQuestion.save([question1, question2])
  }
}