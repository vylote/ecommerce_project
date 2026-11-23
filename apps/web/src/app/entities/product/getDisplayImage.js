export default function getDisplayImage(product) {
  const images = product?.images;
  if (!images?.length) return null;
  return (images.find((image) => image.isPrimary) ?? images[0]).url;
}
