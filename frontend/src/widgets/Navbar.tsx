export function Navbar() {
  return (
    <div className="flex flex-col bg-black w-20">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="text-amber-200">
          {i}
        </div>
      ))}
    </div>
  );
}
