// src/providers/talabat/talabat.mapping.ts



export function toNumber(
  value:
    | number
    | string
    | null
    | undefined,
): number | undefined {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return undefined;
  }

  const result =
    Number(value);

  if (
    !Number.isFinite(result)
  ) {
    return undefined;
  }

  return result;
}

export function toRequiredNumber(
  value:
    | number
    | string,
  fieldName: string,
): number {
  const result =
    Number(value);

  if (
    !Number.isFinite(
      result,
    )
  ) {
    throw new Error(
      `${fieldName} must be numeric`,
    );
  }

  return result;
}



export function normalizeText(
  value:
    | string
    | null
    | undefined,
): string | undefined {
  if (
    value === null ||
    value === undefined
  ) {
    return undefined;
  }

  const normalized =
    value.trim();

  return normalized.length
    ? normalized
    : undefined;
}