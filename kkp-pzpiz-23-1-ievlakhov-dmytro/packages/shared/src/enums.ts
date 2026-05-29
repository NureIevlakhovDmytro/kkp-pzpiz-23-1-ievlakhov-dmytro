export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum Locale {
  UK = 'uk',
  EN = 'en',
}

/** Stable application error codes (see spec §0 "Коды ошибок"). */
export enum ErrorCode {
  VALIDATION = 'VALIDATION',         // 400
  UNAUTHORIZED = 'UNAUTHORIZED',     // 401
  FORBIDDEN = 'FORBIDDEN',           // 403
  NOT_FOUND = 'NOT_FOUND',           // 404
  CONFLICT = 'CONFLICT',             // 409
  BUSINESS_RULE = 'BUSINESS_RULE',   // 422
  INTERNAL = 'INTERNAL',             // 500
}
