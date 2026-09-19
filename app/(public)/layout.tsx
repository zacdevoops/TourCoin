import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppAction } from "@/components/layout/whatsapp-action";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppAction />
    </>
  );
}
