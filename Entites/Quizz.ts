import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Question } from "./Question";
import { Topic } from "./Topic";
import { AccessStatus } from "../Enums/Enums";
import { QuizzTag } from "./QuizzTag";
import { UserResponse } from "./UserResponse";
import { Like } from "./Like";
import { Comment } from "./Comment";
import { AllowedUser } from "./AllowedUser";

@Entity()
export class Quizz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.quizzes)
  user?: User

  @Column()
  lastEditedAdminId?: number;

  @ManyToOne(() => User)
  lastEditedAdmin?: User

  @Column()
  description: string

  @Column()
  descriptionPlain: string

  @Column()
  imageURL?: string

  @Column()
  topicId: number;

  @ManyToOne(() => Topic, (topic) => topic.quizzes)
  topic?: Topic

  @Column({
    type: 'enum',
    enum: AccessStatus,
    default: AccessStatus.PUBLIC
  })
  accessStatus: AccessStatus

  @Column()
  acceptMultipleAnswers: boolean

  @OneToMany(() => Question, (question) => question.quizz)
  questions?: Question[]

  @OneToMany(() => QuizzTag, quizzTag => quizzTag.quizz)
  quizzTags?: QuizzTag[];

  @OneToMany(() => UserResponse, (userResponse) => userResponse.quizz)
  userResponses?: UserResponse[]

  @OneToMany(() => Like, (like) => like.quizz)
  likes?: Like[]

  @OneToMany(() => Comment, (comment) => comment.quizz)
  comments?: Comment[]

  @OneToMany(() => AllowedUser, (allowedUser) => allowedUser.quizz)
  allowedUsers?: AllowedUser[]
}