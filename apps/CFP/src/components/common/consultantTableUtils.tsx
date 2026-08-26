import React from 'react';
import FontAwesome from '@packages/components/FontAwsome';
import { ConsultantRow } from '@/types/consultant';

export function isAccreditedConsultant(value: ConsultantRow['isAccredited']) {
  return value === true || value === 1 || String(value).toLowerCase() === 'true';
}

export function renderConsultantRating(value: ConsultantRow['customerRating']) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return '-';

  return (
    <span className="d-inline-flex align-items-center gap-1">
      <span>{rating.toFixed(1)}</span>
      <FontAwesome icon="fa-solid fa-star" className="text-warning" />
    </span>
  );
}

export function renderConsultantCount(value: number | null | undefined) {
  return value == null ? '-' : `${value}+`;
}
