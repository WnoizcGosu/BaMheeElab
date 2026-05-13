import { cn } from "@/lib/utils";

interface BowlIllustrationProps {
  className?: string;
  size?: number;
  light?: boolean;
}

export default function BowlIllustration({
  className,
  size = 220,
  light = false,
}: BowlIllustrationProps) {
  const chopstickColor = light ? "#fff" : "#8B2500";
  const rimColor = light ? "rgba(255,255,255,0.9)" : "#E85820";

  return (
    <svg
      viewBox="0 0 220 180"
      width={size}
      height={(size * 180) / 220}
      className={cn("drop-shadow-xl", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Noodle bowl illustration"
      role="img"
    >
      {/* Shadow */}
      <ellipse cx="110" cy="165" rx="75" ry="10" fill="rgba(0,0,0,0.12)" />

      {/* Bowl body */}
      <path
        d="M42 95 Q42 155 110 158 Q178 155 178 95 Z"
        fill="url(#bowlGrad)"
      />

      {/* Bowl rim */}
      <ellipse cx="110" cy="95" rx="68" ry="22" fill={rimColor} />

      {/* Noodle surface */}
      <ellipse cx="110" cy="93" rx="60" ry="18" fill="#F5E6C8" />

      {/* Noodle waves */}
      <path
        d="M62 89 Q72 82 82 89 Q92 96 102 89 Q112 82 122 89 Q132 96 142 89 Q152 82 158 87"
        stroke="#C49A3C" strokeWidth="2.5" fill="none" strokeLinecap="round"
      />
      <path
        d="M60 97 Q70 90 80 97 Q90 104 100 97 Q110 90 120 97 Q130 104 140 97 Q150 90 156 95"
        stroke="#C49A3C" strokeWidth="2" fill="none" strokeLinecap="round" opacity={0.65}
      />
      <path
        d="M65 105 Q75 98 85 105 Q95 112 105 105 Q115 98 125 105 Q135 112 145 105"
        stroke="#C49A3C" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={0.4}
      />

      {/* Toppings */}
      <circle cx="88"  cy="85" r="6" fill="#4CAF50" opacity={0.85} />
      <circle cx="130" cy="83" r="5" fill="#4CAF50" opacity={0.85} />
      <circle cx="108" cy="80" r="4.5" fill="#E53935" opacity={0.9} />
      <circle cx="95"  cy="79" r="3" fill="#FF8F00" opacity={0.8} />
      <circle cx="122" cy="78" r="3.5" fill="#FF8F00" opacity={0.8} />

      {/* Chopsticks */}
      <line x1="88"  y1="28"  x2="84"  y2="93"  stroke={chopstickColor} strokeWidth="4.5" strokeLinecap="round" />
      <line x1="118" y1="18"  x2="124" y2="91"  stroke={chopstickColor} strokeWidth="4.5" strokeLinecap="round" />

      {/* Chopstick accent marks */}
      <line x1="86"  y1="30"  x2="90"  y2="30"  stroke={light ? "#F5A623" : "#F5A623"} strokeWidth="2" />
      <line x1="116" y1="20"  x2="120" y2="20"  stroke={light ? "#F5A623" : "#F5A623"} strokeWidth="2" />

      <defs>
        <radialGradient id="bowlGrad" cx="50%" cy="35%" r="55%">
          <stop offset="0%"   stopColor="#E85820" />
          <stop offset="100%" stopColor="#9B2A0A" />
        </radialGradient>
      </defs>
    </svg>
  );
}
