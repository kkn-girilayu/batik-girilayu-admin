export const formatCurrency = (value, options, useDefaultOptions = true) => {
  if (value === 0) return 'GRATIS';

  const formatOptions = Object.assign(
    useDefaultOptions
      ? {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }
      : {},
    options
  );

  return Intl.NumberFormat('id-ID', formatOptions).format(value);
};
