import { DataSource } from "typeorm";
import { User } from "./User";


export default abstract class AppDbSeeder {

  static async SeedAsync(context: DataSource) {
    const userRepo = context.getRepository(User)
    const users = await userRepo.find()

    if(users.length !== 0)
      return;

    //You need to seed the database
    // const user: User = {

    // }


  }
}