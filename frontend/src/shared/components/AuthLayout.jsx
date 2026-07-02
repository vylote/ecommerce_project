export default function AuthLayout({ children, bgImage }) {
  const defaultBg = "/auth-bg.jpg"; 
  const finalBg = bgImage || defaultBg;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${finalBg}')` }}
      />

      <div className="absolute inset-0 bg-neutral/60 backdrop-blur-sm" />

      <div className="pointer-events-none absolute -top-24 -left-24 h-[26rem] w-[26rem] rounded-full bg-primary/30 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-[26rem] w-[26rem] rounded-full bg-secondary/25 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-accent/20 blur-[90px]" />

      <div className="relative card w-full max-w-md bg-base-100 shadow-2xl shadow-black/20 overflow-hidden my-8">
        <div className="h-1.5 w-full bg-primary" />
        {children}
      </div>
    </div>
  );
}