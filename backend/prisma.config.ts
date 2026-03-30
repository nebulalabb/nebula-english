import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  seed: {
    schema: 'prisma/schema.prisma',
    script: 'ts-node prisma/seed.ts',
  },
});
