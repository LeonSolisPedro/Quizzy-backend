import { EntitySchema } from "typeorm";

export const Book = new EntitySchema({
  name: "Book",
  columns: {
      id: {
          primary: true,
          type: "int",
          generated: true,
      },
      name: {
          type: "varchar",
      },
  },
})