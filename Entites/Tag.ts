import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { QuizzTag } from "./QuizzTag";


@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string;

  @OneToMany(() => QuizzTag, quizzTag => quizzTag.tag)
  quizzTags?: QuizzTag[];
}