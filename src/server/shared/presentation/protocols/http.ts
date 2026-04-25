import "server-only";

export interface Auth {
  userId: string;
  email: string;
}

export interface HttpRequest<TBody = unknown, TQuery = unknown, TParams = unknown> {
  body: TBody;
  query: TQuery;
  params: TParams;
  auth: Auth;
  requestId: string;
}

export interface HttpResponse<TBody = unknown> {
  statusCode: number;
  body: TBody;
}

export type Handler<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
  TOutput = unknown,
> = (req: HttpRequest<TBody, TQuery, TParams>) => Promise<HttpResponse<TOutput>>;
