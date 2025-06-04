import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('passkeys', function (table) {
        table.string('id').notNullable().primary(); // Base64URLString
        table.string('name').notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.binary('public_key').notNullable(); // Uint8Array -> Buffer
        table.bigInteger('counter').notNullable();
        table.string('device_type', 32).notNullable();
        table.boolean('backed_up').notNullable();
        table.string('webauthn_user_id').notNullable(); // Base64URLString
        table.string('transports', 255).nullable(); // AuthenticatorTransportFuture[]
        table.timestamps();

        table
            .foreign('user_id')
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');

        table.index('id');
        table.index('webauthn_user_id');
        table.unique(['webauthn_user_id', 'user_id']);
    });

    await knex.schema.alterTable('users', table => {
        table.text('passkey_challenge').defaultTo(null);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', table => {
        table.dropColumn('passkey_challenge');
    });

    await knex.schema.dropTable('passkeys');
}
