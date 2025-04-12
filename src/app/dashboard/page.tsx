import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Add your dashboard content here */}
        <h2 className="text-2xl font-bold">Dashboard Content</h2>
      </main>
    </div>
  );
}
