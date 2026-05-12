import type { CompanyPrimitives } from '@/modules/companies/domain/company';

export interface BranchPrimitives {
  id?: string;
  name: string;
  address: string;
  city?: string;
  country?: string;
  company: CompanyPrimitives;
  createdAt?: Date;
  updatedAt?: Date;
}

type NewBranchProps = Pick<BranchPrimitives, 'name' | 'address' | 'company'> &
  Partial<Pick<BranchPrimitives, 'city' | 'country'>>;

type UpdateBranchProps = Partial<
  Pick<BranchPrimitives, 'name' | 'address' | 'city' | 'country'>
>;

export class Branch {
  private constructor(private props: BranchPrimitives) {}

  static create(props: NewBranchProps) {
    return new Branch({ ...props });
  }

  static rehydrate(props: BranchPrimitives) {
    return new Branch({ ...props });
  }

  update(props: UpdateBranchProps) {
    this.props = {
      ...this.props,
      ...props,
    };
  }

  toPrimitives(): BranchPrimitives {
    return { ...this.props };
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get address() {
    return this.props.address;
  }

  get city() {
    return this.props.city;
  }

  get country() {
    return this.props.country;
  }

  get company() {
    return this.props.company;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
