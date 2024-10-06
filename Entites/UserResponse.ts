import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Quizz } from "./Quizz";
import { Answer } from "./Answer";

@Entity()
export class UserResponse {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'timestamp' })
  responseDate: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.userResponses)
  user?: User

  @Column()
  quizzId: number

  @ManyToOne(() => Quizz, (quizz) => quizz.userResponses)
  quizz?: Quizz

  @Column()
  Score: number

  @OneToMany(() => Answer, (answer) => answer.userResponse)
  answers?: Answer[]
}