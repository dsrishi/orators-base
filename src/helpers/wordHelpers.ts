// function to make the first character of a string to capital
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}