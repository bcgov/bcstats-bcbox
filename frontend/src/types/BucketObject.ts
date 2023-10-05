import type { IAudit } from '@/interfaces';

export type BucketObject = {
  bucketId: string;
  bucketName: string;
  objectId: string;
  objectName: string;
  userId: string;
  userName: string;
  permissions: string;
} & IAudit;
