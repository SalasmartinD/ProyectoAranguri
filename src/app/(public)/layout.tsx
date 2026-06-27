import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import ChatBubble from '@/components/shared/ChatBubble';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      {/* Patrón de fondo premium con desvanecido dinámico */}
      <div className="absolute inset-0 z-[-1] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.1)_40%,rgba(0,0,0,0.1)_60%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
      
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {children}
      </main>
      <Footer />
      <ChatBubble />
    </div>
  );
}
