const listeners = new Set();

export const subscribeWishlist = (listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const notifyWishlistChanged = () => {
  listeners.forEach((listener) => listener());
};
