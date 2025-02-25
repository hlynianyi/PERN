import React from "react";

const Logo = ({ className = "", width, height, variant = "mobile" }) => {
  // Define size presets for different variants
  const sizePresets = {
    mobile: {
      width: "36",
      height: "42",
    },
    tablet: {
      width: "50",
      height: "60",
    },
    laptop: {
      width: "60",
      height: "68",
    },
  };

  // Use provided dimensions or get from presets
  const finalWidth = width || sizePresets[variant].width;
  const finalHeight = height || sizePresets[variant].height;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={finalWidth}
      height={finalHeight}
      style={{
        shapeRendering: "geometricPrecision",
        textRendering: "geometricPrecision",
        imageRendering: "optimizeQuality",
        fillRule: "evenodd",
        clipRule: "evenodd",
      }}
      viewBox="0 0 90.058 108"
      className={className}
    >
      {/* Основной контур - использует вторичный цвет в светлой теме и белый в темной */}
      <path
        className="fill-current text-secondary-foreground/80 dark:text-primary transition-colors duration-200"
        d="M-0.058 -0.058h91.058v19.322a71.736 71.736 0 0 1 -4.223 4.165 0.281 0.281 0 0 0 -0.058 0.231q-0.263 0.002 -0.405 0.231 -0.145 32.194 0.058 64.331a130.86 130.86 0 0 0 4.628 4.628v19.091H-0.058v-19.091a70.347 70.347 0 0 0 4.744 -4.86q0.058 -32.079 -0.116 -64.099 -2.256 -2.372 -4.628 -4.628z"
      />

      {/* Верхняя часть - белая в светлой теме, черная в темной */}
      <path
        className="fill-current text-background dark:text-foreground transition-colors duration-200"
        d="M56.752 12.091q-0.055 8.793 -0.116 17.587v5.901q2.198 0.084 4.397 0.174 2.008 0.594 2.198 2.719 -0.24 2.117 -2.198 2.835 -12.902 0.034 -25.802 -0.231 -3.035 -1.299 -1.678 -4.339 0.521 -0.708 1.331 -1.041a67.686 67.686 0 0 1 5.322 -0.116q0.204 0.038 0.347 -0.116 -3.199 -9.357 -0.058 -18.744 1.458 -4.001 4.57 -6.884a18.05 18.05 0 0 1 2.198 -1.157q2.95 -0.116 5.901 0 1.785 0.13 2.95 1.446 0.545 0.912 0.636 1.967"
      />

      {/* Боковые элементы */}
      <path
        className="fill-current text-background dark:text-background transition-colors duration-200"
        d="M-0.058 19.264q2.372 2.256 4.628 4.628 0.037 0.285 -0.116 0.521 0.116 31.806 0.231 63.579a70.347 70.347 0 0 1 -4.744 4.86z"
      />
      <path
        className="fill-current text-background dark:text-background transition-colors duration-200"
        d="M91 19.264v73.587a130.86 130.86 0 0 1 -4.628 -4.628q-0.029 -32.107 0.058 -64.215a1.215 1.215 0 0 0 0.289 -0.347 0.281 0.281 0 0 1 0.058 -0.231 71.736 71.736 0 0 0 4.223 -4.165"
      />

      {/* Нижнее лезвие - белое в обеих темах */}
      <path
        className="fill-current text-background dark:text-foreground transition-colors duration-200"
        d="M39.281 45.529q9.663 0.067 19.322 0.231 -0.098 3.817 -0.116 7.636v1.041q-1.882 -0.057 -3.702 0.116 -1.43 0.371 -1.215 1.851 0.381 0.438 0.752 0.868a19.496 19.496 0 0 0 3.587 0.174q0.185 0.162 0.463 0.116v4.975q-1.968 -0.029 -3.934 0.058 -1.398 0.766 -0.752 2.256a2.175 2.175 0 0 0 0.636 0.521q2.024 0.087 4.05 0.058v5.207q-2.083 -0.029 -4.165 0.058 -1.489 0.962 -0.463 2.372a2.002 2.002 0 0 0 0.81 0.405q1.85 0.087 3.702 0.058a1489.788 1489.788 0 0 1 -0.231 15.388q-4.04 4.245 -5.843 9.835a64.909 64.909 0 0 1 -0.926 3.702 63.289 63.289 0 0 1 -0.174 3.818 14.81 14.81 0 0 1 -2.488 -2.43q-4.063 -5.115 -6.711 -11.107 -4.359 -10.301 -5.901 -21.405a111.422 111.422 0 0 1 -0.983 -17.298 126.463 126.463 0 0 1 0.231 -8.388 36.562 36.562 0 0 1 4.05 -0.116"
      />

      {/* Внутренняя часть лезвия - черная в светлой теме, основной цвет в темной */}
      <path
        className="fill-current text-foreground dark:text-primary transition-colors duration-200"
        d="M38.008 48.306h5.438a952.233 952.233 0 0 0 -0.058 24.529q0.223 9.293 2.314 18.281a216.943 216.943 0 0 1 1.388 4.744 46.165 46.165 0 0 0 1.504 3.355q0.116 0.174 0 0.347 -2.771 -4.268 -4.628 -9.025 -3.448 -10.112 -4.744 -20.711l-0.926 -10.645a789.786 789.786 0 0 1 -0.289 -10.876"
      />
    </svg>
  );
};

export default Logo;
