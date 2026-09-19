import { Mail, MapPin, Phone } from "lucide-react";
import { updateBookingStatus } from "@/lib/admin/actions";
import type { BookingRequest, BookingStatus } from "@/types/domain";
import { MutationForm } from "./mutation-form";

const date = new Intl.DateTimeFormat("fr-MA", {
  dateStyle: "medium",
  timeStyle: "short",
});
const money = new Intl.NumberFormat("fr-MA");
const statuses: { value: BookingStatus; label: string }[] = [
  { value: "NEW", label: "Nouvelle" },
  { value: "CONTACTED", label: "Contactée" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "CANCELLED", label: "Annulée" },
];

export function BookingList({
  bookings,
  compact = false,
}: {
  bookings: BookingRequest[];
  compact?: boolean;
}) {
  if (bookings.length === 0) {
    return <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">Aucune demande pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <article key={booking.id} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{booking.customerName}</h2>
                <StatusBadge status={booking.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                Reçue le {date.format(new Date(booking.createdAt))}
              </p>
            </div>
            {!compact && (
              <MutationForm
                action={updateBookingStatus}
                label="Mettre à jour"
                pendingLabel="Mise à jour…"
                className="flex flex-col gap-2 sm:flex-row sm:items-start"
                buttonClassName="min-h-11! px-4! py-2! text-sm"
              >
                <input type="hidden" name="id" value={booking.id} />
                <label className="sr-only" htmlFor={`status-${booking.id}`}>Statut</label>
                <select
                  id={`status-${booking.id}`}
                  name="status"
                  defaultValue={booking.status}
                  className="field min-h-11 sm:w-40"
                >
                  {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
              </MutationForm>
            )}
          </div>

          <div className="mt-4 grid gap-4 border-t border-line pt-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Véhicule demandé</p>
              <p className="mt-1 font-medium">{booking.carName}</p>
              <p className="text-sm text-gold">{money.format(booking.carPricePerDay)} MAD / jour</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Départ</p>
              <p className="mt-1">{date.format(new Date(booking.pickupAt))}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted"><MapPin className="size-4" aria-hidden="true" />{booking.pickupLocation}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Retour</p>
              <p className="mt-1">{date.format(new Date(booking.returnAt))}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted"><MapPin className="size-4" aria-hidden="true" />{booking.returnLocation}</p>
            </div>
          </div>

          {!compact && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
              <a className="flex min-h-11 items-center gap-2 hover:text-gold" href={`tel:${booking.customerPhone}`}>
                <Phone className="size-4" aria-hidden="true" /> {booking.customerPhone}
              </a>
              <a className="flex min-h-11 items-center gap-2 hover:text-gold" href={`mailto:${booking.customerEmail}`}>
                <Mail className="size-4" aria-hidden="true" /> {booking.customerEmail}
              </a>
            </div>
          )}
          {!compact && booking.message && (
            <div className="mt-3 rounded-lg bg-surface-raised p-3 text-sm">
              <span className="font-medium">Message : </span>{booking.message}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const labels: Record<BookingStatus, string> = {
    NEW: "Nouvelle",
    CONTACTED: "Contactée",
    CONFIRMED: "Confirmée",
    CANCELLED: "Annulée",
  };
  const style =
    status === "NEW"
      ? "bg-gold/15 text-gold"
      : status === "CONFIRMED"
        ? "bg-emerald-400/15 text-emerald-300"
        : status === "CANCELLED"
          ? "bg-danger/15 text-danger"
          : "bg-blue-400/15 text-blue-300";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>{labels[status]}</span>;
}
