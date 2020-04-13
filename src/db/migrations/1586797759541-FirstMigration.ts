import {MigrationInterface, QueryRunner} from "typeorm";

export class FirstMigration1586797759541 implements MigrationInterface {
    name = 'FirstMigration1586797759541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "error" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "stack" text, "request_meta" json NOT NULL, CONSTRAINT "PK_cd77c9331f0ee047b819a7abad1" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "file" character varying NOT NULL, "hash" character varying NOT NULL, CONSTRAINT "UQ_7ec9ae0a307e7bcb62c85e752d9" UNIQUE ("hash"), CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TYPE "event_type_enum" AS ENUM('download', 'generate_link')`, undefined);
        await queryRunner.query(`CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "event_type_enum" NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TYPE "job_type_enum" AS ENUM('delete')`, undefined);
        await queryRunner.query(`CREATE TABLE "job" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "job_type_enum" NOT NULL, "job_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_98ab1c14ff8d1cf80d18703b92f" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "job"`, undefined);
        await queryRunner.query(`DROP TYPE "job_type_enum"`, undefined);
        await queryRunner.query(`DROP TABLE "event"`, undefined);
        await queryRunner.query(`DROP TYPE "event_type_enum"`, undefined);
        await queryRunner.query(`DROP TABLE "link"`, undefined);
        await queryRunner.query(`DROP TABLE "error"`, undefined);
    }

}
