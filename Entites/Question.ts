import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TypeOfQuestion } from "../Enums/Enums";
import { Quizz } from "./Quizz";
import { User } from "./User";
import { Answer } from "./Answer";

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TypeOfQuestion,
    default: TypeOfQuestion.SINGLELINE
  })
  typeOfQuestion: TypeOfQuestion;

  @Column()
  title: string;

  @Column()
  description: string

  @Column()
  visiableAtTable: boolean

  @Column()
  quizzId: number;

  @ManyToOne(() => Quizz, (quizz) => quizz.questions)
  quizz?: Quizz

  @Column()
  lastEditedAdminId?: number;

  @ManyToOne(() => User)
  lastEditedAdmin?: User

  @Column()
  order: number;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers?: Answer[]
}