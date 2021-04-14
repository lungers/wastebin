import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('pastes', table => {
        table.increments('id');
        table.string('hash').unique().notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.text('content').notNullable();
        table.boolean('is_url').defaultTo(false);
        table.timestamps();

        table.foreign('user_id').references('id').inTable('users');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('pastes');
}
