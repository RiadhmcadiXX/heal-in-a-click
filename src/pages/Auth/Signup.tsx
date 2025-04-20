
import { Header } from "@/components/Header";
import { MultiStepRegisterForm } from "@/components/auth/MultiStepRegisterForm";

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <MultiStepRegisterForm />
        </div>
      </main>
    </div>
  );
}
