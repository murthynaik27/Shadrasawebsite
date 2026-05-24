import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, ShoppingBag, MessageCircle, Phone } from "lucide-react";
import Navbar from "../components/Navbar";
import { apiClient } from "../lib/api";
import { formatPrice } from "../lib/admin";
import { useSiteData, buildWhatsappFromNumber } from "../lib/siteData";

export default function OrderSuccess() {
  const { orderNo } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState(null);
  const { content } = useSiteData();
  const wa = content.whatsapp_number || "917338542117";
  const phone = content.contact_phone || "+91 7338542117";

  useEffect(() => {
    apiClient
      .get(`/orders/${orderNo}`)
      .then((r) => setOrder(r.data))
      .catch((e) => setErr(e.response?.data?.detail || "Order not found"));
  }, [orderNo]);

  return (
    <div className="min-h-screen bg-[#fdfbf7]" data-testid="order-success-page">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white border border-[#6b3e1f]/10 p-8 md:p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="mx-auto h-20 w-20 rounded-full bg-[#0f4d2e]/10 flex items-center justify-center mb-6">
              <CheckCircle2 size={42} className="text-[#0f4d2e]" />
            </div>
            <p className="divider-ornament mb-4">Order Confirmed</p>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-[#0a331e] mb-3">
              Thank you for your <span className="italic text-[#d4a017]">order!</span>
            </h1>
            <p className="text-[#6b3e1f] mb-2">Your order number is</p>
            <p className="font-display text-2xl font-bold text-[#0f4d2e] mb-8" data-testid="order-no">{orderNo}</p>

            {err && <p className="text-sm text-red-600 mb-6">{err}</p>}

            {order && (
              <div className="text-left bg-[#fdfbf7] rounded-2xl p-6 mb-6">
                <h2 className="font-display text-lg font-semibold text-[#0a331e] mb-4">Order Details</h2>
                <ul className="space-y-2 text-sm">
                  {order.items?.map((i, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span className="text-[#4a453f]">{i.name} × {i.quantity}</span>
                      <span className="font-semibold text-[#0a331e]">{formatPrice(i.line_total)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-[#6b3e1f]/10 mt-4 pt-4 flex items-center justify-between">
                  <span className="font-display font-semibold text-[#0a331e]">Total</span>
                  <span className="font-display text-xl font-bold text-[#0f4d2e]">{formatPrice(order.total)}</span>
                </div>
                <p className="text-xs text-[#6b3e1f] mt-3">
                  Payment method: <b>{order.payment_method?.toUpperCase()}</b> · Status: <b>{order.status?.toUpperCase()}</b>
                </p>
              </div>
            )}

            <p className="text-sm text-[#4a453f] mb-7">
              We've received your order. Our team will reach out shortly on <b>{phone}</b> to confirm details.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={buildWhatsappFromNumber(wa, `Hi Shadrasa, I just placed order ${orderNo}. Please confirm.`)}
                target="_blank"
                rel="noreferrer"
                data-testid="success-whatsapp"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-full font-semibold px-6 py-3 text-sm"
              >
                <MessageCircle size={16} /> Confirm on WhatsApp
              </a>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 bg-white border border-[#0f4d2e]/20 hover:bg-[#0f4d2e] hover:text-white text-[#0a331e] rounded-full font-semibold px-6 py-3 text-sm"
              >
                <Phone size={16} /> Call Us
              </a>
              <Link to="/" className="inline-flex items-center justify-center gap-2 bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full font-semibold px-6 py-3 text-sm">
                <ShoppingBag size={16} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
