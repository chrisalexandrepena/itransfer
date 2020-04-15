import {MigrationInterface, QueryRunner} from "typeorm";

export class addPathZip1586972277299 implements MigrationInterface {
    name = 'addPathZip1586972277299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "path_type_enum" AS ENUM('file', 'directory')`, undefined);
        await queryRunner.query(`CREATE TABLE "path" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "path_type_enum" NOT NULL, "path" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_adacbaf7aa6321da97e51805193" PRIMARY KEY ("id", "path"))`, undefined);
        await queryRunner.query(`CREATE TABLE "log_error" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "stack" text, "request_meta" json NOT NULL, CONSTRAINT "PK_3d94f345255e20d2be6b1dedf7e" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "zip" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_152e2076466bd9e5f354ab50aca" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TYPE "link_type_enum" AS ENUM('path', 'zip')`, undefined);
        await queryRunner.query(`CREATE TABLE "link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "link_type_enum" NOT NULL, "expiration_date" TIMESTAMP WITH TIME ZONE, "hash" character varying NOT NULL, "pathId" uuid, "pathPath" character varying, "zipId" uuid, CONSTRAINT "UQ_7ec9ae0a307e7bcb62c85e752d9" UNIQUE ("hash"), CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TYPE "event_type_enum" AS ENUM('download', 'generate_link')`, undefined);
        await queryRunner.query(`CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "event_type_enum" NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "zip_paths_path" ("zipId" uuid NOT NULL, "pathId" uuid NOT NULL, "pathPath" character varying NOT NULL, CONSTRAINT "PK_ced2bf9644ba8220300bca66f0d" PRIMARY KEY ("zipId", "pathId", "pathPath"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_3a55f48272a96cc23d5ab405aa" ON "zip_paths_path" ("zipId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_dba354149be342ad56a72be345" ON "zip_paths_path" ("pathId", "pathPath") `, undefined);
        await queryRunner.query(`ALTER TABLE "link" ADD CONSTRAINT "FK_c95c9229c5ccfbc33a2f47f7695" FOREIGN KEY ("pathId", "pathPath") REFERENCES "path"("id","path") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "link" ADD CONSTRAINT "FK_9ea5fbcdcc999738f23ac45da31" FOREIGN KEY ("zipId") REFERENCES "zip"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "zip_paths_path" ADD CONSTRAINT "FK_3a55f48272a96cc23d5ab405aa6" FOREIGN KEY ("zipId") REFERENCES "zip"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "zip_paths_path" ADD CONSTRAINT "FK_dba354149be342ad56a72be3454" FOREIGN KEY ("pathId", "pathPath") REFERENCES "path"("id","path") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "zip_paths_path" DROP CONSTRAINT "FK_dba354149be342ad56a72be3454"`, undefined);
        await queryRunner.query(`ALTER TABLE "zip_paths_path" DROP CONSTRAINT "FK_3a55f48272a96cc23d5ab405aa6"`, undefined);
        await queryRunner.query(`ALTER TABLE "link" DROP CONSTRAINT "FK_9ea5fbcdcc999738f23ac45da31"`, undefined);
        await queryRunner.query(`ALTER TABLE "link" DROP CONSTRAINT "FK_c95c9229c5ccfbc33a2f47f7695"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_dba354149be342ad56a72be345"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_3a55f48272a96cc23d5ab405aa"`, undefined);
        await queryRunner.query(`DROP TABLE "zip_paths_path"`, undefined);
        await queryRunner.query(`DROP TABLE "event"`, undefined);
        await queryRunner.query(`DROP TYPE "event_type_enum"`, undefined);
        await queryRunner.query(`DROP TABLE "link"`, undefined);
        await queryRunner.query(`DROP TYPE "link_type_enum"`, undefined);
        await queryRunner.query(`DROP TABLE "zip"`, undefined);
        await queryRunner.query(`DROP TABLE "log_error"`, undefined);
        await queryRunner.query(`DROP TABLE "path"`, undefined);
        await queryRunner.query(`DROP TYPE "path_type_enum"`, undefined);
    }

}
