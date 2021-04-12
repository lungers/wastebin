import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', table => {
        table.increments('id');
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.boolean('verified').notNullable().defaultTo(false);
        table.string('verification_token');
        table.timestamp('verification_expiration').nullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('users');
}

