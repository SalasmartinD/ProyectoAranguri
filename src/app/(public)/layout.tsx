import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import ChatBubble from '@/components/shared/ChatBubble';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
      <ChatBubble />
    </div>
  );
}
