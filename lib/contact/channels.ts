export const WHATSAPP_GENERIC_MESSAGE =
  "Bonjour, je souhaite louer une voiture. Pouvez-vous me conseiller ?";

export const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || "+212695492229";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
  "212695492229";

export function getWhatsAppDigits() {
  return WHATSAPP_NUMBER;
}

export function getContactPhoneHref() {
  return `tel:${CONTACT_PHONE.replace(/[^\d+]/g, "")}`;
}

export function vehicleWhatsAppMessage(vehicleName: string) {
  return `Bonjour, je souhaite louer la ${vehicleName}. Pouvez-vous me conseiller ?`;
}

export function whatsappHref(message = WHATSAPP_GENERIC_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
