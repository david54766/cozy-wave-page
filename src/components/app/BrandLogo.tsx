import logoAsset from "@/assets/aga-logo.png.asset.json";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = "size-9" }: BrandLogoProps) {
  return (
    <img
      src={logoAsset.url}
      alt="Alpha Gamma Alpha"
      className={`${className} object-contain`}
    />
  );
}
