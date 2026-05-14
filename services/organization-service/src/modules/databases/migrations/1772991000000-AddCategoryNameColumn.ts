import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddCategoryNameColumn1772991000000 implements MigrationInterface {
  name = 'AddCategoryNameColumn1772991000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasNameColumn = await queryRunner.hasColumn('categories', 'name');

    if (!hasNameColumn) {
      await queryRunner.addColumn(
        'categories',
        new TableColumn({
          name: 'name',
          type: 'varchar',
          length: '255',
          isNullable: false,
          isUnique: true,
        }),
      );
    }

    const table = await queryRunner.getTable('categories');
    const hasNameIndex = table?.indices.some(
      (index) => index.name === 'IDX_categories_name',
    );

    if (!hasNameIndex) {
      await queryRunner.createIndex(
        'categories',
        new TableIndex({
          name: 'IDX_categories_name',
          columnNames: ['name'],
          isUnique: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('categories');
    const hasNameIndex = table?.indices.some(
      (index) => index.name === 'IDX_categories_name',
    );

    if (hasNameIndex) {
      await queryRunner.dropIndex('categories', 'IDX_categories_name');
    }

    const hasNameColumn = await queryRunner.hasColumn('categories', 'name');

    if (hasNameColumn) {
      await queryRunner.dropColumn('categories', 'name');
    }
  }
}
