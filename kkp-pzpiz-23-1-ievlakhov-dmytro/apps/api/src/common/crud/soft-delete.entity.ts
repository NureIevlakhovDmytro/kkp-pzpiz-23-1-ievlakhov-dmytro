import type { ObjectLiteral } from 'typeorm';

export interface SoftDeletable extends ObjectLiteral {
  id: string;
  isActive: boolean;
}
