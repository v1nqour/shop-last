"use client";

import { Product } from "@/types/product.types";
import Image from "next/image";
import React, { useState } from "react";

const PhotoSection = ({ data }: { data: Product }) => {
  const [selected, setSelected] = useState<string>(data.srcUrl);

  return (
    <div className="flex flex-col-reverse lg:flex-row lg:space-x-3.5">
      {/* Thumbnails */}
      {data?.gallery && data.gallery.length > 0 && (
        <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3.5 w-full lg:w-fit items-center lg:justify-start justify-center">
          {data.gallery.map((photo, index) => (
            <button
              key={index}
              type="button"
              className="bg-[#F0EEED] rounded-[13px] xl:rounded-[20px] w-full max-w-[111px] xl:max-w-[152px] max-h-[106px] xl:max-h-[167px] xl:min-h-[167px] aspect-square overflow-hidden"
              onClick={() => setSelected(photo)}
            >
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Image
                  src={photo}
                  fill
                  className="rounded-md object-cover hover:scale-110 transition-all duration-500"
                  alt={data.title}
                  priority
                  sizes="(max-width: 768px) 100px, 150px" // Adjust based on your layout
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div
        className="flex items-center justify-center bg-[#F0EEED] rounded-[13px] sm:rounded-[20px] w-full sm:w-96 md:w-full mx-auto h-full max-h-[530px] min-h-[330px] lg:min-h-[380px] xl:min-h-[530px] overflow-hidden mb-3 lg:mb-0"
        style={{ position: "relative",width: "100%", height: "300px" }} // Ensure the parent has a defined height
      >
        <Image
          src={selected}
          fill
          className="rounded-md object-cover hover:scale-110 transition-all duration-500"
          alt={data.title}
          priority
          sizes="(max-width: 768px) 100vw, 50vw" // Adjust based on your layout
          style={{ objectFit: "cover", }}
        />
      </div>
    </div>
  );
};

export default PhotoSection;