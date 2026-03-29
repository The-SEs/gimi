import activeConditionsIcon from "../../assets/activeConditionsIcon.svg";

type ConditionSeverity = "critical" | "normal";

interface Condition {
  category: string;
  name: string;
  description: string;
  severity: ConditionSeverity;
}

interface ActiveConditionsProps {
  conditions?: Condition[];
}

const defaultConditions: Condition[] = [
  {
    category: "PSYCHOLOGICAL",
    name: "Severe Depressive Episode",
    description: "Diagnosed Jan 2026. Monitoring required for self-harm markers.",
    severity: "critical",
  },
  {
    category: "SYSTEMIC",
    name: "Generalized Anxiety",
    description: "Trigger-based palpitations reported by student.",
    severity: "normal",
  },
];

const severityStyles: Record<ConditionSeverity, {
  wrapper: string;
  category: string;
  name: string;
  description: string;
}> = {
  critical: {
    wrapper: "bg-red-100 border-l-4 border-red-700 rounded-md p-2 sm:p-3",
    category: "text-xs sm:text-sm tracking-widest text-red-700 mb-1 break-all",
    name: "text-base sm:text-lg lg:text-xl font-semibold text-red-800 mb-1 break-all",
    description: "text-sm sm:text-base text-red-700 break-all",
  },
  normal: {
    wrapper: "bg-gray-100 rounded-md p-2 sm:p-3",
    category: "text-xs sm:text-sm tracking-widest text-gray-500 mb-1 break-all",
    name: "text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-1 break-all",
    description: "text-sm sm:text-base text-gray-600 break-all",
  },
};

export default function ActiveConditions({ conditions = defaultConditions }: ActiveConditionsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 h-full flex flex-col min-w-0">

      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <img
          src={activeConditionsIcon}
          alt="Active Conditions"
          className="w-6 h-6 sm:w-7 sm:h-7"/>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
          Active Conditions
        </h2>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3 overflow-y-auto">
        {conditions.map((condition, i) => {
          const styles = severityStyles[condition.severity];
          return (
            <div key={i} className={styles.wrapper}>
              <p className={styles.category}>{condition.category}</p>
              <h3 className={styles.name}>{condition.name}</h3>
              <p className={styles.description}>{condition.description}</p>
            </div>
          );
        })}

        {conditions.length === 0 && (
          <p className="text-sm text-gray-400 italic">No active conditions on record.</p>
        )}
      </div>
    </div>
  );
}