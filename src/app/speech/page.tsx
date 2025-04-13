import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import TiptapEditor from "@/components/TiptapEditor";

export default function Speech() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <main className="mt-16">
          <TiptapEditor />
        </main>
      </div>
    </ProtectedRoute>
  );
}
