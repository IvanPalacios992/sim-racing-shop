"use client";

interface Tab {
  key: string;
  label: string;
}

interface AdminTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
}

export default function AdminTabBar({ tabs, activeTab, onChange }: AdminTabBarProps) {
  return (
    <div className="flex flex-wrap border-b border-graphite mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === tab.key
              ? "border-racing-red text-pure-white"
              : "border-transparent text-silver hover:text-pure-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
