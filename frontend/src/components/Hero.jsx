function Hero() {
  return (
    <header className="hero flex flex-col items-center justify-center p-4 bg-green-600">
      <img
        src="images/utility/logo.png"
        alt="GreenUp Restaurant"
        className="w-auto h-32"
      />
      <h1>Seasonal Menu</h1>
      <p className="subtitle">
        Sourced locally, crafted daily. Explore what the kitchen is plating
        today.
      </p>
    </header>
  );
}

export default Hero;
