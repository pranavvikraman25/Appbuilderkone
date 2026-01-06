export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="size-full bg-[#005EB8] flex items-center justify-center">
      {/* KONE Logo - Four rectangles with letters */}
      <div className="flex gap-2">
        {['K', 'O', 'N', 'E'].map((letter, index) => (
          <div
            key={letter}
            className="w-12 h-16 border-2 border-white flex items-center justify-center text-white opacity-0 animate-fade-in"
            style={{
              animationDelay: `${index * 200}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <span className="text-2xl">{letter}</span>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
