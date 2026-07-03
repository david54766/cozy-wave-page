import logoUrl from "@/assets/aga-logo.png";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = "size-9" }: BrandLogoProps) {
  return (
    <img
      src={logoUrl}
      alt="Alpha Gamma Alpha"
      className={`${className} object-contain`}
    />
  );
}
