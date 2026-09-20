export const WHATSAPP_GENERIC_MESSAGE =
  "Bonjour, je souhaite avoir plus d'informations sur la location d'un véhicule chez TourCoin.";

export function getWhatsAppDigits() {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
}

export function getContactPhoneHref() {
  const raw = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
  if (!raw) return null;
  const normalized = raw.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : null;
}

export function vehicleWhatsAppMessage(vehicleName: string) {
  return `Bonjour, je souhaite avoir plus d'informations sur le ${vehicleName}.`;
}

export function whatsappHref(message = WHATSAPP_GENERIC_MESSAGE) {
  const digits = getWhatsAppDigits();
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
