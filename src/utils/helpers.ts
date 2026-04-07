export const getProductId = (item: {
  id?: string;
  _id?: string;
  productId?: string;
}) => item.productId || item._id || item.id || '';

export const getFallbackKey = (
  item: { id?: string; _id?: string; productId?: string },
  index: number,
) => (getProductId(item) || index).toString();
