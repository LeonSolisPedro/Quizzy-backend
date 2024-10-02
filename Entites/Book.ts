import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from "typeorm"
import { Cover } from "./Cover"

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @OneToOne(() => Cover, (cover) => cover.book, {cascade: true})
  cover: Cover
}