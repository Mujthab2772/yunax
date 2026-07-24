export interface ProductQuery {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
}
