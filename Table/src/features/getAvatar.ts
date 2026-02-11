// get avatar
export const getAvatar = (size: number): string => {
  const seed = Math.random().toString(36).slice(2);
  return `https://robohash.org/${seed}?size=${size}x${size}&set=set2`;
};
