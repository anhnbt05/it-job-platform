export interface CategoryPrimitives {
  id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type NewCategoryProps = Pick<CategoryPrimitives, 'name'>;
type UpdateCategoryProps = Partial<Pick<CategoryPrimitives, 'name'>>;

export class Category {
  private constructor(private props: CategoryPrimitives) {}

  static create(props: NewCategoryProps) {
    return new Category({ ...props });
  }

  static rehydrate(props: CategoryPrimitives) {
    return new Category({ ...props });
  }

  update(props: UpdateCategoryProps) {
    this.props = {
      ...this.props,
      ...props,
    };
  }

  toPrimitives(): CategoryPrimitives {
    return { ...this.props };
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
