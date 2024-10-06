import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserResponse } from "./UserResponse";
import { Question } from "./Question";
import { User } from "./User";

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userResponseId: number;

  @ManyToOne(() => UserResponse, (userResponse) => userResponse.answers)
  userResponse?: UserResponse

  @Column()
  questionId: number;

  @ManyToOne(() => Question, (question) => question.answers)
  question?: Question

  @Column()
  answer: string

  @Column()
  answerCheckbox: boolean

  @Column()
  lastEditedAdminId?: number;

  @ManyToOne(() => User)
  lastEditedAdmin?: User
}