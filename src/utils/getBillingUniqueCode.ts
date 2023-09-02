const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getBillingUniqueCode = (total: number) => {
  if (total < 100) return total + getRandomNumber(1, 100);
  let lastThreeDigit = 0;
  let totalTem = total
  for (let i = 0; i < 3; i++) {
    const lastDigit = total % 10;
    totalTem = totalTem /= 10;
    lastThreeDigit += lastDigit * Math.pow(10, i);
  }
  const remainder = 999 - lastThreeDigit;
  const randomNumber = getRandomNumber(
    lastThreeDigit,
    Math.min(remainder, 500)
  );

  return randomNumber;
};
