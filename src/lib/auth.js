import { PrismaClient } from '@/generated/prisma';
const prisma = new PrismaClient();

export async function getUserRoles(userId) {
  const roles = await prisma.model_has_roles.findMany({
    where: { model_id: BigInt(userId) },
    include: { roles: true },
  });
  return roles.map(r => r.roles.name);
}

export async function hasRole(userId, roleName) {
  const roles = await getUserRoles(userId);
  return roles.includes(roleName);
}
