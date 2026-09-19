import { NextResponse } from "next/server";

import { bookingDateTimeToDate } from "@/lib/booking/datetime";
import { MAX_BOOKING_BODY_BYTES } from "@/lib/booking/constants";
import { bookingInputSchema } from "@/lib/booking/schema";
import { sendAdminBookingEmail } from "@/lib/email/send-booking";
import { checkBookingRateLimit } from "@/lib/security/rate-limit";
import {
  getRequestIp,
  hasTrustedBookingOrigin,
} from "@/lib/security/request";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const responseHeaders = { "Cache-Control": "no-store" };
const validationMessages: Record<string, string> = {
  carId: "Veuillez sélectionner un véhicule.",
  name: "Veuillez saisir un nom valide.",
  email: "Veuillez saisir une adresse e-mail valide.",
  phone: "Veuillez saisir un numéro de téléphone valide.",
  pickupLocation: "Veuillez sélectionner un lieu de prise en charge.",
  pickupDate: "Veuillez vérifier la date de prise en charge.",
  pickupTime: "Veuillez vérifier l’heure de prise en charge.",
  returnLocation: "Veuillez sélectionner un lieu de retour.",
  returnDate: "Veuillez vérifier la date de retour.",
  returnTime: "Veuillez vérifier l’heure de retour.",
  message: "Le message ne peut pas dépasser 1000 caractères.",
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { ok: false, error: message },
    { status, headers: responseHeaders },
  );
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim();
  if (contentType !== "application/json") {
    return errorResponse("Le format de la demande n’est pas accepté.", 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BOOKING_BODY_BYTES) {
    return errorResponse("La demande est trop volumineuse.", 413);
  }

  if (!hasTrustedBookingOrigin(request)) {
    return errorResponse("Cette demande n’est pas autorisée.", 403);
  }

  if (!(await checkBookingRateLimit(getRequestIp(request)))) {
    return errorResponse(
      "Trop de demandes ont été envoyées. Veuillez réessayer dans quelques minutes.",
      429,
    );
  }

  let body: unknown;
  try {
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength > MAX_BOOKING_BODY_BYTES) {
      return errorResponse("La demande est trop volumineuse.", 413);
    }
    body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return errorResponse("La demande est invalide.", 400);
  }

  const parsed = bookingInputSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues.find(
      (issue) => issue.path[0] !== "website",
    );
    const field =
      typeof firstIssue?.path[0] === "string" ? firstIssue.path[0] : "";
    return errorResponse(
      validationMessages[field] ?? "Veuillez vérifier les informations saisies.",
      400,
    );
  }

  const pickupAt = bookingDateTimeToDate(
    parsed.data.pickupDate,
    parsed.data.pickupTime,
  );
  const returnAt = bookingDateTimeToDate(
    parsed.data.returnDate,
    parsed.data.returnTime,
  );
  if (!pickupAt || !returnAt) {
    return errorResponse("Veuillez vérifier les dates saisies.", 400);
  }

  try {
    const supabase = createSupabaseAdmin();
    const { data: car, error: carError } = await supabase
      .from("cars")
      .select("id, slug, name, price_per_day, currency")
      .eq("id", parsed.data.carId)
      .eq("active", true)
      .gt("price_per_day", 0)
      .maybeSingle();

    if (carError) {
      return errorResponse(
        "Le service de réservation est momentanément indisponible.",
        503,
      );
    }
    if (!car) {
      return errorResponse(
        "Ce véhicule n’est plus disponible à la réservation.",
        400,
      );
    }

    const bookingId = crypto.randomUUID();
    const reference = `TC-${bookingId.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
    const { error: insertError } = await supabase
      .from("booking_requests")
      .insert({
        id: bookingId,
        status: "NEW",
        customer_name: parsed.data.name,
        customer_email: parsed.data.email,
        customer_phone: parsed.data.phone,
        car_id: car.id,
        car_slug: car.slug,
        car_name: car.name,
        car_price_per_day: car.price_per_day,
        currency: car.currency,
        pickup_location: parsed.data.pickupLocation,
        pickup_at: pickupAt.toISOString(),
        return_location: parsed.data.returnLocation,
        return_at: returnAt.toISOString(),
        message: parsed.data.message || null,
      });

    if (insertError) {
      return errorResponse(
        "Votre demande n’a pas pu être enregistrée. Veuillez réessayer.",
        503,
      );
    }

    const emailSent = await sendAdminBookingEmail({
      reference,
      customerName: parsed.data.name,
      customerEmail: parsed.data.email,
      customerPhone: parsed.data.phone,
      carName: car.name,
      carSlug: car.slug,
      carPricePerDay: car.price_per_day,
      currency: car.currency,
      pickupLocation: parsed.data.pickupLocation,
      pickupAt: pickupAt.toISOString(),
      returnLocation: parsed.data.returnLocation,
      returnAt: returnAt.toISOString(),
      message: parsed.data.message || null,
    });
    if (!emailSent) {
      console.warn("Booking accepted; notification email was not delivered");
    }

    return NextResponse.json(
      { ok: true, reference },
      { status: 201, headers: responseHeaders },
    );
  } catch {
    return errorResponse(
      "Le service de réservation est momentanément indisponible.",
      503,
    );
  }
}
