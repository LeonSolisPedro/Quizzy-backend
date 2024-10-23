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
import { Initial1729465384528 } from "./Migrations/1729465384528-Initial"

const AppDbContext = new DataSource({
  type: "mysql",
  host: process.env.HOSTMYSQL ?? "localhost",
  port: 3306,
  username: process.env.USERMYSQL ?? "root",
  password: process.env.PASSWORD ?? "",
  database: process.env.DATABASE ?? "quizzy",
  entities: [Question, Quizz, User, Topic, QuizzTag, Tag, UserResponse, Answer, Like, Comment, AllowedUser],
  synchronize: false,
  logging: false,
  migrations: [Initial1729465384528],
})

export default AppDbContext