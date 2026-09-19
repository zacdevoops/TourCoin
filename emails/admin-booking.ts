import { escapeHtml } from "@/lib/email/escape";

export interface AdminBookingEmailData {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  carName: string;
  carSlug: string;
  carPricePerDay: number;
  currency: string;
  pickupLocation: string;
  pickupAt: string;
  returnLocation: string;
  returnAt: string;
  message: string | null;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(new Date(value));
}

export function buildAdminBookingEmail(data: AdminBookingEmailData) {
  const rows: Array<[string, string]> = [
    ["Référence", data.reference],
    ["Client", data.customerName],
    ["E-mail", data.customerEmail],
    ["Téléphone", data.customerPhone],
    ["Véhicule", `${data.carName} (${data.carSlug})`],
    [
      "Tarif enregistré",
      `${data.carPricePerDay.toLocaleString("fr-FR")} ${data.currency} / jour`,
    ],
    ["Prise en charge", `${formatDate(data.pickupAt)} — ${data.pickupLocation}`],
    ["Retour", `${formatDate(data.returnAt)} — ${data.returnLocation}`],
  ];
  const textRows = rows.map(([label, value]) => `${label} : ${value}`).join("\n");
  const messageText = data.message ? `\n\nMessage :\n${data.message}` : "";
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:10px 12px;color:#75623d;border-bottom:1px solid #e6dfd2;width:180px">${escapeHtml(label)}</th><td style="padding:10px 12px;border-bottom:1px solid #e6dfd2">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const messageHtml = data.message
    ? `<div style="margin-top:24px;padding:16px;background:#f7f3eb;border-left:4px solid #c8a96b"><strong>Message du client</strong><p style="margin:8px 0 0;white-space:pre-wrap">${escapeHtml(data.message)}</p></div>`
    : "";

  return {
    subject: `Nouvelle demande de réservation — ${data.reference}`,
    text: `Nouvelle demande de réservation Tourcoin\n\n${textRows}${messageText}\n\nMerci de confirmer la disponibilité directement avec le client.`,
    html: `<!doctype html><html lang="fr"><body style="margin:0;background:#f3efe7;color:#171817;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;padding:32px 16px"><div style="background:#171817;color:#f5f1e8;padding:24px 28px;border-radius:12px 12px 0 0"><div style="color:#c8a96b;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Tourcoin</div><h1 style="font-size:24px;margin:8px 0 0">Nouvelle demande de réservation</h1></div><div style="background:#fff;padding:20px 24px 28px;border-radius:0 0 12px 12px"><table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px">${htmlRows}</table>${messageHtml}<p style="margin:24px 0 0;color:#5f5d57;font-size:14px">Merci de vérifier la disponibilité et de confirmer la réservation directement avec le client.</p></div></div></body></html>`,
  };
}
