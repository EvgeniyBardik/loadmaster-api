import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SequelizeModule } from '@nestjs/sequelize';
import { join } from 'path';
import GraphQLJSON from 'graphql-type-json';

// Modules
import { LoadTestModule } from './load-test/load-test.module';
import { MetricsModule } from './metrics/metrics.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      context: ({ req, res }) => ({ req, res }),
      resolvers: { JSON: GraphQLJSON },
    }),

    // Database
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadModels: true,
        synchronize: true, // Set to false in production
        logging: false,
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    LoadTestModule,
    MetricsModule,
    RabbitMQModule,
  ],
})
export class AppModule {}

