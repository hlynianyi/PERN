// // components/products/ProductDetails/ImageGallery.jsx
// export const ImageGallery = ({ images, selectedImage, setSelectedImage }) => {
//   return (
//     <div className="space-y-4 flex">
//       {selectedImage && (
//         <img
//           src={`http://localhost:5002${selectedImage.image_url}`}
//           alt="Product"
//           className="w-full h-[400px] object-contain rounded-md"
//         />
//       )}
//       <div className="flex flex-col gap-2">
//         {images?.map((image) => (
//           <img
//             key={image.id}
//             src={`http://localhost:5002${image.image_url}`}
//             alt="Product thumbnail"
//             className={`cursor-pointer rounded-md h-[100px] object-contain
//                 ${
//                   selectedImage?.id === image.id ? "opacity-100" : "opacity-60"
//                 }`}
//             onClick={() => setSelectedImage(image)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };
import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ImageGallery = ({
  images,
  selectedImage,
  setSelectedImage,
  product,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Mobile Carousel View
  const MobileGallery = () => (
    <div className="relative w-full tablet:hidden">
      <Carousel className="w-full">
        <CarouselContent>
          {images?.map((image) => (
            <CarouselItem key={image.id}>
              <div className="relative aspect-square w-full bg-background">
                <div className="flex items-center absolute top-2 left-2">
                  {product.is_new && (
                    <Badge
                      className="text-base laptop:text-lg px-4"
                      variant="destructive"
                    >
                      Новинка
                    </Badge>
                  )}
                </div>
                <img
                  src={`http://localhost:5002${image.image_url}`}
                  alt="Product"
                  className="h-full w-full object-contain rounded-lg dark:mix-blend-normal mix-blend-multiply"
                  onClick={() => setSelectedImage(image)}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
          <CarouselPrevious className="relative pointer-events-auto left-2 top-2" />
          <CarouselNext className="relative pointer-events-auto right-2 top-2" />
        </div>
      </Carousel>
    </div>
  );

  // Tablet and Desktop View
  const DesktopGallery = () => (
    <div className="hidden tablet:flex tablet:flex-col tablet:space-y-4 max-w-[580px] tablet:max-w-[340px] tablet:justify-between p-4">
      {/* Large Preview Image */}
      <div className="w-full h-full items-center tablet:flex tablet:justify-center laptop:justify-start bg-background ">
        {selectedImage && (
          <div className="relative">
            <img
              src={`http://localhost:5002${selectedImage.image_url}`}
              alt="Selected product"
              className="w-full max-w-[580px] object-contain rounded-lg cursor-zoom-in dark:mix-blend-normal mix-blend-multiply"
              onClick={() => setIsModalOpen(true)}
            />
            <div className="flex items-center absolute -top-0 -left-4">
                  {product.is_new && (
                    <Badge
                      className="text-base laptop:text-lg px-4"
                      variant="destructive"
                    >
                      Новинка
                    </Badge>
                  )}
                </div>
          </div>
        )}
      </div>

      {/* Thumbnail Carousel */}
      <Carousel
        className="w-full max-w-xl mx-auto  p-2 rounded-lg"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 ">
          {images?.map((image) => (
            <CarouselItem
              key={image.id}
              className="pl-2 basis-1/6 cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div
                className={`bg-background relative aspect-square rounded-md overflow-hidden ${
                  selectedImage?.id === image.id
                    ? "border-2 border-red-500"
                    : "opacity-70 hover:opacity-100 transition-opacity"
                }`}
              >
                <img
                  src={`http://localhost:5002${image.image_url}`}
                  alt="Product thumbnail"
                  className="h-full w-full object-cover dark:mix-blend-normal mix-blend-multiply"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <CarouselPrevious /> */}
        {/* <CarouselNext /> */}
      </Carousel>
    </div>
  );

  // Modal for Large Image View
  const ImageModal = () => (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-[600px] max-h-[600px] p-0">
        <DialogClose className="absolute right-4 top-4 z-10">
          {/* <X className="h-6 w-6 text-white hover:text-red-500 transition-colors" /> */}
        </DialogClose>
        <div className="flex items-center absolute top-2 left-2">
          {product.is_new && (
            <Badge
              className="text-base laptop:text-lg px-4"
              variant="destructive"
            >
              Новинка
            </Badge>
          )}
        </div>
        <img
          src={`http://localhost:5002${selectedImage?.image_url}`}
          alt="Увеличенное изображение"
          className="w-full h-full object-contain"
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <MobileGallery />
      <DesktopGallery />
      <ImageModal />
    </>
  );
};
