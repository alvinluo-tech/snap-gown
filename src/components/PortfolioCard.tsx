import Image from 'next/image';

interface PortfolioCardProps {
  src: string;
  alt: string;
}

export function PortfolioCard({ src, alt }: PortfolioCardProps) {
  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
        className="object-cover transition-transform duration-300 hover:scale-105"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      />
    </div>
  );
}
