export default function PremiumCard({ children, className = '', elevated = false }) {
  return (
    <div
      className={`bg-white rounded-xl ${elevated ? 'card-shadow-lg' : 'card-shadow'} ${className}`}
    >
      {children}
    </div>
  );
}
