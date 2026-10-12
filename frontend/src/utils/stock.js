export const stockLabel = (stock) => {
  if (stock <= 0) {
    return "Out of stock";
  }

  if (stock === 1) {
    return "1 unit left";
  }

  return `${stock} units left`;
};
