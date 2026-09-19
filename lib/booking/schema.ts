import { z } from "zod";

import { BOOKING_LOCATIONS } from "@/lib/booking/constants";
import { bookingDateTimeToDate } from "@/lib/booking/datetime";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const sensiblePhonePattern = /^\+?[0-9][0-9 ().-]{6,22}[0-9]$/;

export const bookingInputSchema = z
  .strictObject({
    carId: z.string().uuid("Veuillez sélectionner un véhicule."),
    name: z.string().trim().min(2, "Le nom est trop court.").max(100),
    email: z
      .string()
      .trim()
      .max(254)
      .email("Veuillez saisir une adresse e-mail valide."),
    phone: z
      .string()
      .trim()
      .min(8, "Veuillez saisir un numéro de téléphone valide.")
      .max(24, "Veuillez saisir un numéro de téléphone valide.")
      .regex(sensiblePhonePattern, "Veuillez saisir un numéro de téléphone valide."),
    pickupLocation: z.enum(BOOKING_LOCATIONS, {
      error: "Veuillez sélectionner un lieu de prise en charge.",
    }),
    pickupDate: z.string().regex(datePattern, "Date de départ invalide."),
    pickupTime: z.string().regex(timePattern, "Heure de départ invalide."),
    returnLocation: z.enum(BOOKING_LOCATIONS, {
      error: "Veuillez sélectionner un lieu de retour.",
    }),
    returnDate: z.string().regex(datePattern, "Date de retour invalide."),
    returnTime: z.string().regex(timePattern, "Heure de retour invalide."),
    message: z.string().trim().max(1000, "Le message ne peut pas dépasser 1000 caractères."),
    website: z.string().max(0),
  })
  .superRefine((input, context) => {
    const pickupAt = bookingDateTimeToDate(input.pickupDate, input.pickupTime);
    const returnAt = bookingDateTimeToDate(input.returnDate, input.returnTime);

    if (!pickupAt || pickupAt.getTime() < Date.now() - 60_000) {
      context.addIssue({
        code: "custom",
        path: ["pickupDate"],
        message: "La prise en charge ne peut pas être dans le passé.",
      });
    }

    if (!returnAt || !pickupAt || returnAt <= pickupAt) {
      context.addIssue({
        code: "custom",
        path: ["returnDate"],
        message: "Le retour doit avoir lieu après la prise en charge.",
      });
    }
  });

export type BookingInput = z.infer<typeof bookingInputSchema>;
