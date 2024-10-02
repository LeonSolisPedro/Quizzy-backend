import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Book } from "./Book";

@Entity()
export class Cover {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  synopsis: string;

  @Column()
  bookId: number;

  @OneToOne(() => Book, (book) => book.cover)
  @JoinColumn()
  book: Book
}