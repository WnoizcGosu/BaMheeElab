import { cn } from "@/lib/utils";

interface WaveSectionProps {
  className?: string;
  fillColor?: string;
  bgColor?: string;
}

export default function WaveSection({
  className,
  fillColor = "#F5CBA7",
  bgColor = "#FFF9F0",
}: WaveSectionProps) {
  const encoded = encodeURIComponent(fillColor);
  return (
    <div
      className={cn("w-full overflow-hidden leading-none", className)}
      style={{ backgroundColor: bgColor }}
    >
      {/* SVG wave top (fills from above) */}
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        className="w-full h-10 block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,60 C100,20 200,45 300,28 C400,11 500,40 600,22 C700,4 800,34 900,18 C1000,2 1100,30 1200,15 L1200,60 Z"
          fill={fillColor}
          opacity={0.4}
        />
        <path
          d="M0,60 C150,35 250,50 400,38 C550,26 650,44 800,32 C950,20 1050,38 1200,26 L1200,60 Z"
          fill={fillColor}
          opacity={0.2}
        />
      </svg>

      {/* Scallop row */}
      <div
        className="w-full"
        style={{
          backgroundColor: fillColor,
          backgroundImage: `
            radial-gradient(circle at 50% 0%, ${bgColor} 62%, transparent 63%),
            radial-gradient(circle at 0%  0%, ${bgColor} 62%, transparent 63%),
            radial-gradient(circle at 100% 0%, ${bgColor} 62%, transparent 63%)
          `,
          backgroundSize: "80px 48px",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "0 0, -40px 0, 40px 0",
        }}
      />
    </div>
  );
}
