// TODO:
import passport from 'passport';
// @ts-expect-error passport-localapikey-update doesn't have typings
import { Strategy as LocalAPIKeyStrategy } from 'passport-localapikey-update';
import { Users } from './db';
import { User } from './typings/knex';

const localAPIKeyOptions = {
    apiKeyField: 'api-key',
    apiKeyHeader: 'x-api-key',
};

passport.use(
    new LocalAPIKeyStrategy(
        localAPIKeyOptions,
        async (
            apiKey: string,
            done: (error: Error | null, user?: User | false) => void,
        ) => {
            try {
                const user = await Users().where('api_key', apiKey).first();
                return done(null, user ?? false);
            } catch (error) {
                return done(error as Error);
            }
        },
    ),
);
