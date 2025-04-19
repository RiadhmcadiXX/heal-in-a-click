
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container max-w-md mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-gray-500 mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
