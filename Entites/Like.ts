import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Quizz } from "./Quizz";
import { User } from "./User";

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  quizzId: number;

  @ManyToOne(() => Quizz, (quizz) => quizz.likes)
  quizz?: Quizz

  @Column()
  puntuation: number

  @Column()
  userId: number;

  @ManyToOne(() => User)
  user?: User
}