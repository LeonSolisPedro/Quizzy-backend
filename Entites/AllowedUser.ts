import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Quizz } from "./Quizz";
import { User } from "./User";

@Entity()
export class AllowedUser {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  quizzId: number;

  @ManyToOne(() => Quizz, (quizz) => quizz.allowedUsers)
  quizz?: Quizz

  @Column()
  userId: number;

  @ManyToOne(() => User)
  user?: User

  @Column({ type: 'datetime' })
  addedDate: Date;
}