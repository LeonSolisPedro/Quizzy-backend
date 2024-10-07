import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1728263452642 implements MigrationInterface {
    name = 'Initial1728263452642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`answer\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userResponseId\` int NOT NULL,
                \`questionId\` int NOT NULL,
                \`answer\` varchar(255) NOT NULL,
                \`answerCheckbox\` tinyint NOT NULL,
                \`lastEditedAdminId\` int NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`user_response\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`responseDate\` timestamp NOT NULL,
                \`userId\` int NOT NULL,
                \`quizzId\` int NOT NULL,
                \`Score\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`isAdmin\` tinyint NOT NULL,
                \`URLImage\` varchar(255) NOT NULL,
                \`settingDarkMode\` enum ('0', '1', '2') NOT NULL DEFAULT '0',
                \`preferredLanguage\` enum ('0', '1') NOT NULL DEFAULT '0',
                \`isBlocked\` tinyint NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`topic\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`tag\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`quizz_tag\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`order\` int NOT NULL,
                \`quizzId\` int NOT NULL,
                \`tagId\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`like\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`quizzId\` int NOT NULL,
                \`puntuation\` int NOT NULL,
                \`userId\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`comment\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`quizzId\` int NOT NULL,
                \`userId\` int NOT NULL,
                \`comment\` varchar(255) NOT NULL,
                \`commentDate\` timestamp NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`allowed_user\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`quizzId\` int NOT NULL,
                \`userId\` int NOT NULL,
                \`addedDate\` timestamp NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`quizz\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`title\` varchar(255) NOT NULL,
                \`userId\` int NOT NULL,
                \`lastEditedAdminId\` int NULL,
                \`description\` varchar(255) NOT NULL,
                \`descriptionPlain\` varchar(255) NOT NULL,
                \`imageURL\` varchar(255) NOT NULL,
                \`topicId\` int NOT NULL,
                \`accessStatus\` enum ('0', '1') NOT NULL DEFAULT '0',
                \`acceptMultipleAnswers\` tinyint NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`question\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`typeOfQuestion\` enum ('0', '1', '2', '3') NOT NULL DEFAULT '0',
                \`title\` varchar(255) NOT NULL,
                \`description\` varchar(255) NOT NULL,
                \`visibleAtTable\` tinyint NOT NULL,
                \`quizzId\` int NOT NULL,
                \`lastEditedAdminId\` int NULL,
                \`order\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`answer\`
            ADD CONSTRAINT \`FK_abe61dcab080fc1966fb23a2c98\` FOREIGN KEY (\`userResponseId\`) REFERENCES \`user_response\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`answer\`
            ADD CONSTRAINT \`FK_a4013f10cd6924793fbd5f0d637\` FOREIGN KEY (\`questionId\`) REFERENCES \`question\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`answer\`
            ADD CONSTRAINT \`FK_b6fc99273ed39ddcf64a5e27d42\` FOREIGN KEY (\`lastEditedAdminId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_response\`
            ADD CONSTRAINT \`FK_285c16e9a00e07b9cc713804b49\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_response\`
            ADD CONSTRAINT \`FK_b5f0fe0120330968e5e8089e147\` FOREIGN KEY (\`quizzId\`) REFERENCES \`quizz\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`quizz_tag\`
            ADD CONSTRAINT \`FK_c6de5be784511b2491c4593a53b\` FOREIGN KEY (\`quizzId\`) REFERENCES \`quizz\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`quizz_tag\`
            ADD CONSTRAINT \`FK_78823b154200b3ab4f3046e1fee\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`like\`
            ADD CONSTRAINT \`FK_f2a53ba08aadfddceec53409d07\` FOREIGN KEY (\`quizzId\`) REFERENCES \`quizz\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`like\`
            ADD CONSTRAINT \`FK_e8fb739f08d47955a39850fac23\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\`
            ADD CONSTRAINT \`FK_93d26e94243f2c3f9f16e7e232a\` FOREIGN KEY (\`quizzId\`) REFERENCES \`quizz\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\`
            ADD CONSTRAINT \`FK_c0354a9a009d3bb45a08655ce3b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`allowed_user\`
            ADD CONSTRAINT \`FK_0ac93609e8f4deaa9b51ac993c7\` FOREIGN KEY (\`quizzId\`) REFERENCES \`quizz\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`allowed_user\`
            ADD CONSTRAINT \`FK_fb30e0762b7585abb7b63613892\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`quizz\`
            ADD CONSTRAINT \`FK_da18915d951aa8d53f4a765f1b3\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`quizz\`
            ADD CONSTRAINT \`FK_0afecc93b5bb0ff3f3cca3a6be1\` FOREIGN KEY (\`lastEditedAdminId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`quizz\`
            ADD CONSTRAINT \`FK_84da988a98d0898d9b17b1c226a\` FOREIGN KEY (\`topicId\`) REFERENCES \`topic\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`question\`
            ADD CONSTRAINT \`FK_354e21261519e8abbd5cff8b438\` FOREIGN KEY (\`quizzId\`) REFERENCES \`quizz\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`question\`
            ADD CONSTRAINT \`FK_c22efb57c1714e82b58b8effa0d\` FOREIGN KEY (\`lastEditedAdminId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`question\` DROP FOREIGN KEY \`FK_c22efb57c1714e82b58b8effa0d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`question\` DROP FOREIGN KEY \`FK_354e21261519e8abbd5cff8b438\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`quizz\` DROP FOREIGN KEY \`FK_84da988a98d0898d9b17b1c226a\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`quizz\` DROP FOREIGN KEY \`FK_0afecc93b5bb0ff3f3cca3a6be1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`quizz\` DROP FOREIGN KEY \`FK_da18915d951aa8d53f4a765f1b3\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`allowed_user\` DROP FOREIGN KEY \`FK_fb30e0762b7585abb7b63613892\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`allowed_user\` DROP FOREIGN KEY \`FK_0ac93609e8f4deaa9b51ac993c7\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_c0354a9a009d3bb45a08655ce3b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_93d26e94243f2c3f9f16e7e232a\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`like\` DROP FOREIGN KEY \`FK_e8fb739f08d47955a39850fac23\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`like\` DROP FOREIGN KEY \`FK_f2a53ba08aadfddceec53409d07\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`quizz_tag\` DROP FOREIGN KEY \`FK_78823b154200b3ab4f3046e1fee\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`quizz_tag\` DROP FOREIGN KEY \`FK_c6de5be784511b2491c4593a53b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_response\` DROP FOREIGN KEY \`FK_b5f0fe0120330968e5e8089e147\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_response\` DROP FOREIGN KEY \`FK_285c16e9a00e07b9cc713804b49\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`answer\` DROP FOREIGN KEY \`FK_b6fc99273ed39ddcf64a5e27d42\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`answer\` DROP FOREIGN KEY \`FK_a4013f10cd6924793fbd5f0d637\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`answer\` DROP FOREIGN KEY \`FK_abe61dcab080fc1966fb23a2c98\`
        `);
        await queryRunner.query(`
            DROP TABLE \`question\`
        `);
        await queryRunner.query(`
            DROP TABLE \`quizz\`
        `);
        await queryRunner.query(`
            DROP TABLE \`allowed_user\`
        `);
        await queryRunner.query(`
            DROP TABLE \`comment\`
        `);
        await queryRunner.query(`
            DROP TABLE \`like\`
        `);
        await queryRunner.query(`
            DROP TABLE \`quizz_tag\`
        `);
        await queryRunner.query(`
            DROP TABLE \`tag\`
        `);
        await queryRunner.query(`
            DROP TABLE \`topic\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user_response\`
        `);
        await queryRunner.query(`
            DROP TABLE \`answer\`
        `);
    }

}
