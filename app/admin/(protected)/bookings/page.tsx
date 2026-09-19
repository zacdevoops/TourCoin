import { AccessError } from "@/components/admin/access-error";
import { BookingList } from "@/components/admin/booking-list";
import { requireAdminPage } from "@/lib/admin/auth";
import { getBookings } from "@/lib/admin/data";

export default async function AdminBookingsPage() {
  const access = await requireAdminPage();
  if (access.status !== "authorized") return <AccessError message={access.message} />;
  const { bookings, error } = await getBookings(access.supabase);

  return (
    <div>
      <p className="eyebrow">Réservations</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Demandes</h1>
      <p className="mt-2 text-muted">
        {bookings.length} demande{bookings.length === 1 ? "" : "s"} reçue{bookings.length === 1 ? "" : "s"}.
      </p>
      {error && <p role="alert" className="mt-6 rounded-lg border border-danger/40 bg-danger/10 p-3">{error}</p>}
      <div className="mt-7"><BookingList bookings={bookings} /></div>
    </div>
  );
}
