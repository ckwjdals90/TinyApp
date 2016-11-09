function generateRandomString() {
return Math.floor(1 + Math.random() * Number.MAX_VALUE).toString(36).substring(1, 7);
}
console.log(generateRandomString());
