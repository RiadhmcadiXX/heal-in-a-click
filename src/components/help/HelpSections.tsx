import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BookOpen,
  Calendar,
  UserPlus,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

interface HelpSectionsProps {
  searchQuery: string;
}

const helpContent = {
  quickStart: [
    {
      title: "How to create your account",
      icon: UserPlus,
      steps: [
        "Click 'Sign Up' in the top right corner",
        "Fill in your personal information",
        "Verify your email address",
        "Complete your profile"
      ]
    },
    {
      title: "How to book an appointment",
      icon: Calendar,
      steps: [
        "Log into your account",
        "Browse available doctors",
        "Select your preferred time slot",
        "Confirm your appointment"
      ]
    },
    {
      title: "How to manage your profile",
      icon: Settings,
      steps: [
        "Click on your profile icon",
        "Select 'Edit Profile'",
        "Update your information",
        "Save your changes"
      ]
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
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({});

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const filterContent = (content: any[]) => {
    if (!searchQuery) return content;
    return content.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.steps && item.steps.some((step: string) => 
        step.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Quick Start Guide
        </h2>
        <div className="space-y-4">
          {filterContent(helpContent.quickStart).map((item, index) => (
            <Collapsible 
              key={index} 
              open={openSections[item.title]}
              onOpenChange={() => toggleSection(item.title)}
              className="bg-white rounded-lg shadow-sm"
            >
              <CollapsibleTrigger className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 transition-transform ${
                    openSections[item.title] ? 'rotate-180' : ''
                  }`} 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <ol className="list-decimal list-inside text-gray-600 space-y-2">
                  {item.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {helpContent.faqs.map((item, index) => (
            <Collapsible key={index} className="bg-white rounded-lg shadow-sm">
              <CollapsibleTrigger className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="font-medium">{item.title}</span>
                <ChevronDown className="h-5 w-5 transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <p className="text-gray-600">{item.content}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Common Errors and Solutions
        </h2>
        <div className="space-y-4">
          {helpContent.errors.map((item, index) => (
            <Collapsible key={index} className="bg-white rounded-lg shadow-sm">
              <CollapsibleTrigger className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="font-medium">{item.title}</span>
                <ChevronDown className="h-5 w-5 transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <p className="text-gray-600">{item.content}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
}
