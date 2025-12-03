import Image from 'next/image';

interface NeonImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export const NeonImage = ({ src, alt, width, height, priority, className = '' }: NeonImageProps) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Multiple glow layers for neon effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
      <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>

      {/* Image with neon border */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Neon border effect */}
        <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-pulse">
          <div className="w-full h-full bg-gray-950 rounded-2xl"></div>
        </div>

        {/* Image container */}
        <div className="relative rounded-2xl overflow-hidden m-[2px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 mix-blend-overlay"></div>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto object-cover"
            priority={priority}
          />
        </div>
      </div>
    </div>
  );
};