import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabaseSchema1772987966207 implements MigrationInterface {
  name = 'InitDatabaseSchema1772987966207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "type" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_762a36a52d3233955639e53decd" UNIQUE ("title"), CONSTRAINT "UQ_aef1c7aef3725068e5540f8f00b" UNIQUE ("type"), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contents" text array NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP WITH TIME ZONE, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "notification_id" uuid, CONSTRAINT "PK_569622b0fd6e6ab3661de985a2b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" ADD CONSTRAINT "FK_944431ae979397c8b56a99bf024" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_notifications" DROP CONSTRAINT "FK_944431ae979397c8b56a99bf024"`,
    );
    await queryRunner.query(`DROP TABLE "user_notifications"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
