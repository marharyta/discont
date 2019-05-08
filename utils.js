function detectOnlineStore(url) {
  // regex for store domains
  const asosRegex = /asos/g;
  const zalandoRegex = /zalando/g;
  const nastygalRegex = /nastygal(?=\.com)/g;
  const stockmannRegex = /zalando/g;

  // check if link is from any supported website
  const isAsos = asosRegex.test(url);
  const isZalando = zalandoRegex.test(url);
  const isNastygal = nastygalRegex.test(url);

  // throw error if cannot find any website
  if (!isAsos && !isZalando && !isNastygal) {
    return "not found";
  } else if (isAsos) {
    return "asos";
  } else if (isZalando) {
    return "zalando";
  }
}

module.exports = detectOnlineStore;
