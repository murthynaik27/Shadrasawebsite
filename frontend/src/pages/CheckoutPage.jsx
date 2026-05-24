import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, ShoppingBag, Truck, MessageCircle, Wallet, Banknote, Check } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import { useCart } from "../lib/CartContext";
import { apiClient, formatApiError, getImageUrl } from "../lib/api";
import { formatPrice } from "../lib/admin";
import { useSiteData } from "../lib/siteData";
import { buildWhatsappFromNumber } from "../lib/siteData";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", desc: "Pay in cash when your order arrives.", icon: Banknote },
  { id: "bank", label: "Bank Transfer / UPI", desc: "We'll share bank details after order confirmation.", icon: Wallet },
  { id: "whatsapp", label: "Confirm via WhatsApp", desc: "We'll WhatsApp you to confirm and arrange payment.", icon: MessageCircle },
];

export default function CheckoutPage() {
  const { items, subtotal, clear, auth } = useCart();
  const { content } = useSiteData();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [step, setStep] = useState(1);
  
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "Karnataka",
    pincode: "",
    country: "India",
    notes: "",
    payment_method: "cod",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (items.length === 0) {
      const t = setTimeout(() => navigate("/"), 800);
      return () => clearTimeout(t);
    }
  }, [items.length, navigate]);

  useEffect(() => {
    if (auth) {
      setForm((f) => ({
        ...f,
        customer_name: f.customer_name || auth.name || "",
        customer_phone: f.customer_phone || auth.phone || "",
      }));
    }
  }, [auth]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const nextStep = (target) => {
    if (target === 2) {
      if (!form.customer_name || !form.customer_phone) {
        toast.error("Please provide your name and phone number.");
        return;
      }
    } else if (target === 3) {
      if (!form.address_line1 || !form.city || !form.pincode) {
        toast.error("Please fill in the required address fields.");
        return;
      }
    }
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!auth) {
      setShowLoginModal(true);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
          weight: i.weight,
          unit: i.unit,
        })),
      };
      const { data } = await apiClient.post("/orders", payload);
      toast.success(`Order placed! ${data.order_no}`);

      const lines = items.map((i) => `• ${i.name} ${i.weight && i.unit ? `(${i.weight}${i.unit})` : ''} × ${i.quantity} — ₹${i.price * i.quantity}`).join("\n");
      const text = `Hi Shadrasa! I just placed order *${data.order_no}*\n\n${lines}\n\n*Total: ₹${data.total}*\nPayment: ${form.payment_method.toUpperCase()}\n\nName: ${form.customer_name}\nPhone: ${form.customer_phone}\nAddress: ${form.address_line1}, ${form.city} - ${form.pincode}`;
      const wa = content.whatsapp_number || "917338542117";
      window.open(buildWhatsappFromNumber(wa, text), "_blank");

      clear();
      navigate(`/order-success/${data.order_no}`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfbf7]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-32 text-center">
          <ShoppingBag size={48} className="mx-auto text-[#6b3e1f]/40 mb-4" />
          <h1 className="font-display text-3xl font-semibold text-[#0a331e]">Your cart is empty</h1>
          <p className="text-[#6b3e1f] mt-2 mb-6">Add a few jars before checkout.</p>
          <Link to="/" className="inline-block bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-full px-6 py-3 text-sm font-semibold">Back to shop</Link>
        </div>
        <Footer content={content} />
      </div>
    );
  }

  const steps = ["Customer", "Address", "Payment"];

  return (
    <div className="min-h-screen bg-[#fdfbf7]" data-testid="checkout-page">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[#6b3e1f] hover:text-[#0f4d2e] text-sm font-semibold mb-6">
            <ChevronLeft size={16} /> Continue shopping
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              {/* Progress Indicator */}
              <div className="relative flex items-center justify-between mb-8 px-4 sm:px-10">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[#6b3e1f]/15 -z-10 px-10 box-border bg-clip-content"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#0f4d2e] -z-10 transition-all duration-500 ease-out px-10 box-border bg-clip-content" 
                  style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                ></div>
                
                {steps.map((label, idx) => {
                  const num = idx + 1;
                  const isActive = step === num;
                  const isPast = step > num;
                  return (
                    <div key={label} className="flex flex-col items-center">
                      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-colors duration-300 shadow-sm ${
                        isActive ? 'bg-[#0f4d2e] text-white ring-4 ring-[#0f4d2e]/10' : 
                        isPast ? 'bg-[#0f4d2e] text-white' : 
                        'bg-white text-[#6b3e1f] border border-[#6b3e1f]/20'
                      }`}>
                        {isPast ? <Check size={18} /> : num}
                      </div>
                      <span className={`text-xs mt-2 font-semibold ${isActive || isPast ? 'text-[#0a331e]' : 'text-[#6b3e1f]/70'}`}>{label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Form Areas */}
              <form onSubmit={submit} className="relative min-h-[400px]">
                
                {/* STEP 1 */}
                <div className={`transition-all duration-500 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 absolute inset-0 pointer-events-none -translate-x-8'}`}>
                  <Section title="1. Customer Details" icon={ShoppingBag}>
                    <div className="space-y-4">
                      <F label="Full Name" req>
                        <I required data-testid="co-name" value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} />
                      </F>
                      <F label="Phone" req>
                        <I required type="tel" data-testid="co-phone" value={form.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} />
                      </F>
                      <F label="Email">
                        <I type="email" data-testid="co-email" value={form.customer_email} onChange={(e) => update("customer_email", e.target.value)} />
                      </F>
                    </div>
                    <div className="mt-8">
                      <button type="button" onClick={() => nextStep(2)} className="w-full bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-xl font-semibold py-4 shadow-md transition-all btn-glow">
                        Continue to Delivery
                      </button>
                    </div>
                  </Section>
                </div>

                {/* STEP 2 */}
                <div className={`transition-all duration-500 ${step === 2 ? 'opacity-100 translate-x-0 relative z-10' : step > 2 ? 'opacity-0 absolute inset-0 pointer-events-none -translate-x-8' : 'opacity-0 absolute inset-0 pointer-events-none translate-x-8'}`}>
                  <Section title="2. Shipping Address" icon={Truck}>
                    <div className="space-y-4">
                      <F label="Address Line 1" req>
                        <I required data-testid="co-addr1" value={form.address_line1} onChange={(e) => update("address_line1", e.target.value)} />
                      </F>
                      <F label="Address Line 2 (optional)">
                        <I data-testid="co-addr2" value={form.address_line2} onChange={(e) => update("address_line2", e.target.value)} />
                      </F>
                      <div className="grid grid-cols-2 gap-4">
                        <F label="City" req>
                          <I required data-testid="co-city" value={form.city} onChange={(e) => update("city", e.target.value)} />
                        </F>
                        <F label="Pincode" req>
                          <I required data-testid="co-pincode" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
                        </F>
                      </div>
                      <F label="State">
                        <I data-testid="co-state" value={form.state} onChange={(e) => update("state", e.target.value)} />
                      </F>
                      <F label="Order Notes (optional)">
                        <textarea rows={2} data-testid="co-notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} className="cf-input2" />
                      </F>
                    </div>
                    <div className="mt-8 flex gap-4">
                      <button type="button" onClick={() => setStep(1)} className="w-1/3 border border-[#0f4d2e]/20 text-[#0f4d2e] hover:bg-[#0f4d2e]/5 rounded-xl font-semibold py-4 transition-all">
                        Back
                      </button>
                      <button type="button" onClick={() => nextStep(3)} className="w-2/3 bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-xl font-semibold py-4 shadow-md transition-all btn-glow">
                        Continue to Payment
                      </button>
                    </div>
                  </Section>
                </div>

                {/* STEP 3 */}
                <div className={`transition-all duration-500 ${step === 3 ? 'opacity-100 translate-x-0 relative z-20' : 'opacity-0 absolute inset-0 pointer-events-none translate-x-8'}`}>
                  
                  {/* Mobile Order Summary (Only visible on Step 3) */}
                  <div className="lg:hidden mb-6">
                    <OrderSummaryBlock items={items} subtotal={subtotal} />
                  </div>

                  <Section title="3. Payment Method" icon={Wallet}>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((m) => (
                        <label key={m.id} data-testid={`pay-${m.id}`} className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${form.payment_method === m.id ? "border-[#0f4d2e] bg-[#0f4d2e]/5 shadow-sm" : "border-[#6b3e1f]/15 hover:border-[#0f4d2e]/30"}`}>
                          <input type="radio" name="pay" checked={form.payment_method === m.id} onChange={() => update("payment_method", m.id)} className="mt-1 h-4 w-4 accent-[#0f4d2e]" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <m.icon size={16} className="text-[#0f4d2e]" />
                              <span className="font-semibold text-[#0a331e]">{m.label}</span>
                            </div>
                            <p className="text-xs text-[#6b3e1f] mt-1 leading-relaxed">{m.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="mt-8 flex gap-4">
                      <button type="button" onClick={() => setStep(2)} disabled={submitting} className="w-1/3 border border-[#0f4d2e]/20 text-[#0f4d2e] hover:bg-[#0f4d2e]/5 rounded-xl font-semibold py-4 transition-all disabled:opacity-50">
                        Back
                      </button>
                      <button type="submit" disabled={submitting} data-testid="checkout-submit" className="w-2/3 bg-[#0f4d2e] hover:bg-[#0a331e] text-white rounded-xl font-semibold py-4 shadow-md transition-all btn-glow disabled:opacity-70 flex items-center justify-center gap-2">
                        {submitting ? "Processing..." : `Place Order`}
                      </button>
                    </div>
                  </Section>
                </div>
                
                <style>{`.cf-input2 { width:100%; border-radius:12px; border:1px solid rgba(107,62,31,0.2); padding:12px 14px; font-size:15px; outline:none; background:#fdfbf7; transition:all .2s; color:#0a331e; font-weight:500; } .cf-input2:focus { border-color:#0f4d2e; box-shadow:0 0 0 4px rgba(15,77,46,0.08); background:#fff } .cf-input2::placeholder { color:rgba(107,62,31,0.4); font-weight:400; }`}</style>
              </form>
            </div>

            {/* Desktop Summary */}
            <aside className="hidden lg:block lg:col-span-2">
              <OrderSummaryBlock items={items} subtotal={subtotal} />
            </aside>
          </div>
        </div>
      </main>
      <Footer content={content} />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {}} 
      />
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-[2rem] bg-white border border-[#6b3e1f]/10 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <h2 className="font-display text-xl font-semibold text-[#0a331e] mb-6 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-[#0f4d2e]/10 flex items-center justify-center text-[#0f4d2e]">
          <Icon size={16} />
        </div>
        {title}
      </h2>
      {children}
    </div>
  );
}

function F({ label, req, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6b3e1f]/80 mb-2">
        {label} {req && <span className="text-[#d4a017]">*</span>}
      </span>
      {children}
    </label>
  );
}

function I(props) {
  return <input {...props} className="cf-input2" />;
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6b3e1f]">{label}</span>
      <span className="text-[#0a331e] font-semibold">{value}</span>
    </div>
  );
}

function OrderSummaryBlock({ items, subtotal }) {
  return (
    <div className="sticky top-28 rounded-[2rem] bg-white border border-[#6b3e1f]/10 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <h3 className="font-display text-xl font-semibold text-[#0a331e] mb-5">Order Summary</h3>
      <ul className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((i, idx) => (
          <li key={`${i.product_id}-${idx}`} className="flex gap-4 items-center">
            <div className="h-16 w-16 rounded-xl overflow-hidden border border-[#6b3e1f]/10 flex-shrink-0">
              <img src={getImageUrl(i.image)} alt={i.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0a331e] leading-tight">
                {i.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {i.weight && i.unit && <span className="text-[11px] font-medium bg-[#6b3e1f]/5 text-[#6b3e1f] px-2 py-0.5 rounded-full">{i.weight}{i.unit}</span>}
                <span className="text-[11px] font-medium text-[#6b3e1f]/80">Qty: {i.quantity}</span>
              </div>
            </div>
            <p className="text-sm font-bold text-[#0f4d2e]">{formatPrice(i.price * i.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="space-y-3 text-sm py-5 border-t border-[#6b3e1f]/10">
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        <Row label="Shipping" value={<span className="text-[#0f4d2e] font-semibold">Free</span>} />
      </div>
      <div className="pt-5 border-t border-[#6b3e1f]/10 flex items-center justify-between">
        <span className="font-display text-lg font-semibold text-[#0a331e]">Total to Pay</span>
        <span className="font-display text-2xl font-bold text-[#0f4d2e]">{formatPrice(subtotal)}</span>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(107,62,31,0.1); border-radius: 4px; }`}</style>
    </div>
  );
}
