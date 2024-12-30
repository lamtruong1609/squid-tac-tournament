const GeometricShapes = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Circle */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 border-4 rounded-full border-primary/30 floating" 
           style={{ animationDelay: "0s" }} />
      
      {/* Triangle */}
      <div className="absolute top-1/3 right-1/4 w-0 h-0 floating"
           style={{ 
             animationDelay: "1s",
             borderLeft: "40px solid transparent",
             borderRight: "40px solid transparent",
             borderBottom: "80px solid rgba(74, 222, 128, 0.3)"
           }} />
      
      {/* Square */}
      <div className="absolute bottom-1/4 left-1/3 w-24 h-24 border-4 border-blue-500/30 floating"
           style={{ animationDelay: "2s" }} />
    </div>
  );
};

export default GeometricShapes;