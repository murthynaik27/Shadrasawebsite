import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../lib/api";
import { authHeaders } from "../../lib/admin";
import { useSiteData } from "../../lib/siteData";
import ImageInput, { Label, TextInput, TextArea } from "./_shared";

const SECTIONS = [
  {
    title: "Hero Section",
    fields: [
      { key: "hero_eyebrow", label: "Eyebrow text", type: "text" },
      { key: "hero_heading", label: "Heading", type: "text" },
      { key: "hero_subheading", label: "Subheading", type: "text" },
      { key: "hero_cta_primary_label", label: "Primary button label", type: "text" },
      { key: "hero_cta_secondary_label", label: "Secondary button label", type: "text" },
    ],
  },
  {
    title: "About / Our Story",
    fields: [
      { key: "about_eyebrow", label: "Eyebrow text", type: "text" },
      { key: "about_heading", label: "Heading", type: "text" },
      { key: "about_body", label: "Body paragraph", type: "textarea" },
      { key: "about_image", label: "About image", type: "image" },
      { key: "mission_title", label: "Mission title", type: "text" },
      { key: "mission_body", label: "Mission body", type: "textarea" },
      { key: "vision_title", label: "Vision title", type: "text" },
      { key: "vision_body", label: "Vision body", type: "textarea" },
    ],
  },
  {
    title: "Brand Story / Video Section",
    fields: [
      { key: "heritage_is_active", label: "Show this section on website", type: "checkbox" },
      { key: "heritage_eyebrow", label: "Eyebrow text", type: "text" },
      { key: "heritage_heading", label: "Heading", type: "text" },
      { key: "heritage_body", label: "Body text", type: "textarea" },
      { key: "heritage_image", label: "Background image", type: "image" },
      { key: "heritage_video_url", label: "Brand story video URL (mp4 or YouTube link)", type: "text" },
      { key: "heritage_button_label", label: "Play button label", type: "text" },
    ],
  },
  {
    title: "Trust Counters",
    fields: [
      { key: "stat_customers", label: "Happy Customers", type: "number" },
      { key: "stat_quality", label: "Homemade Quality (%)", type: "number" },
      { key: "stat_natural", label: "Natural Ingredients (%)", type: "number" },
      { key: "stat_recipes", label: "Traditional Recipes", type: "number" },
    ],
  },
  {
    title: "Business Opportunity & Contact",
    fields: [
      { key: "business_heading", label: "Business heading", type: "text" },
      { key: "business_body", label: "Business body", type: "textarea" },
      { key: "contact_phone", label: "Phone number", type: "text" },
      { key: "contact_email", label: "Email address", type: "text" },
      { key: "contact_address", label: "Address", type: "text" },
      { key: "business_name", label: "Business Name (e.g. Shadrasa)", type: "text" },
      { key: "whatsapp_number", label: "WhatsApp number (digits only, e.g. 917338542117)", type: "text" },
      { key: "upi_id", label: "UPI ID for Checkout (e.g. yourname@ybl)", type: "text" },
      { key: "footer_tagline", label: "Footer tagline", type: "textarea" },
    ],
  },
  {
    title: "Social Links",
    fields: [
      { key: "social_instagram", label: "Instagram URL", type: "text" },
      { key: "social_facebook", label: "Facebook URL", type: "text" },
      { key: "social_youtube", label: "YouTube URL", type: "text" },
      { key: "social_twitter", label: "Twitter / X URL", type: "text" },
    ],
  },
];

export default function AdminContent() {
  const { refreshSiteData } = useSiteData();
  const [content, setContent] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get("/admin/content", { headers: authHeaders() }).then((r) => setContent(r.data || {}));
  }, []);

  const update = (k, v) => setContent((c) => ({ ...c, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...content };
      delete payload.id;
      delete payload.updated_at;
      // ensure numeric stats
      ["stat_customers", "stat_quality", "stat_natural", "stat_recipes"].forEach((k) => {
        if (payload[k] !== undefined && payload[k] !== null && payload[k] !== "") payload[k] = Number(payload[k]);
      });
      await apiClient.put("/admin/content", payload, { headers: authHeaders() });
      toast.success("Content saved");
      refreshSiteData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="admin-content">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#0a331e]">Story & Content</h1>
          <p className="text-[#6b3e1f] mt-1 text-sm">Edit any text or image on your homepage.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          data-testid="content-save"
          className="inline-flex items-center gap-2 bg-[#0f4d2e] hover:bg-[#0a331e] disabled:opacity-60 text-white rounded-full px-6 py-2.5 text-sm font-semibold"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-2xl bg-white border border-[#6b3e1f]/10 p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold text-[#0a331e] mb-5 pb-3 border-b border-[#6b3e1f]/10">{s.title}</h2>
            <div className="space-y-4">
              {s.fields.map((f) => (
                <div key={f.key}>
                  {f.type === "image" ? (
                    <ImageInput value={content[f.key] || ""} onChange={(v) => update(f.key, v)} label={f.label} />
                  ) : f.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#0a331e] cursor-pointer pt-2">
                      <input type="checkbox" checked={content[f.key] ?? true} onChange={(e) => update(f.key, e.target.checked)} className="h-4 w-4 accent-[#0f4d2e]" />
                      {f.label}
                    </label>
                  ) : (
                    <label className="block">
                      <Label>{f.label}</Label>
                      {f.type === "textarea" ? (
                        <TextArea rows={3} value={content[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} />
                      ) : (
                        <TextInput type={f.type} value={content[f.key] ?? ""} onChange={(e) => update(f.key, e.target.value)} />
                      )}
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 mt-8 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#d4a017] hover:bg-[#b88a14] disabled:opacity-60 text-white rounded-full px-6 py-3 text-sm font-semibold shadow-xl"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
