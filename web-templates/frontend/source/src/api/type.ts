export type ResponseError = {
  message: string;
  code: number;
};

export type TypeDTO<T> =
  | {
      data: T[];
      success: true;
    }
  | {
      data: [];
      success: false;
      error: ResponseError;
    };
