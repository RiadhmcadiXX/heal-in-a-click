
import { Search } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpSections } from "@/components/help/HelpSections";
import { ContactSupportForm } from "@/components/help/ContactSupportForm";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Help Center</h1>
        
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <Input
            type="search"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <HelpSections searchQuery={searchQuery} />
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
          <ContactSupportForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
