export type OperatorKind = "government" | "private";

export interface OperatorContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface Operator {
  id: string;
  name: string;
  kind: OperatorKind;
  logoUrl?: string;
  contact?: OperatorContact;
  /** 0..5 average rider rating. */
  rating?: number;
}
