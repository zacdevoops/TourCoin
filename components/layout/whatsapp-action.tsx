import { MessageCircle } from "lucide-react";

export function WhatsAppAction() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const href = number
    ? `https://wa.me/${number}?text=Bonjour%20Tourcoin%2C%20je%20souhaite%20louer%20une%20voiture.`
    : "/contact";

  return (
    <a
      href={href}
      target={number ? "_blank" : undefined}
      rel={number ? "noreferrer" : undefined}
      aria-label="Contacter Tourcoin sur WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#25D366] px-4 font-bold text-[#07180d] shadow-premium hover:bg-[#4be07f]"
    >
      <MessageCircle aria-hidden="true" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
