type LogoProps = {
  size?: number;
  className?: string;
  title?: string;
};

export function Logo({ size = 28, className, title = "Theme Studio" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <rect x="2" y="10" width="16" height="16" rx="3" fill="#e4b8c6" />
      <rect x="6" y="6" width="16" height="16" rx="3" fill="#b54373" />
      <rect x="10" y="2" width="16" height="16" rx="3" fill="#8b1a4a" />
    </svg>
  );
}
