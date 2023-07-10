export class Query {
  static getLimitAndOffset(
    query: any,
    maxLimit?: number,
  ): { limit: number; offset: number } {
    if (!maxLimit) {
      maxLimit = 20;
    }
    let limit = 20;
    let offset = 0;
    if (query) {
      if (query.limit) {
        limit = parseInt(query.limit);
        if (isNaN(limit) || limit > maxLimit) {
          limit = maxLimit;
        }
        offset = parseInt(query.offset);
        if (isNaN(offset)) {
          offset = 0;
        }
      }
    }
    return {
      limit,
      offset,
    };
  }
}
