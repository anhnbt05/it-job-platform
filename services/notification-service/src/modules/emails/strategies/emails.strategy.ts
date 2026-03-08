export interface EmailStrategy<T = any> {
  build(
    to: string,
    payload: T,
  ): {
    subject: string;
    text: string;
    html: string;
  };
}
