
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Calendar,
  UserPlus,
  Settings,
  HelpCircle,
} from "lucide-react";

interface HelpSectionsProps {
  searchQuery: string;
}

const helpContent = {
  quickStart: [
    {
      title: "How to create your account",
      icon: UserPlus,
      content: "1. Click 'Sign Up' in the top right corner\n2. Fill in your personal information\n3. Verify your email address\n4. Complete your profile"
    },
    {
      title: "How to book an appointment",
      icon: Calendar,
      content: "1. Log into your account\n2. Browse available doctors\n3. Select your preferred time slot\n4. Confirm your appointment"
    },
    {
      title: "How to manage your profile",
      icon: Settings,
      content: "1. Click on your profile icon\n2. Select 'Edit Profile'\n3. Update your information\n4. Save your changes"
    }
  ],
  faqs: [
    {
      title: "How can I reset my password?",
      content: "Click 'Forgot Password' on the login page and follow the instructions sent to your email."
    },
    {
      title: "What if I miss an appointment?",
      content: "Contact your doctor's office immediately to reschedule. Repeated missed appointments may incur a fee."
    },
    {
      title: "How do I update my availability as a doctor?",
      content: "Go to the 'Manage Availability' section in your dashboard to set your weekly schedule and special hours."
    },
    {
      title: "Can patients reschedule/cancel appointments?",
      content: "Yes, patients can reschedule or cancel appointments up to 24 hours before the scheduled time."
    }
  ],
  errors: [
    {
      title: "What if the calendar doesn't load?",
      content: "Try refreshing the page. If the problem persists, clear your browser cache and cookies."
    },
    {
      title: "What if my internet is lost?",
      content: "Don't worry - your appointment information is saved. Reconnect to see your updates."
    },
    {
      title: "Why can't I see my past appointments?",
      content: "Make sure you're viewing 'Past Appointments' in your appointments history. If they're still not visible, contact support."
    }
  ]
};

export function HelpSections({ searchQuery }: HelpSectionsProps) {
  const filterContent = (content: any[]) => {
    if (!searchQuery) return content;
    return content.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="space-y-8">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="quick-start">
          <AccordionTrigger className="text-xl font-semibold">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quick Start Guide
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              {filterContent(helpContent.quickStart).map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 font-medium mb-2">
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </div>
                  <p className="text-gray-600 whitespace-pre-line">{item.content}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faqs">
          <AccordionTrigger className="text-xl font-semibold">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              {filterContent(helpContent.faqs).map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.content}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="errors">
          <AccordionTrigger className="text-xl font-semibold">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Common Errors and Solutions
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-4">
              {filterContent(helpContent.errors).map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.content}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
