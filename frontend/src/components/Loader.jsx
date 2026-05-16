import { useEffect, useState } from "react";
import { LOGO_URL } from "../lib/api";

export default function Loader() {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHide(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (hide) return null;

  return (
    <div
      data-testid="page-loader"
      className="fixed inset-0 z-[100] bg-[#fdfbf7] flex items-center justify-center transition-opacity duration-500"
    >
      <img src={LOGO_URL} alt="Shadrasa loading" className="h-28 w-auto pulse-logo" />
    </div>
  );
}
