
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";

const subscriptions = [
  {
    label: "1 Month",
    price: "DZD500",
    duration: "Per month",
    description: "Access all features for 1 month.",
  },
  {
    label: "4 Months",
    price: "DZD1200",
    duration: "Every 4 months",
    description: "Access all features for 4 months.",
  },
  {
    label: "1 Year",
    price: "DZD2500",
    duration: "Per year",
    description: "Access all features for 12 months.",
  },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Choose Your Subscription</h1>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 max-w-3xl mx-auto">
          {subscriptions.map((sub) => (
            <Card className="flex flex-col items-center text-center" key={sub.label}>
              <CardHeader>
                <CardTitle className="text-xl">{sub.label}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="text-4xl font-bold text-healthcare-primary">{sub.price}</div>
                <div className="text-gray-500">{sub.duration}</div>
                <div className="text-gray-700 text-sm mb-4">{sub.description}</div>
                <ul className="mb-4 text-gray-600 text-sm space-y-2">
                  <li>• Access to all features</li>
                  <li>• Manage your appointments</li>
                  <li>• Set your availability</li>
                  <li>• Connect with patients</li>
                </ul>
                <Button
                  className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90"
                  onClick={() => navigate("/signup")}
                >
                  Subscribe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
