import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Quizz } from "./Quizz";
import { User } from "./User";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  quizzId: number;

  @ManyToOne(() => Quizz, (quizz) => quizz.comments)
  quizz?: Quizz

  @Column()
  userId: number;

  @ManyToOne(() => User)
  user?: User

  @Column()
  comment: string

  @Column({ type: 'timestamp' })
  commentDate: Date;
}