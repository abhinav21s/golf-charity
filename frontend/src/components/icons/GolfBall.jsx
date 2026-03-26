/**
 * Golf Ball Icon Component
 * Custom SVG icon representing a golf ball with dimple pattern
 */

const GolfBall = ({ className = "w-6 h-6", ...props }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      {/* Main circle */}
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      
      {/* Dimple pattern - simplified for clarity at various sizes */}
      <circle cx="12" cy="8" r="1.2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="8.5" cy="10" r="1.2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="15.5" cy="10" r="1.2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="10" cy="12.5" r="1.2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="14" cy="12.5" r="1.2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
};

export default GolfBall;
