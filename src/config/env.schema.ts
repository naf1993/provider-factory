import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum([
      'development',
      'test',
      'production',
    ])
    .default('development'),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(3000),

  RAW_MONGODB_URI: z
    .string()
    .min(1),

  DOMAIN_MONGODB_URI: z
    .string()
    .min(1),

  REDIS_HOST: z
    .string()
    .min(1),

  REDIS_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(6379),

  FACTORY_BATCH_SIZE: z.coerce
    .number()
    .int()
    .positive()
    .default(25),

  FACTORY_CONCURRENCY: z.coerce
    .number()
    .int()
    .positive()
    .default(5),
});

export type EnvironmentVariables =
  z.infer<typeof envSchema>;

export function validateEnvironment(
  config: Record<string, unknown>,
) {
  const result =
    envSchema.safeParse(config);

  if (!result.success) {
    console.error(
      result.error.flatten(),
    );

    throw new Error(
      'Invalid environment configuration',
    );
  }

  return result.data;
}