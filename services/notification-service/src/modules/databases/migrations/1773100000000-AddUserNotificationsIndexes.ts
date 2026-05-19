import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserNotificationsIndexes1773100000000
  implements MigrationInterface
{
  name = 'AddUserNotificationsIndexes1773100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "user_notifications" WHERE "notification_id" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" ALTER COLUMN "notification_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_notifications_user_created_at" ON "user_notifications" ("user_id", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_notifications_user_is_read" ON "user_notifications" ("user_id", "is_read")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_notifications_user_is_read"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_notifications_user_created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notifications" ALTER COLUMN "notification_id" DROP NOT NULL`,
    );
  }
}
