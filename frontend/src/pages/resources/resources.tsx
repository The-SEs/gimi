import GimiHeadIcon from "../../components/gimi-action-button/gimi-button";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ResourceCardProps {
  category: string;
  readTime: string;
  title: string;
  description: string;
  linkText?: string;
  imageUrl: string;
  categoryColor: string;
}

const ResourceCard = ({
  category,
  readTime,
  title,
  description,
  linkText,
  imageUrl,
  categoryColor,
}: ResourceCardProps) => {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      <div className="h-56 overflow-hidden relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-[2.5rem] rounded-b-[40px]"
        />
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-3">
          <span
            className="text-[10px] font-bold tracking-[0.1em] uppercase"
            style={{ color: categoryColor }}
          >
            {category}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">{readTime}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-grow">
          {description}
        </p>
        <div className="mt-auto">
          <a
            href="#"
            className="text-sm font-bold flex items-center gap-1 group/link"
            style={{ color: categoryColor }}
          >
            {linkText || "Read more"}
            <ChevronRight
              size={16}
              className="group-hover/link:translate-x-1 transition-transform"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default function ResourcesPage() {
  //change soon to real articles provided by miss
  const resources: ResourceCardProps[] = [
    {
      category: "Mindfulness",
      readTime: "5 min read",
      title: "5-Minute Micro-Meditations for Busy Schedules",
      description:
        "Learn how to reclaim your focus during short breaks between lectures with these simple breathing...",
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
      categoryColor: "#10b981", // Emerald
      linkText: "Start meditated"
    },
    {
      category: "Digital Balance",
      readTime: "6 min read",
      title: "The Digital Detox Guide: Reclaiming Your Sleep",
      description:
        "How scrolling before bed affects your REM cycle and what you can do to establish a better nighttime...",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
      categoryColor: "#f59e0b", // Amber
      linkText: "Read tips"
    },
    {
      category: "Community",
      readTime: "10 min read",
      title: "Overcoming Imposter Syndrome in University",
      description:
        "You belong here. Learn how to identify and quiet the voice that says otherwise with collective wisdom.",
      imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop",
      categoryColor: "#3b82f6", // Blue
      linkText: "Join the talk"
    },
    {
      category: "Urgent Support",
      readTime: "Quick Read",
      title: "When Stress Becomes Crisis: Red Flags to Watch For",
      description:
        "Learn to distinguish between normal academic stress and signs that you or a friend might need professional support.",
      linkText: "Learn the signs",
      imageUrl: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=800&auto=format&fit=crop",
      categoryColor: "#ef4444", // Red
    },
    {
      category: "Journaling",
      readTime: "4 min read",
      title: "Why \"Doodling\" Might Be Your Best Therapy Tool",
      description:
        "Scientific research shows that non-linear expression can lower cortisol levels significantly. Here's how to start.",
      linkText: "Start sketching",
      imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop",
      categoryColor: "#8b5cf6", // Violet
    },
    {
      category: "Study Tips",
      readTime: "7 min read",
      title: "The Pomodoro Method for Emotional Resilience",
      description:
        "Using the 25/5 rule not just for studying, but for emotional regulation during difficult tasks.",
      linkText: "Try the method",
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
      categoryColor: "#06b6d4", // Cyan
    },
    {
      category: "Self-Growth",
      readTime: "8 min read",
      title: "The Art of Saying No: Setting Boundaries",
      description:
        "Discover how setting healthy boundaries can improve your mental energy and academic performance.",
      imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
      categoryColor: "#ec4899", // Pink
      linkText: "Save your peace"
    },
    {
      category: "Nutrition",
      readTime: "5 min read",
      title: "Brain Food: Eating for Cognitive Focus",
      description:
        "What you eat matters. Explore the best foods to fuel your brain during intense study sessions.",
      imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop",
      categoryColor: "#22c55e", // Green
      linkText: "Meal plan ideas"
    },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12 px-6">
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/50 hover:bg-white text-blue-700 font-bold rounded-full transition-all group border border-blue-100 shadow-sm"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Help & Resources</h1>
        <p className="text-blue-600/80 font-medium text-lg">Discover tools and guides to support your well-being journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {resources.map((resource, index) => (
          <div
            key={resource.title}
            className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ResourceCard {...resource} />
          </div>
        ))}
      </div>

      <div className="sticky z-100 bottom-5 right-5">
        <GimiHeadIcon />
      </div>
    </div>
  );
}
