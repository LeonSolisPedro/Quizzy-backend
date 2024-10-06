import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Quizz } from "./Quizz";

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @ManyToOne(() => User)
  user?: User

  @Column()
  name: string

  @OneToMany(() => Quizz, (quizz) => quizz.topic)
  quizzes?: Quizz[]
}