import "reflect-metadata"
import { DataSource } from "typeorm"
import { Book } from "./Book"
import { Cover } from "./Cover"


const AppDbContext = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "idkman",
  entities: [Book, Cover],
  synchronize: true,
  logging: true,
})

export default AppDbContext