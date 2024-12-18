import "reflect-metadata"
import { DataSource } from "typeorm"
import { Question } from "./Question"
import { Quizz } from "./Quizz"
import { User } from "./User"
import { Topic } from "./Topic"
import { QuizzTag } from "./QuizzTag"
import { Tag } from "./Tag"
import { UserResponse } from "./UserResponse"
import { Answer } from "./Answer"
import { Like } from "./Like"
import { Comment } from "./Comment"
import { AllowedUser } from "./AllowedUser"

const AppDbContext = new DataSource({
  type: "sqlite",
  database: ":memory:",
  dropSchema: true,
  entities: [Question, Quizz, User, Topic, QuizzTag, Tag, UserResponse, Answer, Like, Comment, AllowedUser],
  synchronize: true,
  logging: false,
})

export default AppDbContext