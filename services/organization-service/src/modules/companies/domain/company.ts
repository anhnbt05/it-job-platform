export interface CompanyPrimitives {
  id?: string;
  name: string;
  logo_url?: string;
  location: string;
  website?: string;
  size?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type NewCompanyProps = Pick<CompanyPrimitives, 'name' | 'location'> &
  Partial<Pick<CompanyPrimitives, 'logo_url' | 'website' | 'size'>>;

type UpdateCompanyProps = Partial<
  Pick<CompanyPrimitives, 'name' | 'logo_url' | 'location' | 'website' | 'size'>
>;

export class Company {
  private constructor(private props: CompanyPrimitives) {}

  static create(props: NewCompanyProps) {
    return new Company({ ...props });
  }

  static rehydrate(props: CompanyPrimitives) {
    return new Company({ ...props });
  }

  update(props: UpdateCompanyProps) {
    this.props = {
      ...this.props,
      ...props,
    };
  }

  toPrimitives(): CompanyPrimitives {
    return { ...this.props };
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get logoUrl() {
    return this.props.logo_url;
  }

  get location() {
    return this.props.location;
  }

  get website() {
    return this.props.website;
  }

  get size() {
    return this.props.size;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
