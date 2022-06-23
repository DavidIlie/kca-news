import React from "react";
import Image from "next/image";
import { shimmer } from "@/lib/shimmer";

const Logo: React.FC<{ className?: string }> = ({ className, ...rest }) => {
   return (
      <Image
         height={100}
         width={100}
         src="/logo.png"
         placeholder="blur"
         blurDataURL={shimmer(1920, 1080)}
         className={`rounded-full ${className}`}
         {...rest}
      />
   );
};

export default Logo;
