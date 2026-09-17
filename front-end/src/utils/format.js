export const genreColors = ["#B07F32", "#4F7A5B", "#A8502F", "#4B6C80", "#7A5C93", "#75823F"];

export const genreColor = (idGenero) => genreColors[(idGenero - 1) % genreColors.length];

export const initials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const uid = () => Math.floor((Date.now() % 100000) + Math.random() * 1000);
