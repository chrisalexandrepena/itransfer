import { MigrationInterface, QueryRunner } from 'typeorm';

export class firstMigration1586881200753 implements MigrationInterface {
  name = 'firstMigration1586881200753';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "file" character varying NOT NULL, "expiration_date" TIMESTAMP WITH TIME ZONE, "hash" character varying NOT NULL, CONSTRAINT "UQ_7ec9ae0a307e7bcb62c85e752d9" UNIQUE ("hash"), CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(`CREATE TYPE "event_type_enum" AS ENUM('download', 'generate_link')`, undefined);
    await queryRunner.query(
      `CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "event_type_enum" NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "log_error" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "stack" text, "request_meta" json NOT NULL, CONSTRAINT "PK_3d94f345255e20d2be6b1dedf7e" PRIMARY KEY ("id"))`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "log_error"`, undefined);
    await queryRunner.query(`DROP TABLE "event"`, undefined);
    await queryRunner.query(`DROP TYPE "event_type_enum"`, undefined);
    await queryRunner.query(`DROP TABLE "link"`, undefined);
  }
}
