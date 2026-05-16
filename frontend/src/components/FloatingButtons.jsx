import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { buildWhatsappFromNumber } from "../lib/siteData";

export default function FloatingButtons({ content = {} }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wa = content.whatsapp_number || "917338542117";

  return (
    <>
      <a
        href={buildWhatsappFromNumber(wa, "Hi Shadrasa, I'd like to place an order!")}
        target="_blank"
        rel="noreferrer"
        data-testid="floating-whatsapp"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white flex items-center justify-center shadow-2xl float-y transition-all hover:scale-110"
        aria-label="WhatsApp Order"
      >
        <MessageCircle size={26} fill="currentColor" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#d4a017] ring-2 ring-white" />
      </a>

      {show && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          data-testid="scroll-top-btn"
          className="fixed bottom-6 left-6 z-40 h-12 w-12 rounded-full bg-[#0f4d2e] hover:bg-[#d4a017] text-white flex items-center justify-center shadow-xl transition-all"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
}
