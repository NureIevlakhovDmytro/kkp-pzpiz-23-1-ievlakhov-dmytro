import { DocumentStatus } from '@app/shared';
import { StatusBadge } from './status-badge';

export function DocStatusBadge({ status, labels }: { status: DocumentStatus; labels: { posted: string; reversed: string } }) {
  return status === DocumentStatus.REVERSED
    ? <StatusBadge tone="archived">{labels.reversed}</StatusBadge>
    : <StatusBadge tone="active">{labels.posted}</StatusBadge>;
}
