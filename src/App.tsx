import { useRef, useState } from "react";
import {
    Activity,
    Users,
    Clock,
    DollarSign,
    Brain,
    Zap,
    Target,
} from "lucide-react";
import {
    LineChart,
    BarChart,
    Area,
    ComposedChart,
    Scatter,
    ZAxis,
    ScatterChart,
} from "recharts";
import { motion } from "framer-motion";
import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
} from "recharts";

interface TeamMember {
    level: "Junior" | "Mid" | "Senior" | "Tech Lead";
    count: number;
    costPerHour: number;
}
interface TeamAnalysis {
    composition: string;
    performance: number;
    cost: number;
}
interface PredictionResult {
    duration: { days: number; hours: number };
    cost: number;
    performance: number;
    teamEfficiency: number;
    riskLevel: "Low" | "Medium" | "High";
}

interface TaskData {
    type: string;
    complexity: string;
    priority: string;
    storyPoints: number;
    techStack: string;
    dependencies: number;
    assigneeLevel: string;
    estimatedHours: number;
    sprintDay: number;
    createdHour: number;
    remoteWork: boolean;
    meetingsToday: number;
    blockerFlag: boolean;
}

const TASK_TYPES = [
    "Code Review",
    "Bug Fix",
    "Feature Dev",
    "Testing",
    "Documentation",
    "Design Review",
    "Client Meeting",
    "Deployment",
    "Refactoring",
];

const TECH_STACKS = ["Python", "Java", "JavaScript", "C++", "Go", "Other"];
const COMPLEXITIES = ["Low", "Medium", "High"];
const ASSIGNEE_LEVELS = ["Junior", "Mid", "Senior", "Tech Lead"];
const PRIORITY_LEVELS = ["Low", "Medium", "High", "Critical"];

function App() {
    const [taskData, setTaskData] = useState<TaskData>({
        type: "Feature Dev",
        complexity: "Medium",
        priority: "Medium",
        storyPoints: 5,
        techStack: "Python",
        dependencies: 2,
        assigneeLevel: "Mid",
        estimatedHours: 16,
        sprintDay: 3,
        createdHour: 10,
        remoteWork: true,
        meetingsToday: 2,
        blockerFlag: false,
    });

    const [team, setTeam] = useState<TeamMember[]>([
        { level: "Junior", count: 1, costPerHour: 25 },
        { level: "Mid", count: 2, costPerHour: 50 },
        { level: "Senior", count: 1, costPerHour: 75 },
        { level: "Tech Lead", count: 0, costPerHour: 100 },
    ]);

    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const outputRef = useRef<HTMLDivElement>(null);

    const calculateAvgExperience = (team: TeamMember[]) => {
        const experienceMap: { [key: string]: number } = {
            Junior: 1.5,
            Mid: 3.25,
            Senior: 5.75,
            "Tech Lead": 7.75,
        };

        const totalExp = team.reduce(
            (acc, member) => acc + member.count * experienceMap[member.level],
            0
        );
        const totalCount = team.reduce((acc, member) => acc + member.count, 0);
        return totalCount === 0
            ? 0
            : parseFloat((totalExp / totalCount).toFixed(2));
    };
    const [optimizedTeams, setOptimizedTeams] = useState<{
        highPerformance: TeamAnalysis[];
        budgetFriendly: TeamAnalysis[];
    }>({ highPerformance: [], budgetFriendly: [] });
    const handlePredict = async () => {
        setIsPredicting(true);

        try {
            const totalCostPerHour = team.reduce(
                (acc, member) => acc + member.count * member.costPerHour,
                0
            );
            const teamSize = team.reduce(
                (acc, member) => acc + member.count,
                0
            );

            const response = await fetch("http://localhost:5000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task_type: taskData.type,
                    complexity: taskData.complexity,
                    task_priority: taskData.priority,
                    assignee_level: taskData.assigneeLevel,
                    tech_stack: taskData.techStack,
                    story_points: taskData.storyPoints,
                    num_dependencies: taskData.dependencies,
                    estimated_hours: taskData.estimatedHours,
                    sprint_day: taskData.sprintDay,
                    created_hour: taskData.createdHour,
                    remote_work: taskData.remoteWork,
                    meetings_today: taskData.meetingsToday,
                    blocker_flag: taskData.blockerFlag,
                    team_cost: totalCostPerHour,
                    team_size: teamSize,
                    juniors: team.find((t) => t.level === "Junior")?.count || 0,
                    mediors: team.find((t) => t.level === "Mid")?.count || 0,
                    seniors: team.find((t) => t.level === "Senior")?.count || 0,
                    tech_leads:
                        team.find((t) => t.level === "Tech Lead")?.count || 0,
                    avg_experience: calculateAvgExperience(team),
                }),
            });

            const result = await response.json();
            if (response.ok) {
                setPrediction(result);
                setTimeout(
                    () =>
                        outputRef.current?.scrollIntoView({
                            behavior: "smooth",
                        }),
                    300
                );
            } else console.error("API Error:", result.error);
        } catch (err) {
            console.error("Request failed:", err);
        } finally {
            setIsPredicting(false);
        }
    };

    const handleOptimizeTeams = async () => {
        setIsOptimizing(true);
        try {
            const totalCostPerHour = team.reduce(
                (acc, m) => acc + m.count * m.costPerHour,
                0
            );
            const teamSize = team.reduce((acc, m) => acc + m.count, 0);

            const response = await fetch(
                "http://localhost:5000/optimize-teams",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...taskData,
                        team_cost: totalCostPerHour,
                        team_size: teamSize,
                        juniors:
                            team.find((t) => t.level === "Junior")?.count || 0,
                        mediors:
                            team.find((t) => t.level === "Mid")?.count || 0,
                        seniors:
                            team.find((t) => t.level === "Senior")?.count || 0,
                        tech_leads:
                            team.find((t) => t.level === "Tech Lead")?.count ||
                            0,
                        avg_experience: calculateAvgExperience(team),
                    }),
                }
            );

            const data = await response.json();

            const parseTeams = (teams: any[]) =>
                teams.map((t) => ({
                    composition: `${t.juniors}J, ${t.mediors}M, ${t.seniors}S, ${t.tech_leads}TL`,
                    performance: Math.max(0, 100 - t.duration_days * 10), // adjust scale if needed
                    cost: parseFloat(t.cost.toFixed(2)),
                }));

            setOptimizedTeams({
                highPerformance: parseTeams(data.fastest || []),
                budgetFriendly: parseTeams(data.cheapest || []),
            });
            console.log(data);
            setTimeout(
                () => outputRef.current?.scrollIntoView({ behavior: "smooth" }),
                300
            );
        } catch (err) {
            console.error("Failed to load optimized teams:", err);
        } finally {
            setIsOptimizing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-3">
                        <Brain className="h-8 w-8 text-indigo-600" />
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                            Task & Team Optimizer AI
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-4">
                <div className="space-y-4">
                    {/* Task Details and Team Composition side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Task Details Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-xl shadow-md p-4"
                        >
                            <h2 className="text-base font-semibold mb-3 flex items-center">
                                <Target className="h-5 w-5 mr-2 text-indigo-600" />
                                Task Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Task Type
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                                        value={taskData.type}
                                        onChange={(e) =>
                                            setTaskData({
                                                ...taskData,
                                                type: e.target.value,
                                            })
                                        }
                                    >
                                        {TASK_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tech Stack
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                                        value={taskData.techStack}
                                        onChange={(e) =>
                                            setTaskData({
                                                ...taskData,
                                                techStack: e.target.value,
                                            })
                                        }
                                    >
                                        {TECH_STACKS.map((stack) => (
                                            <option key={stack} value={stack}>
                                                {stack}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Complexity
                                    </label>
                                    <div className="flex space-x-2">
                                        {COMPLEXITIES.map((level) => (
                                            <button
                                                key={level}
                                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    taskData.complexity ===
                                                    level
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                                onClick={() =>
                                                    setTaskData({
                                                        ...taskData,
                                                        complexity: level,
                                                    })
                                                }
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority
                                    </label>
                                    <div className="flex space-x-2">
                                        {PRIORITY_LEVELS.map((level) => (
                                            <button
                                                key={level}
                                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    taskData.priority === level
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                                onClick={() =>
                                                    setTaskData({
                                                        ...taskData,
                                                        priority: level,
                                                    })
                                                }
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assignee Level
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                                        value={taskData.assigneeLevel}
                                        onChange={(e) =>
                                            setTaskData({
                                                ...taskData,
                                                assigneeLevel: e.target.value,
                                            })
                                        }
                                    >
                                        {ASSIGNEE_LEVELS.map((level) => (
                                            <option key={level} value={level}>
                                                {level}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Story Points
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="13"
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                                            value={taskData.storyPoints}
                                            onChange={(e) =>
                                                setTaskData({
                                                    ...taskData,
                                                    storyPoints: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dependencies
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                                            value={taskData.dependencies}
                                            onChange={(e) =>
                                                setTaskData({
                                                    ...taskData,
                                                    dependencies: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sprint Day
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="14"
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                                            value={taskData.sprintDay}
                                            onChange={(e) =>
                                                setTaskData({
                                                    ...taskData,
                                                    sprintDay: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Created Hour (0-23)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="23"
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                                            value={taskData.createdHour}
                                            onChange={(e) =>
                                                setTaskData({
                                                    ...taskData,
                                                    createdHour: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estimated Hours
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                                            value={taskData.estimatedHours}
                                            onChange={(e) =>
                                                setTaskData({
                                                    ...taskData,
                                                    estimatedHours: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Meetings Today
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="8"
                                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all duration-200"
                                            value={taskData.meetingsToday}
                                            onChange={(e) =>
                                                setTaskData({
                                                    ...taskData,
                                                    meetingsToday: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="peer hidden"
                                            checked={taskData.remoteWork}
                                            onChange={(e) =>
                                                setTaskData({
                                                    ...taskData,
                                                    remoteWork:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 flex items-center justify-center transition">
                                            {taskData.remoteWork && (
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={3}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-700">
                                            Remote Work
                                        </span>
                                    </label>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="peer hidden"
                                            checked={taskData.blockerFlag}
                                            onChange={(e) =>
                                                setTaskData({
                                                    ...taskData,
                                                    blockerFlag:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:border-red-600 peer-checked:bg-red-600 flex items-center justify-center transition">
                                            {taskData.blockerFlag && (
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={3}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-700">
                                            Blocker
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </motion.div>

                        {/* Team Composition Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white rounded-xl shadow-md p-4"
                        >
                            <h2 className="text-base font-semibold mb-3 flex items-center">
                                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                                Team Composition
                            </h2>
                            <div className="space-y-6">
                                {team.map((member, index) => (
                                    <div
                                        key={member.level}
                                        className="space-y-2"
                                    >
                                        <label className="block text-sm font-medium text-gray-700">
                                            {member.level} ($
                                            {member.costPerHour}/hour)
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="range"
                                                min="0"
                                                max="5"
                                                className="flex-1 h-2 rounded-lg appearance-none bg-gray-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600"
                                                value={member.count}
                                                onChange={(e) => {
                                                    const newTeam = [...team];
                                                    newTeam[index].count =
                                                        parseInt(
                                                            e.target.value
                                                        );
                                                    setTeam(newTeam);
                                                }}
                                            />
                                            <span className="w-8 text-center font-medium text-gray-700">
                                                {member.count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Total Team Size:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {team.reduce(
                                                (acc, member) =>
                                                    acc + member.count,
                                                0
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span className="text-gray-600">
                                            Hourly Cost:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            $
                                            {team.reduce(
                                                (acc, member) =>
                                                    acc +
                                                    member.count *
                                                        member.costPerHour,
                                                0
                                            )}
                                            /hr
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span className="text-gray-600">
                                            Avg Experience:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {calculateAvgExperience(team)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Predict Button below both sections */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        onClick={handlePredict}
                        disabled={isPredicting}
                        className={`w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium shadow-lg 
              hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] 
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                    >
                        {isPredicting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Zap className="h-5 w-5" />
                                <span>Predict & Optimize</span>
                            </>
                        )}
                    </motion.button>

                    {/* Results Section below the button */}
                    {prediction && (
                        <div
                            ref={outputRef}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-3"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-xl shadow-md p-4"
                            >
                                <h2 className="text-base font-semibold mb-3">
                                    Prediction Results
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-indigo-50 rounded-lg p-4">
                                        <Clock className="h-6 w-6 text-indigo-600 mb-2" />
                                        <div className="text-sm text-gray-600">
                                            Duration
                                        </div>
                                        <div className="text-base font-semibold">
                                            {prediction.duration.days}d{" "}
                                            {prediction.duration.hours>0 &&(
                                             <p>{prediction.duration.hours}h</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <DollarSign className="h-6 w-6 text-green-600 mb-2" />
                                        <div className="text-sm text-gray-600">
                                            Estimated Cost
                                        </div>
                                        <div className="text-base font-semibold">
                                            ${prediction.cost.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <Activity className="h-6 w-6 text-blue-600 mb-2" />
                                        <div className="text-sm text-gray-600">
                                            Team Performance
                                        </div>
                                        <div className="text-base font-semibold">
                                            {prediction.performance.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div
                                        className={`rounded-lg p-4 ${
                                            prediction.riskLevel === "High"
                                                ? "bg-red-50"
                                                : prediction.riskLevel ===
                                                  "Medium"
                                                ? "bg-yellow-50"
                                                : "bg-green-50"
                                        }`}
                                    >
                                        <Target
                                            className={`h-6 w-6 mb-2 ${
                                                prediction.riskLevel === "High"
                                                    ? "text-red-600"
                                                    : prediction.riskLevel ===
                                                      "Medium"
                                                    ? "text-yellow-600"
                                                    : "text-green-600"
                                            }`}
                                        />
                                        <div className="text-sm text-gray-600">
                                            Risk Level
                                        </div>
                                        <div className="text-base font-semibold">
                                            {prediction.riskLevel}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-white rounded-xl shadow-md p-4"
                            >
                                <h2 className="text-base font-semibold mb-3 flex items-center">
                                    <LineChart className="h-5 w-5 mr-2 text-indigo-600" />
                                    Team Efficiency Analysis
                                </h2>
                                <div className="space-y-4">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${prediction.teamEfficiency}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.5,
                                            }}
                                            className="h-full bg-indigo-600"
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Team Efficiency Score</span>
                                        <span className="font-medium">
                                            {prediction.teamEfficiency}%
                                        </span>
                                    </div>
                                    <motion.button
                                        onClick={handleOptimizeTeams}
                                        disabled={isOptimizing}
                                        className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 
                      hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] 
                      px-4 rounded-lg font-medium shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isOptimizing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                                <span>Optimizing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="inline-block w-5 h-5" />
                                                <span>Optimize Teams</span>
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="bg-white rounded-xl shadow-md p-4"
                            >
                                <h2 className="text-base font-semibold mb-3 flex items-center">
                                    <BarChart className="h-5 w-5 mr-2 text-indigo-600" />
                                    Cost Breakdown
                                </h2>
                                <div className="space-y-3">
                                    {team.map(
                                        (member) =>
                                            member.count > 0 && (
                                                <div
                                                    key={member.level}
                                                    className="space-y-1"
                                                >
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">
                                                            {member.level} (
                                                            {member.count}x)
                                                        </span>
                                                        <span className="font-medium">
                                                            $
                                                            {(
                                                                member.count *
                                                                member.costPerHour *
                                                                prediction
                                                                    .duration
                                                                    .days *
                                                                8
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{
                                                                width: 0,
                                                            }}
                                                            animate={{
                                                                width: `${
                                                                    (member.count *
                                                                        member.costPerHour) /
                                                                    (prediction.cost /
                                                                        100)
                                                                }%`,
                                                            }}
                                                            transition={{
                                                                duration: 1,
                                                                delay: 0.7,
                                                            }}
                                                            className="h-full bg-indigo-600"
                                                        />
                                                    </div>
                                                </div>
                                            )
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
                {(optimizedTeams.highPerformance.length > 0 ||
                    optimizedTeams.budgetFriendly.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="bg-white rounded-xl shadow-md p-4 mt-6 space-y-6"
                    >
                        <h2 className="text-base font-semibold flex items-center text-indigo-700">
                            <Users className="h-5 w-5 mr-2" />
                            Optimized Team Recommendations
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* High Performance Teams Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                        <Zap className="h-4 w-4 mr-1 text-indigo-500" />
                                        High Performance Teams
                                    </h3>
                                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                                        Speed Optimized
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {optimizedTeams.highPerformance.map(
                                        (team, index) => (
                                            <div
                                                key={`performance-${index}`}
                                                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                                                    index === 0
                                                        ? "border-green-300 bg-green-50"
                                                        : "border-gray-200"
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-800">
                                                            {team.composition}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                                            <div className="flex items-center">
                                                                <Activity className="h-4 w-4 text-indigo-600 mr-1" />
                                                                <span className="text-sm text-gray-600">
                                                                    Performance:{" "}
                                                                    <span className="font-medium">
                                                                        {
                                                                            team.performance
                                                                        }
                                                                        %
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                                                                <span className="text-sm text-gray-600">
                                                                    Cost:{" "}
                                                                    <span className="font-medium">
                                                                        $
                                                                        {
                                                                            team.cost
                                                                        }
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {index === 0 && (
                                                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                            Recommended
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Budget Friendly Teams Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                        <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                                        Budget-Friendly Teams
                                    </h3>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                        Cost Optimized
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {optimizedTeams.budgetFriendly.map(
                                        (team, index) => (
                                            <div
                                                key={`budget-${index}`}
                                                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                                                    index === 0
                                                        ? "border-green-300 bg-green-50"
                                                        : "border-gray-200"
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-800">
                                                            {team.composition}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                                            <div className="flex items-center">
                                                                <Activity className="h-4 w-4 text-indigo-600 mr-1" />
                                                                <span className="text-sm text-gray-600">
                                                                    Performance:{" "}
                                                                    <span className="font-medium">
                                                                        {
                                                                            team.performance
                                                                        }
                                                                        %
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                                                                <span className="text-sm text-gray-600">
                                                                    Cost:{" "}
                                                                    <span className="font-medium">
                                                                        $
                                                                        {
                                                                            team.cost
                                                                        }
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {index === 0 && (
                                                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                            Recommended
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Helper guide */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Brain className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Understanding Team Composition
                                    </h3>
                                    <div className="mt-1 text-sm text-blue-700">
                                        <p>
                                            The format{" "}
                                            <strong>2J, 1M, 3S, 1TL</strong>{" "}
                                            means 2 Juniors, 1 Mid-level, 3
                                            Seniors, and 1 Tech Lead.
                                        </p>
                                        <p className="mt-1">
                                            <strong>Recommended teams</strong>{" "}
                                            are highlighted in green and
                                            represent the optimal choice in each
                                            category.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {(optimizedTeams.highPerformance.length > 0 ||
                    optimizedTeams.budgetFriendly.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="bg-white rounded-xl shadow-md p-4 mt-6 space-y-8"
                    >
                        <h2 className="text-base font-semibold flex items-center text-indigo-700">
                            <BarChart className="h-5 w-5 mr-2" />
                            Team Optimization Visualizer
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* High Performance Teams - Scatter Plot */}
                            <div className="space-y-4 flex flex-col">
                                <h3 className="text-sm font-semibold text-gray-700">
                                    High Performance Teams
                                </h3>
                                <div className="flex-grow relative">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={280}
                                    >
                                        <ScatterChart
                                            margin={{
                                                top: 20,
                                                right: 20,
                                                bottom: 40,
                                                left: 20,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                opacity={0.4}
                                            />
                                            <XAxis
                                                dataKey="cost"
                                                type="number"
                                                name="Cost"
                                                label={{
                                                    value: "Cost ($)",
                                                    position: "bottom",
                                                    offset: 5,
                                                }}
                                            />
                                            <YAxis
                                                dataKey="performance"
                                                type="number"
                                                name="Performance"
                                                label={{
                                                    value: "Performance (%)",
                                                    angle: -90,
                                                    position: "left",
                                                }}
                                            />
                                            <ZAxis dataKey="composition" />
                                            <Tooltip
                                                cursor={{
                                                    strokeDasharray: "3 3",
                                                }}
                                                content={({
                                                    active,
                                                    payload,
                                                }) => {
                                                    if (
                                                        active &&
                                                        payload &&
                                                        payload.length
                                                    ) {
                                                        return (
                                                            <div className="bg-white p-3 border rounded shadow-md text-sm">
                                                                <p className="font-semibold">
                                                                    Team:{" "}
                                                                    {
                                                                        payload[0]
                                                                            .payload
                                                                            .composition
                                                                    }
                                                                </p>
                                                                <p className="text-indigo-600">
                                                                    Performance:{" "}
                                                                    {
                                                                        payload[0]
                                                                            .payload
                                                                            .performance
                                                                    }
                                                                    %
                                                                </p>
                                                                <p className="text-green-600">
                                                                    Cost: $
                                                                    {
                                                                        payload[0]
                                                                            .payload
                                                                            .cost
                                                                    }
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Scatter
                                                name="High Performance Teams"
                                                data={
                                                    optimizedTeams.highPerformance
                                                }
                                                fill="#4F46E5"
                                                shape="circle"
                                            />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Custom Legend */}
                                <div className="flex justify-center mt-2">
                                    <div className="bg-gray-50 px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
                                        <span className="text-sm text-gray-700">
                                            High Performance Teams
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Budget Friendly Teams - Composed Chart */}
                            <div className="space-y-4 flex flex-col">
                                <h3 className="text-sm font-semibold text-gray-700">
                                    Budget-Friendly Teams
                                </h3>
                                <div className="flex-grow relative">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={280}
                                    >
                                        <ComposedChart
                                            data={optimizedTeams.budgetFriendly}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="composition"
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                interval={0}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                orientation="left"
                                                stroke="#4F46E5"
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                stroke="#10B981"
                                            />
                                            <Tooltip
                                                content={({
                                                    active,
                                                    payload,
                                                }) => {
                                                    if (
                                                        active &&
                                                        payload &&
                                                        payload.length
                                                    ) {
                                                        return (
                                                            <div className="bg-white p-3 border rounded shadow-md text-sm">
                                                                <p className="font-semibold">
                                                                    Team:{" "}
                                                                    {
                                                                        payload[0]
                                                                            .payload
                                                                            .composition
                                                                    }
                                                                </p>
                                                                <p className="text-indigo-600">
                                                                    Performance:{" "}
                                                                    {
                                                                        payload[0]
                                                                            .value
                                                                    }
                                                                    %
                                                                </p>
                                                                <p className="text-green-600">
                                                                    Cost: $
                                                                    {
                                                                        payload[1]
                                                                            .value
                                                                    }
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="performance"
                                                fill="#c7d2fe"
                                                stroke="#4F46E5"
                                                yAxisId="left"
                                                name="Performance %"
                                            />
                                            <Bar
                                                dataKey="cost"
                                                fill="#10B981"
                                                yAxisId="right"
                                                name="Cost ($)"
                                                barSize={20}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Custom Legend */}
                                <div className="flex justify-center mt-2 flex-wrap gap-2">
                                    <div className="bg-gray-50 px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
                                        <span className="text-sm text-gray-700">
                                            Performance %
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center">
                                        <div className="w-3 h-3 rounded bg-green-500 mr-2"></div>
                                        <span className="text-sm text-gray-700">
                                            Cost ($)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Combined Cost vs Performance Comparison */}
                        <div className="pt-4 border-t border-gray-200 flex flex-col">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                Cost vs. Performance Comparison
                            </h3>
                            <div className="flex-grow relative">
                                <ResponsiveContainer width="100%" height={350}>
                                    <ScatterChart
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            bottom: 20,
                                            left: 30,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            dataKey="cost"
                                            name="Cost"
                                            domain={[
                                                "dataMin - 100",
                                                "dataMax + 100",
                                            ]}
                                            label={{
                                                value: "Cost ($)",
                                                position: "bottom",
                                                offset: 5,
                                            }}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="performance"
                                            name="Performance"
                                            domain={[0, 100]}
                                            label={{
                                                value: "Performance (%)",
                                                angle: -90,
                                                position: "insideLeft",
                                                offset: -10,
                                            }}
                                        />
                                        <ZAxis
                                            type="number"
                                            range={[60, 400]}
                                            scale="linear"
                                            dataKey="index"
                                        />
                                        <Tooltip
                                            cursor={{ strokeDasharray: "3 3" }}
                                            content={({ active, payload }) => {
                                                if (
                                                    active &&
                                                    payload &&
                                                    payload.length
                                                ) {
                                                    return (
                                                        <div className="bg-white p-3 border rounded shadow-md text-sm">
                                                            <p className="font-semibold">
                                                                Team:{" "}
                                                                {
                                                                    payload[0]
                                                                        .payload
                                                                        .composition
                                                                }
                                                            </p>
                                                            <p className="text-gray-700">
                                                                Performance:{" "}
                                                                {
                                                                    payload[0]
                                                                        .payload
                                                                        .performance
                                                                }
                                                                %
                                                            </p>
                                                            <p className="text-gray-700">
                                                                Cost: $
                                                                {
                                                                    payload[0]
                                                                        .payload
                                                                        .cost
                                                                }
                                                            </p>
                                                            <p className="text-gray-500 text-xs mt-1">
                                                                Click for
                                                                details
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Scatter
                                            name="High Performance Teams"
                                            data={optimizedTeams.highPerformance.map(
                                                (item, index) => ({
                                                    ...item,
                                                    index,
                                                })
                                            )}
                                            fill="#4F46E5"
                                            shape="circle"
                                        />
                                        <Scatter
                                            name="Budget-Friendly Teams"
                                            data={optimizedTeams.budgetFriendly.map(
                                                (item, index) => ({
                                                    ...item,
                                                    index,
                                                })
                                            )}
                                            fill="#10B981"
                                            shape="triangle"
                                        />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Custom Legend for Combined Chart */}
                            <div className="flex justify-center items-center mt-4 flex-wrap gap-3">
                                <div className="bg-gray-50 px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
                                    <span className="text-sm text-gray-700">
                                        High Performance Teams
                                    </span>
                                </div>
                                <div className="bg-gray-50 px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center">
                                    <div className="w-3 h-3 rounded bg-green-500 mr-2 transform rotate-45"></div>
                                    <span className="text-sm text-gray-700">
                                        Budget-Friendly Teams
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

export default App;
