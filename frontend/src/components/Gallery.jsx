import { motion } from "framer-motion";

const images = [
  {
    src: "https://static.prod-images.emergentagent.com/jobs/cc798c37-0d6b-4dd4-bae2-7f1634f5fc87/images/e84680ac840e149faf37cdbefef32eccba214d2ee0eb9299994073cb34aba1f2.png",
    span: "md:col-span-2 md:row-span-2",
    alt: "Banana leaf traditional spread",
  },
  {
    src: "https://images.pexels.com/photos/31280796/pexels-photo-31280796.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Honey collection",
  },
  {
    src: "https://images.pexels.com/photos/12299536/pexels-photo-12299536.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Spice market",
  },
  {
    src: "https://images.pexels.com/photos/16300779/pexels-photo-16300779.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Misty hills",
  },
  {
    src: "https://images.pexels.com/photos/7812134/pexels-photo-7812134.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Pickle jars",
  },
  {
    src: "https://images.pexels.com/photos/8500508/pexels-photo-8500508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Honey jar",
    span: "md:col-span-2",
  },
];

export default function Gallery() {
  return (
    <section id="gallery" data-testid="gallery-section" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="divider-ornament mb-4">Glimpses of Shadrasa</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[#0a331e] tracking-tight">
            Our <span className="italic text-[#d4a017]">Gallery</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-3 md:gap-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              data-testid={`gallery-item-${i}`}
              className={`group relative overflow-hidden rounded-2xl ${img.span || ""}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a331e]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
