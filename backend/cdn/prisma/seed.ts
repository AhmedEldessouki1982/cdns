import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  for (const modelName of modelNames) {
    const model = prisma[modelName as keyof typeof prisma] as unknown as {
      deleteMany: (args?: Record<string, never>) => Promise<{ count: number }>;
    };
    try {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } catch (error) {
      console.error(`Error clearing data from ${modelName}:`, error);
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, 'seedData');

  const orderedFileNames = ['TOD.json'];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(
      fs.readFileSync(filePath, 'utf-8'),
    ) as unknown[];
    const modelName = path.basename(fileName, path.extname(fileName));
    const capitalizedModelName =
      modelName.charAt(0).toUpperCase() + modelName.slice(1);
    const model = prisma[
      capitalizedModelName as keyof typeof prisma
    ] as unknown as {
      create: (args: { data: unknown }) => Promise<unknown>;
    };

    try {
      for (const data of jsonData) {
        await model.create({ data });
      }
      console.log(`Seeded ${capitalizedModelName} with data from ${fileName}`);
    } catch (error) {
      console.error(`Error seeding data for ${capitalizedModelName}:`, error);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
