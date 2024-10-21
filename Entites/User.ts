import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Language, SettingDarkMode } from "../Enums/Enums";
import { Quizz } from "./Quizz";
import { UserResponse } from "./UserResponse";


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({select: false})
  password: string;

  @Column()
  isAdmin: boolean;

  @Column()
  URLImage: string;

  @Column({
    type: 'enum',
    enum: SettingDarkMode,
    default: SettingDarkMode.AUTO
  })
  settingDarkMode: SettingDarkMode

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.ENG
  })
  preferredLanguage: Language

  @Column()
  isBlocked: boolean

  @OneToMany(() => Quizz, (quizz) => quizz.user)
  quizzes?: Quizz[]

  @OneToMany(() => UserResponse, (userResponse) => userResponse.user)
  userResponses?: UserResponse[]
}