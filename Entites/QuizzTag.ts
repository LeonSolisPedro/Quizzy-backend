import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Quizz } from "./Quizz";
import { Tag } from "./Tag";


@Entity()
export class QuizzTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order: number;

  @Column()
  quizzId: number;

  @ManyToOne(() => Quizz, (quizz) => quizz.quizzTags)
  quizz?: Quizz

  @Column()
  tagId: number;

  @ManyToOne(() => Tag, (tag) => tag.quizzTags)
  tag?: Tag
}