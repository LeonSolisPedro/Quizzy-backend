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

    const topics = [
      { name: "Education" },
      { name: "Quizz" },
      { name: "Other" }
  ].map((topic) => ({ id: null, ...topic }));
  await repoTopic.save(topics);

  // Quiz data
  const quizzes = [
    {
      title: "English Test",
      userId: 0,
      user: user1,
      description: "<p>Test your levels of English by responding to these questions!</p>",
      descriptionPlain: "Test your levels of English by responding to these questions!",
      imageURL: "https://i.ibb.co/TwYM2Pg/b1bea55e3325.png",
      topic: topics.find(t => t.name === "Education"),
      tags: ["English"],
      acceptMultipleAnswers: true,
      questions: [
          { visibleAtTable: true, typeOfQuestion: TypeOfQuestion.SINGLELINE, title: "What is the past tense of the verb \"go\"?", description: "", order: 1 },
          { visibleAtTable: true, typeOfQuestion: TypeOfQuestion.MULTILINE, title: "Describe your daily routine in 3-5 sentences", description: "", order: 2 },
          { visibleAtTable: true, typeOfQuestion: TypeOfQuestion.INTEGER, title: "How many vowels are there in the English alphabet?", description: "", order: 3 },
          { visibleAtTable: false, typeOfQuestion: TypeOfQuestion.YESNO, title: "Have you ever traveled to an English-speaking country?", description: "", order: 4 }
      ]
  },
  {
      title: "Quizz that you have to complete because you are an intern",
      userId: 0,
      user: user1,
      description: "<p>Hello! this quizz is to get an average of how many finish the course successfully</p> <p>Have fun!</p>",
      descriptionPlain: "Hello! this quizz is to get an average of how many finish the course successfully Have fun!",
      imageURL: "https://i.ibb.co/vJzYw1s/6af6d97163a5.jpg",
      topic: topics.find(t => t.name === "Quizz"),
      tags: ["Funny", "iTransition"],
      acceptMultipleAnswers: false,
      questions: [
          { visibleAtTable: true, typeOfQuestion: TypeOfQuestion.YESNO, title: "Did you finish Task6?", description: "Be honest", order: 1 },
          { visibleAtTable: true, typeOfQuestion: TypeOfQuestion.INTEGER, title: "Rate difficulty", description: "From 1 (easy) to 10 (hard)", order: 2 },
          { visibleAtTable: true, typeOfQuestion: TypeOfQuestion.SINGLELINE, title: "What is your group", description: "NET or JavaScript?", order: 3 },
          { visibleAtTable: false, typeOfQuestion: TypeOfQuestion.YESNO, title: "Did you enjoy the course?", description: "Be honest", order: 4 }
      ]
  },
  {
      title: "Quizz about loving earth",
      userId: 0,
      user: user1,
      description: "<p>This quizz is to see if you love your beautiful blue planet</p> <p><em>\"We still do not know one thousandth of one percent of what nature has revealed to us\"</em></p> <p> - Albert Einstein</p>",
      descriptionPlain: "This quizz is to see if you love your beautiful blue planet",
      imageURL: "https://i.ibb.co/0GGBjHK/ced492e52b20.jpg",
      topic: topics.find(t => t.name === "Quizz"),
      tags: ["Love", "Funny"],
      acceptMultipleAnswers: true,
      questions: [
          { visibleAtTable: true, typeOfQuestion: TypeOfQuestion.YESNO, title: "Do you believe the planet is flat?", description: "Please be honest", order: 1 },
          { visibleAtTable: true, typeOfQuestion: TypeOfQuestion.INTEGER, title: "How many plants have you planted in the last year?", description: "Insert the number", order: 2 },
          { visibleAtTable: true, typeOfQuestion: TypeOfQuestion.YESNO, title: "Do you use public transportation or walk when possible?", description: "", order: 3 },
          { visibleAtTable: false, typeOfQuestion: TypeOfQuestion.MULTILINE, title: "What can you do to reduce water and carbon emissions?", description: "Describe the activities", order: 4 },
          { visibleAtTable: false, typeOfQuestion: TypeOfQuestion.YESNO, title: "Have you done half of these activities?", description: "Please be honest", order: 5 }
      ]
  },
  {
      title: "Let's confuse the AI!",
      userId: 0,
      user: user1,
      description: "<p>Hi! Let's confuse the AI by asking these tricky questions!</p> <p>Open your favorite AI and ask these questions!</p>",
      descriptionPlain: "Hi! Let's confuse the AI by asking these tricky questions! Open your favorite AI and ask these questions!",
      imageURL: "https://i.ibb.co/z2pvhKV/da08d1056ba2.jpg",
      topic: topics.find(t => t.name === "Education"),
      tags: ["Funny", "iA"],
      acceptMultipleAnswers: true,
      questions: [
          { visibleAtTable: true, typeOfQuestion: TypeOfQuestion.SINGLELINE, title: "How many Rs are the in the word strawberry?", description: "", order: 1 },
          { visibleAtTable: true, typeOfQuestion: TypeOfQuestion.SINGLELINE, title: "Which is bigger 9.11 or 9.9?", description: "", order: 2 }
      ]
  },
  ];

  for (const quizData of quizzes) {
      // Save the quiz
      const quizz = await repoQuizz.save({
          ...quizData,
          id: null,
          topicId: quizData.topic.id,
          creationDate: new Date()
      });

      // Save tags
      const tags = quizData.tags.map(tagName => ({ id: null, name: tagName }));
      const savedTags = await repoTag.save(tags);

      // Link tags with the quiz
      const quizzTags = savedTags.map((tag, index) => ({
          id: null,
          quizzId: quizz.id,
          quizz: quizz,
          tagId: tag.id,
          tag: tag,
          order: index + 1
      }));
      await repoQuizzTag.save(quizzTags);

      // Save questions
      const questions = quizData.questions.map((questionData, index) => ({
          id: null,
          quizzId: quizz.id,
          quizz: quizz,
          ...questionData,
          order: index + 1
      }));
      await repoQuestion.save(questions);
  }

  }
}