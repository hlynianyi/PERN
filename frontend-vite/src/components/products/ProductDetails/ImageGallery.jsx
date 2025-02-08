// components/products/ProductDetails/ImageGallery.jsx
export const ImageGallery = ({ images, selectedImage, setSelectedImage }) => {
  return (
    <div className="space-y-4 flex">
      {selectedImage && (
        <img
          src={`http://localhost:5002${selectedImage.image_url}`}
          alt="Product"
          className="w-full h-[400px] object-contain rounded-md"
        />
      )}
      <div className="flex flex-col gap-2">
        {images?.map((image) => (
          <img
            key={image.id}
            src={`http://localhost:5002${image.image_url}`}
            alt="Product thumbnail"
            className={`cursor-pointer rounded-md h-[100px] object-contain 
                ${
                  selectedImage?.id === image.id ? "opacity-100" : "opacity-60"
                }`}
            onClick={() => setSelectedImage(image)}
          />
        ))}
      </div>
    </div>
  );
};
