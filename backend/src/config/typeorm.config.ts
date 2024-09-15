import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import entities from '../entities/index';

export default (): PostgresConnectionOptions => {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities,
    synchronize: true,
  };
};
