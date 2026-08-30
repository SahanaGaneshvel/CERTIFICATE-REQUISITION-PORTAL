import { prisma } from './prisma';

export async function logAudit(actorId: string, action: string, entity: string, entityId: string, detail?: string) {
  await prisma.auditLog.create({
    data: { actorId, action, entity, entityId, detail },
  });
}
