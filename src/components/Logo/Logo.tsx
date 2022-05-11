import React from "react";

const Logo: React.FC<{ className?: string }> = ({ className, ...rest }) => {
   return (
      <img src="/logo.png" className={`rounded-full ${className}`} {...rest} />
   );
};

export default Logo;
