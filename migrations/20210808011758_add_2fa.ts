import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('users', table => {
        table.boolean('2fa_enabled').notNullable().defaultTo(false);
        table.string('2fa_secret').nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('users', table => {
        table.dropColumn('2fa_enabled');
        table.dropColumn('2fa_secret');
    });
}
