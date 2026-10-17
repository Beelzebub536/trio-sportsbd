import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma =
  process.env.NODE_ENV === "production"
    ? prismaClientSingleton()
    : (globalThis.prismaGlobal ??= prismaClientSingleton());

export default prisma;
