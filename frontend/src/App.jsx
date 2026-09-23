import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import axios from "axios";
import { ConfluenceView } from "./components/ConfluenceView";

// Global Axios Interceptor to inject JWT authentication token automatically on outgoing requests
axios.interceptors.request.use(
  (config) => {
    // Dynamically rewrite localhost URLs to production API URL if hosted on Render
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    if (config.url && config.url.startsWith("http://localhost:5001")) {
      config.url = config.url.replace("http://localhost:5001", apiBaseUrl);
    }

    const token = localStorage.getItem("apnileap-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Modern Lucide Icon setup
import {
  ListTodo,
  PieChart as LucidePieChart,
  Bell,
  Search,
  Filter,
  Plus,
  X,
  Check,
  Trash2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Mail,
  Send,
  AlertTriangle,
  Sun,
  Moon,
  Briefcase,
  Lock,
  User,
  Users,
  Home,
  Book,
  Calendar,
  MessageSquare,
  GraduationCap,
  Settings,
  Crown,
  Bug,
  ClipboardList,
  Inbox,
  Hourglass,
  CheckCircle,
  Link as LucideLink,
  FolderOpen,
  Medal,
  Building2,
  Globe,
  Wrench,
  Zap,
  Star,
  DollarSign,
  Clock,
  Tag,
  AlertCircle,
  List,
  Monitor,
  School,
  Paperclip,
  Flag,
  LogOut,
  UserCheck,
  UserX
} from "lucide-react";

const FaSignOutAlt = LogOut;
const FaUserCheck = UserCheck;
const FaUserX = UserX;

// Alias mapping for FontAwesome to Lucide components
const FaTasks = ListTodo;
const FaChartPie = LucidePieChart;
const FaBell = Bell;
const FaSearch = Search;
const FaFilter = Filter;
const FaPlus = Plus;
const FaTimes = X;
const FaCheck = Check;
const FaTrashAlt = Trash2;
const FaSyncAlt = RotateCw;
const FaChevronLeft = ChevronLeft;
const FaChevronRight = ChevronRight;
const FaChevronDown = ChevronDown;
const FaChevronUp = ChevronUp;
const FaInfoCircle = Info;
const FaRegLightbulb = Lightbulb;
const FaEnvelope = Mail;
const FaPaperPlane = Send;
const FaExclamationTriangle = AlertTriangle;
const FaSun = Sun;
const FaMoon = Moon;
const FaBriefcase = Briefcase;
const FaLock = Lock;
const FaUser = User;
const FaUsers = Users;
const FaHome = Home;
const FaBook = Book;
const FaCalendarAlt = Calendar;
const FaComments = MessageSquare;
const FaGraduationCap = GraduationCap;
const FaCog = Settings;
const FaCrown = Crown;
const FaBug = Bug;
const FaClipboardList = ClipboardList;
const FaInbox = Inbox;
const FaHourglassHalf = Hourglass;
const FaCheckCircle = CheckCircle;
const FaLink = LucideLink;
const FaCommentAlt = MessageSquare;
const FaFolderOpen = FolderOpen;
const FaMedal = Medal;
const FaBuilding = Building2;
const FaGlobe = Globe;
const FaWrench = Wrench;
const FaTools = Wrench;
const FaBolt = Zap;
const FaStar = Star;
const FaDollarSign = DollarSign;
const FaClock = Clock;
const FaTags = Tag;
const FaExclamationCircle = AlertCircle;
const FaListUl = List;
const FaDesktop = Monitor;
const FaSchool = School;
const FaUniversity = School;
const FaPaperclip = Paperclip;
const FaFlag = Flag;

let toastIdCounter = 0;

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Utility date calculator to evaluate task deadline details
const getDeadlineInfo = (dueDate, statusName) => {
  if (!dueDate) return null;
  if (statusName === "Done") {
    return { text: "Completed", type: "completed" };
  }

  const today = new Date("2026-05-26"); // Project baseline local time context
  const due = new Date(dueDate);

  // Reset hours to evaluate day differences only
  const dToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffTime = dDue.getTime() - dToday.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Overdue by ${Math.abs(diffDays)}d`, type: "overdue" };
  } else if (diffDays === 0) {
    return { text: "Due Today", type: "soon" };
  } else if (diffDays <= 2) {
    return { text: `Due in ${diffDays}d`, type: "soon" };
  } else {
    return { text: `${diffDays} days left`, type: "on-track" };
  }
};

// Utility company/sponsor evaluator to load high-fidelity brand logo icons for tasks
const getSponsorCompany = (task) => {
  if (!task) return null;
  const summary = (task.fields?.summary || "").toLowerCase();
  const description = (task.fields?.description || "").toLowerCase();
  
  if (summary.includes("company 1") || description.includes("company 1") || summary.includes("nvidia")) return { name: "Company 1", logo: "https://ui-avatars.com/api/?name=C1&background=76b900&color=fff" };
  if (summary.includes("intel") || description.includes("intel")) return { name: "Intel", logo: "https://logo.clearbit.com/intel.com?size=32" };
  if (summary.includes("google") || description.includes("google")) return { name: "Google", logo: "https://logo.clearbit.com/google.com?size=32" };
  
  // Epic parent checking
  const epic = (task.fields?.epic?.fields?.summary || task.fields?.epic?.name || "").toLowerCase();
  if (epic.includes("company 1") || epic.includes("nvidia")) return { name: "Company 1", logo: "https://ui-avatars.com/api/?name=C1&background=76b900&color=fff" };
  if (epic.includes("intel")) return { name: "Intel", logo: "https://logo.clearbit.com/intel.com?size=32" };
  if (epic.includes("google")) return { name: "Google", logo: "https://logo.clearbit.com/google.com?size=32" };
  
  // Custom field color tags fallback
  const c = task.fields?.customfield_10017 || "";
  if (c === "blue" || c === "green") return { name: "Company 1", logo: "https://ui-avatars.com/api/?name=C1&background=76b900&color=fff" };
  if (c === "teal") return { name: "Intel", logo: "https://logo.clearbit.com/intel.com?size=32" };
  
  return { name: "Company 1", logo: "https://ui-avatars.com/api/?name=C1&background=76b900&color=fff" };
};

// Failsafe, high-fidelity inline SVGs and styled brand emblems for sponsor companies
const CompanyLogo = ({ company, size = 38 }) => {
  const norm = (company || "").toLowerCase();
  
  if (norm.includes("company 1") || norm.includes("nvidia")) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "8px",
        background: "#162402",
        border: "1.5px solid #76b900",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 12px rgba(118, 185, 0, 0.25)",
        flexShrink: 0
      }} title="Company 1 Sponsor">
        <svg viewBox="0 0 24 24" style={{ width: `${size * 0.55}px`, height: `${size * 0.55}px`, fill: "#76b900" }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.5h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      </div>
    );
  }
  
  if (norm.includes("intel")) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "8px",
        background: "#011528",
        border: "1.5px solid #0068b5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 12px rgba(0, 104, 181, 0.25)",
        flexShrink: 0
      }} title="Intel Sponsor">
        <svg viewBox="0 0 24 24" style={{ width: `${size * 0.55}px`, height: `${size * 0.55}px`, fill: "#0068b5" }}>
          <path d="M12 .5C5.649.5.5 5.649.5 12c0 6.351 5.149 11.5 11.5 11.5s11.5-5.149 11.5-11.5c0-6.351-5.149-11.5-11.5-11.5zm-2.5 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      </div>
    );
  }
  
  if (norm.includes("google")) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "8px",
        background: "#1e293b",
        border: "1.5px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 10px rgba(255, 255, 255, 0.05)",
        flexShrink: 0
      }} title="Google Sponsor">
        <svg viewBox="0 0 24 24" style={{ width: `${size * 0.55}px`, height: `${size * 0.55}px` }}>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
      </div>
    );
  }
  
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "8px",
      background: "var(--primary)",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "800",
      fontSize: `${size * 0.4}px`,
      flexShrink: 0
    }}>
      {company.substring(0, 1).toUpperCase()}
    </div>
  );
};

const SPOKES = {
  "3": { name: "KLE Spoke", key: "AK", live: true },
  "101": { name: "COEP Spoke", key: "AK", live: true },
  "102": { name: "MMCOEP Spoke", key: "AK", live: true },
  "103": { name: "RIT Spoke", key: "AK", live: true }
};

const CAMPUS_LABELS = {
  "3": "kle-spoke",
  "101": "coep-spoke",
  "102": "mmcoep-spoke",
  "103": "rit-spoke"
};

function CohortStatsTable() {
  const [cohortStats, setCohortStats] = useState(null);
  const [cohortLoading, setCohortLoading] = useState(false);
  const [cohortError, setCohortError] = useState(null);

  useEffect(() => {
    setCohortLoading(true);
    setCohortError(null);
    axios.get("http://localhost:5001/api/cohort-stats")
      .then(res => {
        if (res.data && res.data.success) setCohortStats(res.data);
        else setCohortError("Failed to load stats.");
      })
      .catch(() => setCohortError("Could not reach backend."))
      .finally(() => setCohortLoading(false));
  }, []);

  if (cohortLoading) return (
    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "var(--primary)", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontSize: "12.5px" }}>Loading live cohort data...</p>
    </div>
  );

  if (cohortError) return (
    <div style={{ padding: "20px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", textAlign: "center", color: "#ef4444", fontSize: "12.5px" }}>
      {cohortError}
    </div>
  );

  const stats = cohortStats?.stats || [];
  const top = cohortStats?.topPerformer;

  const progressColor = (pct) => {
    if (pct >= 60) return "var(--status-done-text)";
    if (pct >= 30) return "var(--status-progress-text)";
    return "var(--status-backlog-text)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <th style={{ textAlign: "left", padding: "10px", color: "var(--text-muted)" }}>Campus Institution</th>
            <th style={{ textAlign: "center", padding: "10px", color: "var(--text-muted)" }}>Student Cohort</th>
            <th style={{ textAlign: "center", padding: "10px", color: "var(--text-muted)" }}>Faculty Mentors</th>
            <th style={{ textAlign: "center", padding: "10px", color: "var(--text-muted)" }}>Sponsor Projects</th>
            <th style={{ textAlign: "right", padding: "10px", color: "var(--text-muted)" }}>Avg. Task Progress</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.boardId} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "12px 10px", fontWeight: "700", color: "var(--text-main)" }}>
                {s.label}
                {top && top.boardId === s.boardId && s.taskProgress > 0 && (
                  <span style={{ marginLeft: "6px", fontSize: "9px", background: "rgba(16,185,129,0.12)", color: "#10b981", padding: "2px 6px", borderRadius: "4px", fontWeight: "800", verticalAlign: "middle" }}>TOP</span>
                )}
              </td>
              <td style={{ textAlign: "center", padding: "12px 10px", color: "var(--text-muted)" }}>
                {s.studentCount} Student{s.studentCount !== 1 ? "s" : ""}
              </td>
              <td style={{ textAlign: "center", padding: "12px 10px", color: "var(--text-muted)" }}>
                {s.mentorCount} Mentor{s.mentorCount !== 1 ? "s" : ""}
              </td>
              <td style={{ textAlign: "center", padding: "12px 10px", color: "var(--text-muted)" }}>
                {s.activeProjectCount} Project{s.activeProjectCount !== 1 ? "s" : ""}
              </td>
              <td style={{ textAlign: "right", padding: "12px 10px", fontWeight: "700", color: progressColor(s.taskProgress) }}>
                {s.taskProgress}%
                <div style={{ fontSize: "9px", color: "var(--text-dim)", fontWeight: "500", marginTop: "2px" }}>
                  {s.doneTasks}/{s.totalTasks} tasks
                </div>
              </td>
            </tr>
          ))}
          {stats.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "var(--text-dim)", fontStyle: "italic", fontSize: "12.5px" }}>
                No cohort data available yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {top && top.taskProgress > 0 && (
        <div style={{ background: "var(--bg-subtle)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-subtle)", marginTop: "8px" }}>
          <h4 style={{ fontWeight: "700", fontSize: "13px", color: "var(--text-main)", marginBottom: "6px" }}>🏆 Top Performing Cohort</h4>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: "1.4" }}>
            <strong>{top.label}</strong> is leading portfolio progress with{" "}
            <strong>{top.taskProgress}% avg completion rate</strong> across{" "}
            {top.totalTasks} scheduled milestone task{top.totalTasks !== 1 ? "s" : ""} ({top.doneTasks} done).
          </p>
        </div>
      )}

      {top && top.taskProgress === 0 && (
        <div style={{ background: "var(--bg-subtle)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-subtle)", marginTop: "8px", textAlign: "center" }}>
          <p style={{ fontSize: "12.5px", color: "var(--text-dim)", fontStyle: "italic" }}>
            No sprint tasks completed across spokes yet. Progress will appear as students complete work.
          </p>
        </div>
      )}
    </div>
  );
}

const RovoIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.8 1.5C23.6 1 24.4 1 25.2 1.5L42.1 11.2C42.8 11.7 43.3 12.5 43.3 13.3V34.7C43.3 35.5 42.8 36.3 42.1 36.8L25.2 46.5C24.4 47 23.6 47 22.8 46.5L5.9 36.8C5.2 36.3 4.7 35.5 4.7 34.7V13.3C4.7 12.5 5.2 11.7 5.9 11.2L22.8 1.5Z" fill="var(--primary)"/>
    <path d="M22 13V22C22 25 24 27 27 28V35C27 32 25 30 22 29V20C22 17 20 15 17 14V7C17 10 19 12 22 13Z" fill="white"/>
    <path d="M28 35V26C28 23 26 21 23 20V13C23 16 25 18 28 19V28C28 31 30 33 33 34V41C33 38 31 36 28 35Z" fill="white"/>
  </svg>
);

function RovoAgentWidget({ sessionUser, currentBoardId, activeWorkspace }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "agent", content: "Hi! I'm the ApniLeap Rovo Dashboard Agent. How can I help you today?" }
  ]);
  const [prompt, setPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  let starters = [];
  if (sessionUser?.role === "Corporate Sponsor" || sessionUser?.role === "Corporate Partner") {
    starters = [
      "Create a project to build an AI chatbot",
      "Show me the top performing student developers",
      "What are my upcoming syncs?"
    ];
  } else if (sessionUser?.role === "Spoke Coordinator") {
    starters = [
      "What changed this week?",
      "Show me blocked items",
      "What are my upcoming syncs?"
    ];
  } else if (sessionUser?.role === "Student Developer" || sessionUser?.role === "Project Manager") {
    starters = [
      "Summarize my team's progress",
      "Show me blocked items",
      "What are my upcoming syncs?"
    ];
  } else {
    // Portfolio Manager, ApniLeap Admin, default
    starters = [
      "Which college has the highest execution risk?",
      "Draft the monthly FIP review.",
      "What changed this week?"
    ];
  }

  const handleSend = async (text) => {
    if (!text.trim()) return;
    const newChat = [...chatHistory, { role: "user", content: text }];
    setChatHistory(newChat);
    setPrompt("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:5001/api/rovo/chat", {
        prompt: text,
        userRole: sessionUser?.role,
        campusId: currentBoardId,
        activeWorkspace,
        companyName: sessionUser?.company
      });
      if (res.data && res.data.success) {
        setChatHistory([...newChat, { role: "agent", content: res.data.response }]);
      } else {
        setChatHistory([...newChat, { role: "agent", content: "Sorry, I ran into an error pulling those insights." }]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory([...newChat, { role: "agent", content: "Sorry, I am having trouble connecting to the hub." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h4 key={i} style={{ margin: "12px 0 4px 0", color: "var(--primary)" }}>{line.replace('### ', '')}</h4>;
      if (line.startsWith('## ')) return <h3 key={i} style={{ margin: "16px 0 6px 0", color: "var(--primary)" }}>{line.replace('## ', '')}</h3>;
      if (line.startsWith('- ')) {
        const parts = line.replace('- ', '').split('**');
        return <li key={i} style={{ marginLeft: "16px", marginBottom: "4px" }}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
        </li>;
      }
      if (line.trim() === "") return <br key={i} />;
      
      const parts = line.split('**');
      return <p key={i} style={{ margin: "0 0 8px 0" }}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
      </p>;
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", bottom: "30px", right: "30px",
          width: "60px", height: "60px", borderRadius: "30px",
          background: "#ffffff",
          color: "var(--primary)", border: "1px solid var(--border-glass)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 9999, transition: "transform 0.2s"
        }}
        onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <RovoIcon size={32} />
      </button>

      {isOpen && (
        <div className="fade-in" style={{
          position: "fixed", bottom: "100px", right: "30px",
          width: "420px", height: "600px",
          background: "var(--bg-card)", border: "1px solid var(--border-glass)",
          borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 9999
        }}>
          {/* Header */}
          <div style={{ padding: "16px", background: "var(--bg-card)", borderBottom: "1px solid var(--border-glass)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#ffffff", border: "1px solid var(--border-glass)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RovoIcon size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: "var(--text-main)", fontSize: "15px", fontWeight: "800" }}>ApniLeap Rovo Agent</h4>
                <div style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "600" }}>AI Operating Assistant</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "24px", lineHeight: "1" }}>×</button>
          </div>

          {/* Chat History */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? "var(--primary)" : "rgba(255, 255, 255, 0.03)",
                color: msg.role === "user" ? "white" : "var(--text-main)",
                padding: "12px 16px",
                borderRadius: "12px",
                border: msg.role === "agent" ? "1px solid var(--border-glass)" : "none",
                maxWidth: "85%",
                fontSize: "13.5px",
                lineHeight: "1.5"
              }}>
                {msg.role === "agent" ? renderContent(msg.content) : msg.content}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: "flex-start", background: "rgba(255, 255, 255, 0.03)", color: "var(--text-muted)", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-glass)", fontSize: "13.5px" }}>
                <span className="pulse-glow">Generating insights...</span>
              </div>
            )}
          </div>

          {/* Starters */}
          {chatHistory.length === 1 && (
            <div style={{ padding: "0 20px 10px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>Conversation Starters</div>
              {starters.map((s, idx) => (
                <button key={idx} onClick={() => handleSend(s)} style={{ textAlign: "left", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", padding: "10px 12px", borderRadius: "8px", color: "var(--primary)", fontSize: "12.5px", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"} onMouseOut={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"}>
                  "{s}"
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "16px", borderTop: "1px solid var(--border-glass)", display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(prompt)}
              placeholder="Ask Rovo to summarize or detect risk..."
              style={{ flex: 1, background: "rgba(0, 0, 0, 0.2)", border: "1px solid var(--border-glass)", color: "var(--text-main)", padding: "12px 16px", borderRadius: "20px", fontSize: "13px", outline: "none" }}
            />
            <button 
              onClick={() => handleSend(prompt)}
              style={{ width: "42px", height: "42px", borderRadius: "21px", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  // Authentication & Session States
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const auth = localStorage.getItem("apnileap-auth") === "true";
    const token = localStorage.getItem("apnileap-token");
    const userStr = localStorage.getItem("apnileap-user");
    return Boolean(auth && token && userStr && userStr !== "undefined" && userStr !== "null");
  });

  // Public Landing Page & Redirection States
  const [viewMode, setViewMode] = useState(() => {
    const auth = localStorage.getItem("apnileap-auth") === "true";
    const token = localStorage.getItem("apnileap-token");
    const userStr = localStorage.getItem("apnileap-user");
    return (auth && token && userStr && userStr !== "undefined" && userStr !== "null") ? "dashboard" : "landing";
  });
  const [landingTab, setLandingTab] = useState("home"); // "home", "about", "collaboration", "contact", "login"
  const [portalModal, setPortalModal] = useState(null); // null, "academia", "industries", "startups"

  // Form submission state for Contact Us
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [sessionUser, setSessionUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("apnileap-user")) || null;
    } catch {
      return null;
    }
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Student & Faculty registration states
  const [showSignup, setShowSignup] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupCampus, setSignupCampus] = useState("3"); // Default to "3" (KLE Spoke)
  const [signupRole, setSignupRole] = useState("Student Developer"); // "Student Developer" or "Faculty Mentor"
  const [signupError, setSignupError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationNotice, setRegistrationNotice] = useState(null); // { title, role, campus, approver, message }

  // Campus Coordinator Pending Faculty Verifications state
  const [pendingFacultyList, setPendingFacultyList] = useState([]);
  const [isPendingFacultyLoading, setIsPendingFacultyLoading] = useState(false);

  // Navigation & UI States
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard" or "kanban"
  const [activeCoordinatorTab, setActiveCoordinatorTab] = useState("analytics"); // "analytics", "team", "projects", or "faculty-approvals"
  const [showNotifications, setShowNotifications] = useState(false);

  // Faculty Coordinator Add Team Member form states
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Faculty Coordinator Assign Sprint Task form states
  const [selectedEpicForTask, setSelectedEpicForTask] = useState("");
  const [newSprintTaskTitle, setNewSprintTaskTitle] = useState("");
  const [newSprintTaskAssignee, setNewSprintTaskAssignee] = useState("");
  const [newSprintTaskPriority, setNewSprintTaskPriority] = useState("Medium");
  const [newSprintTaskDueDate, setNewSprintTaskDueDate] = useState("");
  const [newSprintTaskDesc, setNewSprintTaskDesc] = useState("");
  const [isCreatingSprintTask, setIsCreatingSprintTask] = useState(false);

  // Faculty Coordinator Custom Teams Builder states
  const [spokeTeams, setSpokeTeams] = useState([]);
  const [isTeamsLoading, setIsTeamsLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [selectedTeamMentor, setSelectedTeamMentor] = useState("");
  const [selectedTeamLeader, setSelectedTeamLeader] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem("app-theme") || "dark");

  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    const auth = localStorage.getItem("apnileap-auth") === "true";
    const token = localStorage.getItem("apnileap-token");
    const userStr = localStorage.getItem("apnileap-user");
    if (auth && token && userStr && userStr !== "undefined" && userStr !== "null") {
      const persona = localStorage.getItem("apnileap-persona") || "moderator";
      if (persona === "executive") return "hub";
      if (persona === "moderator") return "moderator";
      return persona;
    }
    return "hub";
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentPersona, setCurrentPersona] = useState(() => {
    return localStorage.getItem("apnileap-persona") || "moderator";
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [hasError, setHasError] = useState(false);

  // Dynamic Spoke Management (PostgreSQL synced via /api/spokes)
  const [spokesList, setSpokesList] = useState([]);
  const [dynamicSpokes, setDynamicSpokes] = useState(SPOKES);
  const [dynamicCampusLabels, setDynamicCampusLabels] = useState(CAMPUS_LABELS);
  const [moderatorActiveTab, setModeratorActiveTab] = useState("proposals");

  const fetchSpokes = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/spokes");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setSpokesList(res.data);
        const map = { ...SPOKES };
        const labels = { ...CAMPUS_LABELS };
        res.data.forEach(s => {
          map[s.id] = { name: s.name, key: s.key || "AK", live: s.live !== false, boardId: s.boardId || 2 };
          if (!labels[s.id]) {
            const slug = s.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            labels[s.id] = slug + "-spoke";
          }
        });
        setDynamicSpokes(map);
        setDynamicCampusLabels(labels);
      }
    } catch (err) {
      console.warn("Using default static spokes as fallback:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchSpokes();
  }, [fetchSpokes]);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Project Ingest Form State
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [ingestCompany, setIngestCompany] = useState("Company 1");
  const [ingestTitle, setIngestTitle] = useState("");
  const [ingestDescription, setIngestDescription] = useState("");
  const [ingestBudget, setIngestBudget] = useState("");
  const [ingestDuration, setIngestDuration] = useState("");
  const [ingestDueDate, setIngestDueDate] = useState("2026-08-25");
  const [isIngesting, setIsIngesting] = useState(false);

  // Project Edit Form State
  const [editingProject, setEditingProject] = useState(null);
  const [editCompany, setEditCompany] = useState("Company 1");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editDueDate, setEditDueDate] = useState("2026-08-25");
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);

  // Chat message history state (real-time from MongoDB)
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState("");

  const fetchChatMessages = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/chat");
      if (res.data && res.data.success) {
        setChatMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch live chat messages", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchChatMessages();
    // Poll every 3 seconds for real-time updates
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendChatMessage = async () => {
    if (!newChatMessage.trim()) return;
    const typed = newChatMessage;
    setNewChatMessage(""); // Optimistically clear input

    const myName = sessionUser ? `${sessionUser.displayName} (${sessionUser.campusName || "Hub"})` : "Moderator";
    const myCampus = sessionUser ? (sessionUser.campusName || "Hub") : "Moderator Console";

    try {
      await axios.post("http://localhost:5001/api/chat", {
        sender: myName,
        message: typed,
        campus: myCampus
      });
      // Immediately fetch latest after sending
      fetchChatMessages();
    } catch (err) {
      console.error("Failed to send chat message", err);
      triggerToast("Failed to send message.", "error");
    }
  };

  const [hubMetrics, setHubMetrics] = useState(null);
  const [isHubLoading, setIsHubLoading] = useState(true);

  // Moderator Project Assignment states
  const [moderatorProjects, setModeratorProjects] = useState([]);
  const [isModeratorLoading, setIsModeratorLoading] = useState(false);
  const [selectedAssignProject, setSelectedAssignProject] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTargetCampus, setAssignTargetCampus] = useState(["3"]);
  const [assignDueDate, setAssignDueDate] = useState("2026-08-25");
  const [allocationPhases, setAllocationPhases] = useState([]);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isRespondingToProject, setIsRespondingToProject] = useState(false);

  // Collaborative Sync Meetings states
  const [meetings, setMeetings] = useState([]);
  const [isMeetingsLoading, setIsMeetingsLoading] = useState(false);

  const currentBoardId = useMemo(() => {
    if (activeWorkspace === "spoke-coep") return "101";
    if (activeWorkspace === "spoke-mmcoep") return "102";
    if (activeWorkspace === "spoke-rit") return "103";
    if (activeWorkspace === "spoke-kle") return "3";
    if (activeWorkspace && activeWorkspace.startsWith("spoke-")) {
      const id = activeWorkspace.replace("spoke-", "");
      if (dynamicSpokes[id]) return id;
    }
    if (activeWorkspace === "faculty-mentor" && sessionUser) {
      return String(sessionUser.spokeId || sessionUser.campusId || "3");
    }
    return "3"; // default playground or fallback
  }, [activeWorkspace, sessionUser, dynamicSpokes]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  // Role-Based Access Control Simulation Guard
  useEffect(() => {
    Promise.resolve().then(() => {
      if (currentPersona === "executive") {
        setActiveWorkspace("hub");
        setActiveView("dashboard");
      } else if (currentPersona === "moderator") {
        setActiveWorkspace("moderator");
        setActiveView("dashboard");
      } else {
        setActiveWorkspace(currentPersona);
        setActiveView("dashboard");
      }
    });
  }, [currentPersona]);


  // Core Data States
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [spokeMembers, setSpokeMembers] = useState([]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterAssignee, setFilterAssignee] = useState("All");
  const [filterProject, setFilterProject] = useState("All");
  const [activeCustomBoardId, setActiveCustomBoardIdState] = useState(null);
  const activeCustomBoardIdRef = useRef(null);
  const setActiveCustomBoardId = (val) => { activeCustomBoardIdRef.current = val; setActiveCustomBoardIdState(val); };
  
  const [activeCustomBoardTitle, setActiveCustomBoardTitle] = useState("");


  // Modal States & Premium Multi-tab details
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [modalTab, setModalTab] = useState("overview"); // "overview", "subtasks", "worklog", "links"
  const [submissions, setSubmissions] = useState([]);
  const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [submitFileName, setSubmitFileName] = useState("");
  const [submitFileUrl, setSubmitFileUrl] = useState("");
  const [submitComments, setSubmitComments] = useState("");
  const [isSubmittingDeliverable, setIsSubmittingDeliverable] = useState(false);
  const [submitMode, setSubmitMode] = useState("file"); // "file" | "link"
  const [submitFile, setSubmitFile] = useState(null); // File object when mode=file
  const [worklogHistory, setWorklogHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [worklogTimeSpent, setWorklogTimeSpent] = useState("");
  const [worklogComment, setWorklogComment] = useState("");
  const [subtaskInputSummary, setSubtaskInputSummary] = useState("");
  const [subtaskAssigneeId, setSubtaskAssigneeId] = useState("");
  const [linkTargetKey, setLinkTargetKey] = useState("");
  const [linkRelationType, setLinkRelationType] = useState("blocks");
  const [labelInputString, setLabelInputString] = useState("");

  // Email Alert States
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailTask, setEmailTask] = useState(null);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailAnimationState, setEmailAnimationState] = useState(""); // "preparing", "sending", "sent"

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Create Task Form State
  const [newSummary, setNewSummary] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIssueType, setNewIssueType] = useState("Task");
  const [newAssignee, setNewAssignee] = useState("");
  const [newReporter, setNewReporter] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newStatus, setNewStatus] = useState("To Do");
  const [newDueDate, setNewDueDate] = useState("");

  // Trigger Toast Notification
  const triggerToast = (message, type = "success") => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const mapEmailToPersona = (email) => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === "admin@apnileap.com" || cleanEmail === "executive@apnileap.com" || cleanEmail === "executive") {
      return "executive";
    }
    if (cleanEmail === "moderator@apnileap.com" || cleanEmail === "moderator" || cleanEmail.endsWith("@apnileap.com")) {
      return "moderator";
    }
    if (cleanEmail.includes("sponsor") || cleanEmail.includes("nvidia")) {
      return "sponsor-nvidia";
    }
    if (cleanEmail.includes("kle") || cleanEmail.endsWith("@kletech.ac.in")) {
      return "spoke-kle";
    }
    if (cleanEmail.includes("mmcoep")) {
      return "spoke-mmcoep";
    }
    if (cleanEmail.includes("coep")) {
      return "spoke-coep";
    }
    if (cleanEmail.includes("rit")) {
      return "spoke-rit";
    }
    return null;
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim()) {
      setLoginError("Please enter your email address.");
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError("Please enter your password.");
      return;
    }
    if (showOtpInput && !loginOtp.trim()) {
      setLoginError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await axios.post("http://localhost:5001/api/login", {
        email: loginEmail,
        password: loginPassword,
        otp: showOtpInput ? loginOtp : undefined
      });

      if (response.data.require2FA) {
          setShowOtpInput(true);
          triggerToast(response.data.message || "OTP sent to email. Please verify.", "success");
          setIsLoggingIn(false);
          return;
      }

      const { user, token } = response.data;
      setIsAuthenticated(true);
      setViewMode("dashboard");
      setSessionUser(user);
      setCurrentPersona(user.persona);
      setActiveWorkspace(user.persona === "executive" ? "hub" : user.persona === "moderator" ? "moderator" : user.persona);

      localStorage.setItem("apnileap-auth", "true");
      localStorage.setItem("apnileap-user", JSON.stringify(user));
      localStorage.setItem("apnileap-persona", user.persona);
      if (token) {
        localStorage.setItem("apnileap-token", token);
      }

      triggerToast(`Logged in successfully as ${user.displayName}!`);
    } catch (err) {
      console.error("Login Failure:", err);
      const errMsg = err.response?.data?.error || "Connection failure. Please check if your backend is running on port 5001.";
      setLoginError(errMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchPendingFaculty = useCallback(async (boardId = null) => {
    const targetSpoke = boardId || currentBoardId || "3";
    try {
      setIsPendingFacultyLoading(true);
      const res = await axios.get(`http://localhost:5001/api/spokes/${targetSpoke}/pending-faculty`);
      setPendingFacultyList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch pending faculty:", err);
    } finally {
      setIsPendingFacultyLoading(false);
    }
  }, [currentBoardId]);

  const handleApproveFaculty = async (userId, userName) => {
    try {
      const res = await axios.post(`http://localhost:5001/api/users/${userId}/approve`);
      triggerToast(res.data.message || `Approved ${userName}!`, "success");
      fetchPendingFaculty();
      if (typeof fetchJiraTasks === "function") fetchJiraTasks(true);
    } catch (err) {
      triggerToast("Failed to approve faculty.", "error");
    }
  };

  const handleRejectFaculty = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to decline ${userName}'s faculty registration?`)) return;
    try {
      const res = await axios.post(`http://localhost:5001/api/users/${userId}/reject`);
      triggerToast(res.data.message || `Declined ${userName}.`, "info");
      fetchPendingFaculty();
    } catch (err) {
      triggerToast("Failed to decline faculty.", "error");
    }
  };

  useEffect(() => {
    if (activeWorkspace && activeWorkspace.startsWith("spoke-") && sessionUser?.role !== "Student Developer") {
      fetchPendingFaculty(currentBoardId);
    }
  }, [activeWorkspace, currentBoardId, sessionUser, fetchPendingFaculty]);

  const handleSignupSubmit = async (e) => {
    if (e) e.preventDefault();
    setSignupError("");

    if (!signupName.trim()) {
      setSignupError("Please enter your full name.");
      return;
    }
    if (!signupEmail.trim()) {
      setSignupError("Please enter your email address.");
      return;
    }
    if (!signupPassword.trim()) {
      setSignupError("Please enter a secure password.");
      return;
    }

    setIsRegistering(true);
    try {
      const selectedPersona = signupCampus === "3" ? "spoke-kle" : signupCampus === "101" ? "spoke-coep" : signupCampus === "102" ? "spoke-mmcoep" : "spoke-rit";
      
      const campusPrefix = signupCampus === "3" ? "KLE" : signupCampus === "101" ? "COEP" : signupCampus === "102" ? "MMCOEP" : "RIT";
      const selectedRole = signupRole === "Faculty Mentor" ? `${campusPrefix} Spoke Coordinator` : "Student Developer";

      const response = await axios.post("http://localhost:5001/api/register", {
        email: signupEmail,
        password: signupPassword,
        displayName: signupName,
        role: signupRole,
        persona: selectedPersona,
        spokeId: signupCampus
      });

      if (response.data.pendingApproval) {
        // Reset signup inputs
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");
        setSignupRole("Student Developer");
        setShowSignup(false);

        const approver = signupRole === "Faculty Mentor" ? "Campus Coordinator" : "Faculty Mentor";
        const campusName = signupCampus === "3" ? "KLE Tech" : signupCampus === "101" ? "COEP" : signupCampus === "102" ? "MMCOEP" : "RIT";

        setRegistrationNotice({
          title: "Registration Submitted!",
          role: signupRole,
          campus: campusName,
          approver: approver,
          message: response.data.message || `Your registration was submitted successfully and is pending verification by your campus ${approver}. You will be able to log in once your account is accepted.`
        });

        triggerToast(`Registration submitted! Pending ${approver} verification.`, "success");
        return;
      }

      const { user, token } = response.data;
      if (user && token) {
        setIsAuthenticated(true);
        setViewMode("dashboard");
        setSessionUser(user);
        setCurrentPersona(user.persona);
        setActiveWorkspace(user.persona);

        localStorage.setItem("apnileap-auth", "true");
        localStorage.setItem("apnileap-user", JSON.stringify(user));
        localStorage.setItem("apnileap-persona", user.persona);
        localStorage.setItem("apnileap-token", token);
        triggerToast(`Account created! Welcome to the platform, ${user.displayName}! `);
      }

      // Reset signup inputs
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupRole("Student Developer");
      setShowSignup(false);
    } catch (err) {
      console.error("Signup Failure:", err);
      const errMsg = err.response?.data?.error || "Registration failure. Please check your backend connection.";
      setSignupError(errMsg);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleQuickConnect = async (email) => {
    setLoginEmail(email);
    let password = "moderator123";
    if (email === "pm@apnileap.com") password = "pm123";
    else if (email.startsWith("mentor@")) password = "mentor123";
    else if (email.startsWith("student@")) password = "student123";
    else if (email === "executive@apnileap.com") password = "executive123";
    else if (email === "sponsor@nvidia.com" || email === "project_mentor@nvidia.com") password = "nvidia123";
    else if (email === "coordinator@kle.edu") password = "kle123";
    else if (email === "coordinator@coep.edu") password = "coep123";
    else if (email === "coordinator@mmcoep.edu") password = "mmcoep123";
    else if (email === "coordinator@rit.edu") password = "rit123";

    setLoginPassword(password);
    setLoginError("");

    const isSameEmail = loginEmail.toLowerCase().trim() === email.toLowerCase().trim();
    const currentOtp = (isSameEmail && showOtpInput && loginOtp.trim().length === 6) ? loginOtp.trim() : undefined;
    if (!isSameEmail) {
      setLoginOtp("");
    }

    setIsLoggingIn(true);

    try {
      const response = await axios.post("http://localhost:5001/api/login", {
        email: email,
        password: password,
        otp: currentOtp
      });

      if (response.data.require2FA) {
        setShowOtpInput(true);
        setViewMode("landing");
        setLandingTab("login");
        setPortalModal(null);
        triggerToast(response.data.message || "A 6-digit verification code has been sent to your email. Please enter it below to complete login.", "success");
        setIsLoggingIn(false);
        return;
      }

      const { user, token } = response.data;
      setIsAuthenticated(true);
      setViewMode("dashboard");
      setSessionUser(user);
      setCurrentPersona(user.persona);
      setActiveWorkspace(user.persona === "executive" ? "hub" : user.persona === "moderator" ? "moderator" : user.persona);

      localStorage.setItem("apnileap-auth", "true");
      localStorage.setItem("apnileap-user", JSON.stringify(user));
      localStorage.setItem("apnileap-persona", user.persona);
      if (token) {
        localStorage.setItem("apnileap-token", token);
      }

      triggerToast(`Logged in successfully as ${user.displayName}! `);
    } catch (err) {
      console.error("Quick Connect Failure:", err);
      const errMsg = err.response?.data?.error || "Connection failure. Please check if your backend is running on port 5001.";
      setLoginError(errMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setViewMode("landing");
    setLandingTab("home");
    setSessionUser(null);
    setCurrentPersona("moderator");
    setActiveWorkspace("hub");
    setLoginEmail("");
    setLoginPassword("");
    setLoginOtp("");
    setShowOtpInput(false);
    
    localStorage.removeItem("apnileap-auth");
    localStorage.removeItem("apnileap-user");
    localStorage.removeItem("apnileap-persona");
    localStorage.removeItem("apnileap-token");
    
    triggerToast("Logged out successfully.");
  };

  const handleIngestProjectSubmit = async (e) => {
    e.preventDefault();
    if (!ingestTitle.trim() || !ingestDescription.trim() || !ingestDuration.trim()) {
      triggerToast("Please fill in all the required project proposal fields.", "warning");
      return;
    }

    setIsIngesting(true);
    try {
      const response = await axios.post("http://localhost:5001/moderator/projects", {
        company: ingestCompany,
        title: ingestTitle,
        description: ingestDescription,
        budget: "Not Applicable",
        duration: ingestDuration,
        proposedDueDate: ingestDueDate
      });

      if (response.data && response.data.success) {
        triggerToast(` Successfully ingested new proposal by ${ingestCompany}!`);
        setIsIngestOpen(false);
        // Reset form
        setIngestTitle("");
        setIngestDescription("");
        setIngestBudget("");
        setIngestDuration("");
        setIngestDueDate("2026-08-25");
        // Reload projects and hub metrics immediately to sync changes across portals
        fetchModeratorProjects(true);
        fetchHubMetrics(true);
      }
    } catch (error) {
      console.error("Project Ingestion Error:", error);
      triggerToast(error.response?.data?.error || "Failed to ingest new project proposal.", "error");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleUpdateProjectSubmit = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editTitle.trim() || !editDescription.trim() || !editDuration.trim()) {
      triggerToast("Please fill in all required fields.", "warning");
      return;
    }

    setIsUpdatingProject(true);
    try {
      const response = await axios.put(`http://localhost:5001/moderator/projects/${editingProject.id}`, {
        company: editCompany,
        title: editTitle.trim(),
        description: editDescription.trim(),
        budget: editingProject.budget || "Not Applicable",
        duration: editDuration.trim(),
        proposedDueDate: editDueDate
      });

      if (response.data && response.data.success) {
        triggerToast(" Successfully updated project details!");
        setEditingProject(null);
        fetchModeratorProjects(true);
      }
    } catch (err) {
      console.error("Project Update Error:", err);
      triggerToast(err.response?.data?.error || "Failed to update project.", "error");
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? This will remove all campus allocations and reflect everywhere immediately.")) {
      return;
    }
    try {
      const token = localStorage.getItem("apnileap-token") || "";
      const response = await axios.delete(`http://localhost:5001/moderator/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        triggerToast("Project successfully deleted from all views.");
        // Immediately remove from local state so it reflects everywhere instantly!
        setModeratorProjects(prev => prev.filter(p => (p._id || p.id) !== projectId && p.id !== projectId));
        fetchModeratorProjects(true);
        if (typeof fetchJiraTasks === "function") fetchJiraTasks(true);
      }
    } catch (err) {
      console.error("Project Deletion Error:", err);
      triggerToast("Failed to delete project.", "error");
    }
  };

  const fetchSpokeMembers = async (boardId) => {
    try {
      const res = await axios.get(`http://localhost:5001/spokes/${boardId}/members`);
      setSpokeMembers(res.data);
    } catch (err) {
      console.error("Failed to retrieve campus team members:", err);
    }
  };

  const fetchSpokeTeams = async (boardId) => {
    setIsTeamsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/teams?boardId=${boardId}`);
      setSpokeTeams(res.data || []);
    } catch (err) {
      console.error("Failed to retrieve campus teams:", err);
    } finally {
      setIsTeamsLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    if (e) e.preventDefault();
    if (!newTeamName.trim()) {
      triggerToast("Please enter a name for the new team.", "warning");
      return;
    }
    if (selectedTeamMembers.length === 0) {
      triggerToast("Please select at least one student developer to form a team.", "warning");
      return;
    }

    setIsCreatingTeam(true);
    try {
      const selectedMembersData = selectedTeamMembers.map(memberId => {
        const found = spokeMembers.find(m => m.accountId === memberId);
        return {
          accountId: memberId,
          displayName: found ? found.displayName.replace(/ \((Student Developer|Faculty Mentor|Coordinator)\)/g, "") : "Team Member",
          emailAddress: found ? (found.emailAddress || found.email || "") : "",
          avatarUrl: found ? found.avatarUrl : "https://i.pravatar.cc/150"
        };
      });

      const foundMentor = spokeMembers.find(m => m.accountId === selectedTeamMentor);
      const mentorData = foundMentor ? {
        accountId: selectedTeamMentor,
        displayName: foundMentor.displayName.replace(/ \((Faculty Mentor|Coordinator)\)/g, ""),
        emailAddress: foundMentor.emailAddress || foundMentor.email || "",
        avatarUrl: foundMentor.avatarUrl
      } : null;

      const foundLeader = spokeMembers.find(m => m.accountId === selectedTeamLeader);
      const teamLeaderData = foundLeader ? {
        accountId: selectedTeamLeader,
        displayName: foundLeader.displayName.replace(/ \((Student Developer)\)/g, ""),
        emailAddress: foundLeader.emailAddress || foundLeader.email || "",
        avatarUrl: foundLeader.avatarUrl
      } : null;

      const res = await axios.post("http://localhost:5001/api/teams", {
        name: newTeamName.trim(),
        boardId: currentBoardId,
        members: selectedMembersData,
        mentor: mentorData,
        teamLeader: teamLeaderData
      });

      if (res.data && res.data.success) {
        triggerToast(` Successfully created collaborative team "${newTeamName}"!`);
        setNewTeamName("");
        setSelectedTeamMembers([]);
        setSelectedTeamMentor("");
        setSelectedTeamLeader("");
        fetchSpokeTeams(currentBoardId);
      }
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to create custom spoke team.", "error");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to disband and delete this Spoke Team persistently?")) {
      return;
    }
    try {
      const res = await axios.delete(`http://localhost:5001/api/teams/${teamId}`);
      if (res.data && res.data.success) {
        triggerToast("Spoke Team successfully disbanded.");
        fetchSpokeTeams(currentBoardId);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to disband Spoke Team.", "error");
    }
  };

  // Fetch Tasks from Real API
  const fetchJiraTasks = async (silent = false, customBoardId = null) => {
    if (!silent) setIsLoading(true);
    setHasError(false);
    try {
      const boardIdToFetch = customBoardId || activeCustomBoardIdRef.current || currentBoardId;
      console.log("fetching tasks:", { customBoardId, activeCustomBoardId, currentBoardId, boardIdToFetch });
      const response = await axios.get(`http://localhost:5001/tasks?boardId=${boardIdToFetch}`);
      if (Array.isArray(response.data)) {
        // Adapt Jira issues dynamically - pulls exact assignee, reporter, and due date
        const normalized = response.data.map((item) => ({
          id: item.id || `jira-${Date.now()}-${Math.random()}`,
          key: item.key || `JIRA-${item.id}`,
          fields: {
            summary: item.fields?.summary || "No Summary Provided",
            description: item.fields?.description || "No description set in Jira.",
            status: { name: item.fields?.status?.name || "To Do" },
            priority: { name: item.fields?.priority?.name || "Medium" },
            issueType: item.fields?.issuetype?.name || "Task",
            assignee: item.fields?.assignee ? {
              accountId: item.fields.assignee.accountId,
              displayName: item.fields.assignee.displayName,
              avatarUrl: item.fields.assignee.avatarUrls?.["48x48"] || item.fields.assignee.avatarUrl || "https://i.pravatar.cc/150",
              email: item.fields.assignee.emailAddress || ""
            } : null,
            reporter: item.fields?.reporter ? {
              accountId: item.fields.reporter.accountId,
              displayName: item.fields.reporter.displayName,
              avatarUrl: item.fields.reporter.avatarUrls?.["48x48"] || item.fields.reporter.avatarUrl || "https://i.pravatar.cc/150",
              email: item.fields.reporter.emailAddress || ""
            } : null,
            created: item.fields?.created || new Date().toISOString(),
            dueDate: item.fields?.duedate || item.fields?.dueDate || null,
            flagged: (item.fields?.customfield_10021 && item.fields.customfield_10021.length > 0) || 
                     (item.fields?.Flagged && item.fields.Flagged.length > 0) || 
                     item.fields?.flagged === true || false,
            timetracking: item.fields?.timetracking ? {
              originalEstimate: item.fields.timetracking.originalEstimate || null,
              remainingEstimate: item.fields.timetracking.remainingEstimate || null,
              timeSpent: item.fields.timetracking.timeSpent || null,
              timeSpentSeconds: item.fields.timetracking.timeSpentSeconds || 0,
              originalEstimateSeconds: item.fields.timetracking.originalEstimateSeconds || 0,
              remainingEstimateSeconds: item.fields.timetracking.remainingEstimateSeconds || 0
            } : null,
            subtasks: item.fields?.subtasks ? item.fields.subtasks.map(sub => ({
              id: sub.id,
              key: sub.key,
              summary: sub.fields?.summary || sub.summary || "No Summary",
              statusName: sub.fields?.status?.name || sub.statusName || "To Do"
            })) : [],
            issuelinks: item.fields?.issuelinks ? item.fields.issuelinks.map(link => {
              const linkedIssue = link.inwardIssue || link.outwardIssue;
              const direction = link.inwardIssue ? "is blocked by" : "blocks";
              return {
                id: link.id,
                type: link.type?.name || "Blocks",
                direction: direction,
                key: linkedIssue?.key,
                summary: linkedIssue?.fields?.summary || "No Summary",
                statusName: linkedIssue?.fields?.status?.name || "To Do"
              };
            }) : [],
            labels: item.fields?.labels || [],
            parent: item.fields?.parent ? {
              id: item.fields.parent.id,
              key: item.fields.parent.key,
              summary: item.fields.parent.fields?.summary || "",
              issueType: item.fields.parent.fields?.issuetype?.name || ""
            } : null
          }
        }));
        setTasks(normalized);
        setConnectionStatus("Connected");
        if (!silent) {
          triggerToast("Successfully synchronized with Live Jira API!");
        }
        return normalized;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("API Fetch Error:", error);
      setConnectionStatus("Offline");
      setHasError(true);
      if (!silent) {
        triggerToast("Failed to connect to Jira backend. Make sure server is started.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Aggregated Hub Metrics for ApniLeap
  const fetchHubMetrics = async (silent = false) => {
    if (!silent) setIsHubLoading(true);
    setHasError(false);
    try {
      const response = await axios.get("http://localhost:5001/hub/metrics");
      setHubMetrics(response.data);
      setConnectionStatus("Connected");
    } catch (error) {
      console.error("Hub Fetch Error:", error);
      setConnectionStatus("Offline");
      setHasError(true);
      if (!silent) {
        triggerToast("Failed to aggregate Hub portfolio analytics. Make sure server is started.", "error");
      }
    } finally {
      setIsHubLoading(false);
    }
  };

  // Fetch incoming projects for Moderator Intake
  const fetchModeratorProjects = async (silent = false) => {
    if (!silent) setIsModeratorLoading(true);
    setHasError(false);
    try {
      const response = await axios.get("http://localhost:5001/moderator/projects");
      setModeratorProjects(response.data);
      setConnectionStatus("Connected");
    } catch (error) {
      console.error("Moderator Projects Fetch Error:", error);
      setConnectionStatus("Offline");
      setHasError(true);
      if (!silent) {
        triggerToast("Failed to fetch moderator projects. Make sure server is started.", "error");
      }
    } finally {
      setIsModeratorLoading(false);
    }
  };

  // Fetch upcoming scheduled FIP sync meetings
  const fetchMeetings = async (silent = false) => {
    if (!silent) setIsMeetingsLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/meetings");
      setMeetings(response.data);
    } catch (error) {
      console.error("Meetings Fetch Error:", error);
      if (!silent) {
        triggerToast("Failed to retrieve scheduled FIP sync meetings.", "error");
      }
    } finally {
      setIsMeetingsLoading(false);
    }
  };

  // Retrieve all student deliverables in the system
  const fetchAllSubmissions = async () => {
    try {
      const res = await axios.get("http://localhost:5001/submissions");
      setAllSubmissions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch all submissions:", err);
    }
  };

  // Trigger project proposal assignment (Moderator)
  const handleAssignProject = async (e) => {
    e.preventDefault();
    if (!selectedAssignProject) return;

    if (!assignTargetCampus || assignTargetCampus.length === 0) {
      triggerToast("Please select at least one campus.", "error");
      return;
    }

    setIsProvisioning(true);
    try {
      let successCount = 0;
      for (const campusId of assignTargetCampus) {
        await axios.post("http://localhost:5001/moderator/assign", {
          projectId: selectedAssignProject.id,
          targetBoardId: campusId,
          dueDate: assignDueDate,
          phases: allocationPhases.filter(p => p.name.trim() !== "")
        });
        successCount++;
      }

      triggerToast(`Success! Proposal sent to ${successCount} campus(es). Awaiting coordinator review.`);
      setIsAssignModalOpen(false);
      fetchModeratorProjects(false);
    } catch (error) {
      console.error("Assignment Error:", error);
      triggerToast(error.response?.data?.error || "Failed to propose project assignment to one or more campuses.", "error");
    } finally {
      setIsProvisioning(false);
    }
  };

  // Spoke Coordinator accepts Project assignment (Spoke)
  const handleAcceptProject = async (projectId) => {
    setIsRespondingToProject(true);
    try {
      const res = await axios.post(`http://localhost:5001/spoke/project/${projectId}/accept`, { targetBoardId: currentBoardId });
      if (res.data && res.data.success) {
        triggerToast(" Project accepted! Jira workspace successfully provisioned with 3 standard Phase tasks!");
        fetchModeratorProjects(false);
        fetchJiraTasks(false); // Refresh Jira board immediately
      }
    } catch (err) {
      console.error("Acceptance Error:", err);
      triggerToast(err.response?.data?.error || "Failed to accept project assignment.", "error");
    } finally {
      setIsRespondingToProject(false);
    }
  };

  // Spoke Coordinator declines Project assignment (Spoke)
  const handleDeclineProject = async (projectId) => {
    setIsRespondingToProject(true);
    try {
      const res = await axios.post(`http://localhost:5001/spoke/project/${projectId}/decline`, { targetBoardId: currentBoardId });
      if (res.data && res.data.success) {
        triggerToast("Proposal declined. Project returned to the Moderator assignment pool.");
        fetchModeratorProjects(false);
      }
    } catch (err) {
      console.error("Decline Error:", err);
      triggerToast(err.response?.data?.error || "Failed to decline project assignment.", "error");
    } finally {
      setIsRespondingToProject(false);
    }
  };

  // Re-fetch issues or hub metrics whenever activeWorkspace or currentBoardId changes
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchMeetings(true); // Fetch meetings silently to check for banner alerts
      if (activeWorkspace === "hub") {
        fetchHubMetrics(false);
      } else if (activeWorkspace === "moderator") {
        fetchModeratorProjects(false);
      } else if (activeWorkspace === "meetings") {
        fetchMeetings(false);
      } else {
        fetchJiraTasks(false);
        fetchSpokeMembers(currentBoardId);
        fetchSpokeTeams(currentBoardId);
        fetchModeratorProjects(true); // Fetch moderator projects silently to check for proposed assignments
        fetchHubMetrics(true); // Fetch hub metrics silently to feed leaderboards!
        fetchAllSubmissions(); // Auto-load all submissions for deliverables review queue!
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace, currentBoardId]);

  // On component mount, automatically fetch active session user profile
  useEffect(() => {
    const fetchMyself = async () => {
      try {
        const res = await axios.get("http://localhost:5001/myself");
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to retrieve myself context:", err);
      }
    };
    fetchMyself();
  }, []);

  // Background Auto-Polling: silently refetches based on active view mode
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMeetings(true);
      if (activeWorkspace === "hub") {
        fetchHubMetrics(true);
      } else if (activeWorkspace === "moderator") {
        fetchModeratorProjects(true);
      } else if (activeWorkspace === "meetings") {
        fetchMeetings(true);
      } else {
        fetchJiraTasks(true);
        fetchSpokeMembers(currentBoardId);
        fetchSpokeTeams(currentBoardId);
        fetchHubMetrics(true); // Poll hub metrics silently for leaderboards!
      }
    }, 60000); // 60s auto-polling

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace, currentBoardId]);

  // Ensures real Jira users are editable and filterable seamlessly.
  const activeAssignees = useMemo(() => {
    const list = [];
    if (currentUser && currentUser.accountId) {
      list.push({
        accountId: currentUser.accountId,
        name: currentUser.displayName,
        avatar: currentUser.avatarUrls?.["48x48"] || "https://i.pravatar.cc/150",
        email: currentUser.emailAddress || ""
      });
    }
    tasks.forEach(t => {
      if (t.fields.assignee) {
        const exists = list.some(m => m.accountId === t.fields.assignee.accountId);
        if (!exists) {
          list.push({
            accountId: t.fields.assignee.accountId,
            name: t.fields.assignee.displayName,
            avatar: t.fields.assignee.avatarUrl || "https://i.pravatar.cc/150",
            email: t.fields.assignee.email || ""
          });
        }
      }
      if (t.fields.reporter) {
        const exists = list.some(m => m.accountId === t.fields.reporter.accountId);
        if (!exists) {
          list.push({
            accountId: t.fields.reporter.accountId,
            name: t.fields.reporter.displayName,
            avatar: t.fields.reporter.avatarUrl || "https://i.pravatar.cc/150",
            email: t.fields.reporter.email || ""
          });
        }
      }
    });
    return list;
  }, [tasks, currentUser]);

  const activeProjectsList = useMemo(() => {
    const list = [];
    tasks.forEach(t => {
      const parentSummary = t.fields.parent?.summary;
      if (parentSummary && !list.includes(parentSummary)) {
        list.push(parentSummary);
      }
      if (t.fields.issueType === "Epic" && !list.includes(t.fields.summary)) {
        list.push(t.fields.summary);
      }
    });
    return list;
  }, [tasks]);

  // Handle Search and Filter logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const summaryMatch = task.fields.summary
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      const keyMatch = task.key
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      const textMatch = summaryMatch || keyMatch;

      const priorityMatch =
        filterPriority === "All" ||
        task.fields.priority?.name === filterPriority;

      const assigneeMatch =
        filterAssignee === "All" ||
        (filterAssignee === "Unassigned" && !task.fields.assignee) ||
        task.fields.assignee?.displayName === filterAssignee;

      const projectMatch =
        filterProject === "All" ||
        (task.fields.parent?.summary === filterProject) ||
        (task.fields.issueType === "Epic" && task.fields.summary === filterProject);

      return textMatch && priorityMatch && assigneeMatch && projectMatch;
    });
  }, [tasks, searchQuery, filterPriority, filterAssignee, filterProject]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = filteredTasks.length;
    const backlog = filteredTasks.filter(t => t.fields.status.name === "To Do").length;
    const progress = filteredTasks.filter(t => t.fields.status.name === "In Progress").length;
    const done = filteredTasks.filter(t => t.fields.status.name === "Done").length;
    
    // Priorities
    const high = filteredTasks.filter(t => t.fields.priority.name === "High").length;
    const medium = filteredTasks.filter(t => t.fields.priority.name === "Medium").length;
    const low = filteredTasks.filter(t => t.fields.priority.name === "Low").length;

    // Overdue counts (not Done, and deadline was before today May 26, 2026)
    const overdue = filteredTasks.filter(t => {
      if (t.fields.status.name === "Done" || !t.fields.dueDate) return false;
      const today = new Date("2026-05-26");
      const due = new Date(t.fields.dueDate);
      const dToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      return dDue.getTime() < dToday.getTime();
    }).length;

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    // On-Time Completion Rate calculation (Done tasks with due dates compared to mock system date May 27, 2026)
    const doneTasks = filteredTasks.filter(t => t.fields.status.name === "Done");
    const tasksWithDue = doneTasks.filter(t => t.fields.dueDate);
    const onTimeCount = tasksWithDue.filter(t => {
      const due = new Date(t.fields.dueDate);
      const systemToday = new Date("2026-05-27");
      return due.getTime() >= systemToday.getTime();
    }).length;
    const onTimeRate = tasksWithDue.length > 0 ? Math.round((onTimeCount / tasksWithDue.length) * 100) : 100;

    return { total, backlog, progress, done, high, medium, low, overdue, completionRate, onTimeRate };
  }, [filteredTasks]);

  // Recharts Chart Formats
  const statusPieData = [
    { name: "To Do", value: metrics.backlog, color: "#f59e0b" },
    { name: "In Progress", value: metrics.progress, color: "#3b82f6" },
    { name: "Done", value: metrics.done, color: "#10b981" },
  ].filter(d => d.value > 0);

  const priorityBarData = [
    { name: "High Priority", count: metrics.high, fill: "#ef4444" },
    { name: "Medium Priority", count: metrics.medium, fill: "#f97316" },
    { name: "Low Priority", count: metrics.low, fill: "#22c55e" },
  ];

  // Assignee task loading aggregates
  const assigneeWorkloadData = useMemo(() => {
    const counts = {};
    filteredTasks.forEach(t => {
      const name = t.fields.assignee?.displayName || "Unassigned";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      tasks: count,
    }));
  }, [filteredTasks]);

  // Aggregated Leaderboard ranking KLE, COEP, MMCOEP, RIT Spokes dynamically
  const leaderboardData = useMemo(() => {
    if (hubMetrics && Array.isArray(hubMetrics.spokes) && hubMetrics.spokes.length > 0) {
      return [...hubMetrics.spokes].sort((a, b) => b.done - a.done);
    }
    return [
      { id: "3", name: "KLE Spoke", done: 12, total: 18, completionRate: 67 },
      { id: "101", name: "COEP Spoke", done: 8, total: 15, completionRate: 53 },
      { id: "102", name: "MMCOEP Spoke", done: 5, total: 12, completionRate: 42 },
      { id: "103", name: "RIT Spoke", done: 3, total: 10, completionRate: 30 }
    ].sort((a, b) => b.done - a.done);
  }, [hubMetrics]);

  const todayMeetingsForSpoke = useMemo(() => {
    if (activeWorkspace === "hub" || activeWorkspace === "moderator" || activeWorkspace === "meetings" || activeWorkspace === "playground") return [];
    const campusId = currentBoardId;
    const todayStr = "2026-05-27";
    return meetings.filter(m => m.campusId === campusId && m.date === todayStr);
  }, [meetings, activeWorkspace, currentBoardId]);

  const todayConflictsForSpoke = useMemo(() => {
    const timeCounts = {};
    todayMeetingsForSpoke.forEach(m => {
      timeCounts[m.time] = (timeCounts[m.time] || 0) + 1;
    });
    return todayMeetingsForSpoke.filter(m => timeCounts[m.time] > 1);
  }, [todayMeetingsForSpoke]);

  const proposedProjectsForSpoke = useMemo(() => {
    if (activeWorkspace === "hub" || activeWorkspace === "moderator" || activeWorkspace === "meetings" || activeWorkspace === "playground") return [];
    const campusId = currentBoardId;
    const spoke = dynamicSpokes[campusId] || SPOKES[campusId];
    if (!spoke) return [];
    return moderatorProjects.filter(p => {
      if (p.allocations && p.allocations.length > 0) {
        return p.allocations.some(a => a.targetCampusId === campusId && a.status === "Proposed");
      }
      return p.status === "Proposed" && p.targetCampusId === campusId;
    });
  }, [moderatorProjects, activeWorkspace, currentBoardId]);

  const acceptedProjectsForSpoke = useMemo(() => {
    if (activeWorkspace === "hub" || activeWorkspace === "moderator" || activeWorkspace === "meetings" || activeWorkspace === "playground") return [];
    const campusId = currentBoardId;
    return moderatorProjects.filter(p => {
      if (p.allocations && p.allocations.length > 0) {
        return p.allocations.some(a => a.targetCampusId === campusId && a.status === "Active");
      }
      return p.status === "Active" && p.targetCampusId === campusId;
    });
  }, [moderatorProjects, activeWorkspace, currentBoardId]);

  // Dynamically resolve child checklist issues for both Epic and Standard parent tasks
  const currentTaskChildren = useMemo(() => {
    if (!selectedTask) return [];
    
    // For Epic, find all tasks that list this Epic as their parent in our state
    if (selectedTask.fields.issueType === "Epic") {
      return tasks.filter(t => t.fields.parent?.key === selectedTask.key).map(t => ({
        id: t.id,
        key: t.key,
        summary: t.fields.summary,
        statusName: t.fields.status.name,
        assignee: t.fields.assignee
      }));
    }
    
    // For standard issues, look for children in the task list OR fall back to fields.subtasks
    const childrenFromList = tasks.filter(t => t.fields.parent?.key === selectedTask.key).map(t => ({
      id: t.id,
      key: t.key,
      summary: t.fields.summary,
      statusName: t.fields.status.name,
      assignee: t.fields.assignee
    }));
    
    if (childrenFromList.length > 0) {
      return childrenFromList;
    }
    
    return (selectedTask.fields.subtasks || []).map(sub => {
      // Try to resolve assignee/full info from list
      const resolved = tasks.find(t => t.key === sub.key);
      return {
        id: sub.id,
        key: sub.key,
        summary: sub.summary,
        statusName: resolved ? resolved.fields.status.name : sub.statusName,
        assignee: resolved ? resolved.fields.assignee : null
      };
    });
  }, [selectedTask, tasks]);

  // Drag and Drop DragEnd Action
  const onDragEnd = (result) => {
    if (isCentralAdmin) {
      triggerToast("Access Denied: Central Administrators have read-only progress tracking permission on spoke boards.", "error");
      return;
    }
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Map column ID to actual status name
    const statusMap = {
      "col-backlog": "To Do",
      "col-progress": "In Progress",
      "col-done": "Done",
    };
    
    const newStatus = statusMap[destination.droppableId];
    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;
    
    const taskKey = task.key;
    
    // 1. Optimistic update in state
    setTasks(prevTasks => {
      return prevTasks.map(t => {
        if (t.id === draggableId) {
          return {
            ...t,
            fields: {
              ...t.fields,
              status: { name: newStatus }
            }
          };
        }
        return t;
      });
    });
    
    triggerToast(`Transitioning ${taskKey} to ${newStatus} in Jira...`);
    
    // 2. Perform live API status transition
    axios.post(`http://localhost:5001/tasks/${taskKey}/transition`, { statusName: newStatus })
      .then(() => {
        triggerToast(`Successfully transitioned ${taskKey} to ${newStatus} in Jira!`);
      })
      .catch(err => {
        console.error("Transition API Error:", err);
        triggerToast(`Failed to transition issue ${taskKey} in Jira. Reverting...`, "error");
        fetchJiraTasks(true); // Silent fetch to revert back to true Jira state
      });
  };

  // Create Task Action inside Jira Project
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newSummary.trim()) {
      triggerToast("Please enter a task summary title", "warning");
      return;
    }

    const assignedUser = spokeMembers.find(m => m.displayName === newAssignee);
    const assignedReporterUser = spokeMembers.find(m => m.displayName === newReporter);

    const payload = {
      summary: newSummary,
      description: newDescription || "No description provided.",
      statusName: newStatus,
      priorityName: newPriority,
      assigneeId: assignedUser ? assignedUser.accountId : null,
      reporterId: assignedReporterUser ? assignedReporterUser.accountId : null,
      dueDate: newDueDate || null,
      issueTypeName: newIssueType,
      boardId: currentBoardId
    };

    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5001/tasks", payload);
      triggerToast(`Created task ${res.data.key} in Jira successfully!`);
      
      // Reset Form
      setNewSummary("");
      setNewDescription("");
      setNewIssueType("Task");
      setNewAssignee("");
      setNewReporter("");
      setNewPriority("Medium");
      setNewStatus("To Do");
      setNewDueDate("");
      setIsCreateOpen(false);
      
      // Silent fetch from Jira to update board
      await fetchJiraTasks(true);
    } catch (err) {
      console.error("Create issue error:", err);
      triggerToast("Failed to create issue in Jira.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Update Task fields inside Modal with live PUT to Jira
  const handleUpdateTaskDetail = async (updatedTask, changedField) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);

    try {
      if (changedField === "status") {
        triggerToast(`Transitioning ${updatedTask.key} to ${updatedTask.fields.status.name} in Jira...`);
        await axios.post(`http://localhost:5001/tasks/${updatedTask.key}/transition`, { statusName: updatedTask.fields.status.name });
        triggerToast(`Successfully transitioned ${updatedTask.key} to ${updatedTask.fields.status.name} in Jira!`);
      } else {
        const payload = {};
        if (changedField === "summary") payload.summary = updatedTask.fields.summary;
        if (changedField === "description") payload.description = updatedTask.fields.description;
        if (changedField === "dueDate") payload.dueDate = updatedTask.fields.dueDate;
        if (changedField === "assignee") payload.assignee = updatedTask.fields.assignee?.accountId || null;
        if (changedField === "reporter") payload.reporter = updatedTask.fields.reporter?.accountId || null;
        if (changedField === "priority") payload.priority = updatedTask.fields.priority?.name || null;

        triggerToast(`Saving ${changedField} updates for ${updatedTask.key} in Jira...`);
        await axios.put(`http://localhost:5001/tasks/${updatedTask.key}`, payload);
        triggerToast(`Successfully saved ${changedField} for ${updatedTask.key} in Jira!`);
      }
    } catch (err) {
      console.error("Update Issue API Error:", err);
      triggerToast(`Failed to update ${changedField} in Jira. Reverting...`, "error");
      fetchJiraTasks(true); // Silent reload to revert state
    }
  };

  // Toggle standard Jira issue impediment flag
  const handleToggleBlockerFlag = async (task) => {
    const nextFlagged = !task.fields.flagged;
    
    // 1. Optimistic update
    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          fields: {
            ...t.fields,
            flagged: nextFlagged
          }
        };
      }
      return t;
    }));
    
    if (selectedTask && selectedTask.id === task.id) {
      setSelectedTask(prev => ({
        ...prev,
        fields: {
          ...prev.fields,
          flagged: nextFlagged
        }
      }));
    }

    try {
      triggerToast(nextFlagged ? `Flagging issue ${task.key} as BLOCKED...` : `Clearing blocker flag for ${task.key}...`, "warning");
      await axios.put(`http://localhost:5001/tasks/${task.key}/flag`, { flagged: nextFlagged });
      triggerToast(nextFlagged ? `Issue ${task.key} is now flagged as blocked!` : `Successfully cleared blocker flag for ${task.key}!`);
      await fetchJiraTasks(true);
    } catch (err) {
      console.error(err);
      triggerToast("Failed to update blocker status in Jira. Reverting...", "error");
      await fetchJiraTasks(true);
    }
  };

  // Log spent time on a task in Jira
  const handleLogWorkSpent = async (taskKey, timeSpentString, logComment) => {
    if (!timeSpentString.trim()) {
      triggerToast("Please specify time spent (e.g. 1h 30m, 45m)", "warning");
      return;
    }
    
    setIsLoading(true);
    try {
      triggerToast(`Logging ${timeSpentString} spent time to issue ${taskKey} in Jira...`);
      await axios.post(`http://localhost:5001/tasks/${taskKey}/worklog`, { timeSpent: timeSpentString, comment: logComment });
      triggerToast(`Successfully logged ${timeSpentString} to issue ${taskKey}!`);
      
      setWorklogTimeSpent("");
      setWorklogComment("");
      
      // Refetch worklogs immediately for the modal history
      const logsRes = await axios.get(`http://localhost:5001/tasks/${taskKey}/worklog`);
      setWorklogHistory(logsRes.data || []);
      
      await fetchJiraTasks(true);
      
      // Update selectedTask details with new timetracking metrics
      const updatedParent = tasks.find(t => t.key === taskKey);
      if (updatedParent) {
        setSelectedTask(updatedParent);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to log work in Jira.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Retrieve worklogs list for detail modal history
  const fetchWorklogHistory = async (taskKey) => {
    setIsHistoryLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/tasks/${taskKey}/worklog`);
      setWorklogHistory(res.data || []);
    } catch (err) {
      console.error("Fetch worklogs error:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Retrieve student deliverable submissions for detail modal
  const fetchSubmissions = async (taskId) => {
    setIsSubmissionsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/tasks/${taskId}/submissions`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      triggerToast("Failed to retrieve student deliverables.", "error");
    } finally {
      setIsSubmissionsLoading(false);
    }
  };

  // Handle uploading a student deliverable submission
  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();

    if (submitMode === "file") {
      if (!submitFile) {
        triggerToast("Please select a file to upload.", "warning");
        return;
      }
      setIsSubmittingDeliverable(true);
      try {
        const formData = new FormData();
        formData.append("file", submitFile);
        formData.append("fileName", submitFileName.trim() || submitFile.name);
        formData.append("studentName", sessionUser?.displayName || sessionUser?.email || currentUser?.displayName || currentUser?.email || "Student Developer");
        formData.append("comments", submitComments);

        const token = localStorage.getItem("apni_token");
        const res = await axios.post(
          `http://localhost:5001/tasks/${selectedTask.id}/submit`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );

        if (res.data && res.data.success) {
          triggerToast("File uploaded successfully!");
          setSubmitFileName("");
          setSubmitFile(null);
          setSubmitComments("");
          fetchSubmissions(selectedTask.id);
        }
      } catch (err) {
        console.error(err);
        triggerToast("Failed to upload file.", "error");
      } finally {
        setIsSubmittingDeliverable(false);
      }
    } else {
      // Link mode
      if (!submitFileName.trim() || !submitFileUrl.trim()) {
        triggerToast("Please enter both the artifact name and access link.", "warning");
        return;
      }
      try {
        new URL(submitFileUrl);
      } catch {
        triggerToast("Please enter a valid URL (e.g., https://github.com/...)", "warning");
        return;
      }
      setIsSubmittingDeliverable(true);
      try {
        const token = localStorage.getItem("apni_token");
        const res = await axios.post(
          `http://localhost:5001/tasks/${selectedTask.id}/submit`,
          {
            studentName: sessionUser?.displayName || sessionUser?.email || currentUser?.displayName || currentUser?.email || "Student Developer",
            fileName: submitFileName,
            fileUrl: submitFileUrl,
            comments: submitComments
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data && res.data.success) {
          triggerToast("Deliverable link submitted successfully!");
          setSubmitFileName("");
          setSubmitFileUrl("");
          setSubmitComments("");
          fetchSubmissions(selectedTask.id);
        }
      } catch (err) {
        console.error(err);
        triggerToast("Failed to submit deliverable.", "error");
      } finally {
        setIsSubmittingDeliverable(false);
      }
    }
  };

  // Handle coordinator approving or requesting re-work on a student submission
  const handleUpdateSubmissionStatus = async (subId, newStatus, coordinatorFeedback, grade = "") => {
    try {
      const res = await axios.put(`http://localhost:5001/submissions/${subId}/status`, {
        status: newStatus,
        feedback: coordinatorFeedback,
        grade
      });

      if (res.data && res.data.success) {
        triggerToast(`Submission marked as ${newStatus} successfully!`);
        fetchAllSubmissions(); // Refresh global queue
        fetchJiraTasks(true); // Refresh JIRA/mock tasks to reflect Done or Blocked flags
        fetchHubMetrics(true); // Refresh hub metrics silently to update velocity/leaderboard!
      }
    } catch (err) {
      console.error("Failed to update submission status:", err);
      triggerToast("Failed to update submission review status.", "error");
    }
  };

  // Handle deleting a student submission persistently
  const handleDeleteSubmission = async (subId) => {
    try {
      const res = await axios.delete(`http://localhost:5001/submissions/${subId}`);
      if (res.data && res.data.success) {
        triggerToast("Submission history deleted successfully!");
        fetchAllSubmissions(); // Refresh global queue
        fetchJiraTasks(true); // Refresh tasks
        fetchHubMetrics(true); // Refresh hub metrics
      }
    } catch (err) {
      console.error("Failed to delete submission:", err);
      triggerToast("Failed to delete student submission.", "error");
    }
  };

  // Handle triggering AI automated submission verification sweep
  const handleRunAiVerificationSweep = async () => {
    try {
      triggerToast("🤖 Rovo Agent: Running CI/CD link verification sweep...");
      const res = await axios.post("http://localhost:5001/api/automation/verify-all");
      if (res.data && res.data.success) {
        triggerToast(`✅ ${res.data.message}`);
        fetchAllSubmissions();
      }
    } catch (err) {
      console.error("Failed to run AI verification sweep:", err);
      triggerToast("Failed to execute AI verification sweep.", "error");
    }
  };

  // Handle triggering Morning Campus Digest email & SMS blast
  const handleTriggerMorningDigest = async () => {
    try {
      triggerToast("☀️ Generating and dispatching Morning Campus Portfolio Digest...");
      const res = await axios.post("http://localhost:5001/api/automation/trigger-digest");
      if (res.data && res.data.success) {
        triggerToast(`📧 Morning Digest dispatched! (${res.data.stats.activeProjects} projects, $${res.data.stats.totalCapital.toLocaleString()} capital deployed)`);
      }
    } catch (err) {
      console.error("Failed to trigger Morning Digest:", err);
      triggerToast("Failed to dispatch Morning Digest.", "error");
    }
  };

  // Create a child subtask inside Jira parent issue
  const handleCreateSubtask = async (parentKey, subtaskSummary, assigneeId = null, parentIssueType = null) => {
    if (!subtaskSummary.trim()) {
      triggerToast("Please enter a task summary", "warning");
      return;
    }
    
    setIsLoading(true);
    try {
      const isEpic = parentIssueType && parentIssueType.toLowerCase() === "epic";
      const label = isEpic ? "child task" : "child subtask";
      triggerToast(`Creating ${label} under ${parentKey} in Jira...`);
      
      await axios.post(`http://localhost:5001/tasks/${parentKey}/subtask`, {
        summary: subtaskSummary,
        assigneeId: assigneeId || null,
        parentIssueType: parentIssueType || null
      });
      triggerToast(`Created ${label} successfully!`);
      
      setSubtaskInputSummary("");
      setSubtaskAssigneeId("");
      
      // Fetch fresh board tasks
      const latestTasks = await fetchJiraTasks(true);
      
      // Refresh the selected task modal view to include the new subtask
      if (Array.isArray(latestTasks)) {
        const updatedParent = latestTasks.find(t => t.key === parentKey);
        if (updatedParent) {
          setSelectedTask(updatedParent);
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to create child task in Jira.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Link two tickets on the board in Jira
  const handleLinkIssues = async (sourceKey, targetKey, relationType) => {
    if (!targetKey) {
      triggerToast("Please select a target issue to link with", "warning");
      return;
    }
    
    setIsLoading(true);
    try {
      triggerToast(`Linking issue ${sourceKey} to ${targetKey} in Jira...`);
      await axios.post(`http://localhost:5001/tasks/links`, { linkType: relationType, sourceKey, targetKey });
      triggerToast(`Issues successfully linked in Jira!`);
      
      setLinkTargetKey("");
      
      await fetchJiraTasks(true);
      
      // Refresh selected task inside modal view to reflect links
      const updatedParent = tasks.find(t => t.key === sourceKey);
      if (updatedParent) {
        setSelectedTask(updatedParent);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to link issues in Jira.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Update Custom labels string array in Jira
  const handleUpdateLabels = async (taskKey, newLabelsArray) => {
    try {
      // 1. Optimistic update
      setTasks(prev => prev.map(t => {
        if (t.key === taskKey) {
          return { ...t, fields: { ...t.fields, labels: newLabelsArray } };
        }
        return t;
      }));
      
      if (selectedTask && selectedTask.key === taskKey) {
        setSelectedTask(prev => ({
          ...prev,
          fields: { ...prev.fields, labels: newLabelsArray }
        }));
      }

      await axios.put(`http://localhost:5001/tasks/${taskKey}/labels`, { labels: newLabelsArray });
      triggerToast(`Saved tags for ${taskKey} in Jira!`);
    } catch (err) {
      console.error(err);
      triggerToast("Failed to save labels in Jira.", "error");
      await fetchJiraTasks(true);
    }
  };

  // Delete Task Action from Jira
  const handleDeleteTask = async (taskId, taskKey) => {
    setIsLoading(true);
    try {
      triggerToast(`Deleting issue ${taskKey} from Jira...`, "warning");
      await axios.delete(`http://localhost:5001/tasks/${taskKey}`);
      triggerToast(`Permanently deleted issue ${taskKey} from Jira!`, "warning");
      setSelectedTask(null);
      await fetchJiraTasks(true);
    } catch (err) {
      console.error("Delete Task API Error:", err);
      const jiraErr = err.response?.data?.details?.errorMessages?.[0] || err.response?.data?.message || null;
      if (jiraErr) {
        triggerToast(`Jira Error: ${jiraErr}`, "error");
      } else {
        triggerToast(`Failed to delete issue ${taskKey} in Jira.`, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Open Email Composer Modal with Real Sender Profile Signature
  const handleOpenEmailComposer = (task) => {
    const assigneeName = task.fields.assignee?.displayName || "Team Member";
    // Check if the task assignee has a real email address fetched from Jira, or leave empty for editing!
    const assigneeEmail = task.fields.assignee?.email || "";
    
    setEmailTask(task);
    setEmailRecipient(assigneeEmail);
    setEmailSubject(`[URGENT REMINDER] Upcoming deadline for task ${task.key}`);
    
    const senderName = currentUser?.displayName || "Jira Administrator";
    const bodyText = `Hi ${assigneeName},\n\nThis is a friendly reminder that task ${task.key} ("${task.fields.summary}") has an active due date of ${task.fields.dueDate || "N/A"} and is currently in status "${task.fields.status?.name}".\n\nPlease update the status or notify us if any adjustment is needed.\n\nBest regards,\n${senderName} (Jira Dashboard)`;
    
    setEmailBody(bodyText);
    setSelectedTask(null); // Close detail modal
    setIsEmailOpen(true);
    setEmailAnimationState("preparing");
  };

  // Trigger outbound email dispatcher (with envelope fly animation)
  const handleSendReminderEmail = (e) => {
    e.preventDefault();
    setIsSendingEmail(true);
    setEmailAnimationState("sending");

    const payload = {
      recipient: emailRecipient,
      subject: emailSubject,
      taskKey: emailTask?.key || "APNI-REMINDER",
      taskSummary: emailTask?.fields?.summary || "",
      dueDate: emailTask?.fields?.dueDate || "",
      message: emailBody
    };

    // Duration of envelope flight animation: 2.2 seconds
    setTimeout(() => {
      axios.post("http://localhost:5001/tasks/send-reminder", payload)
        .then(res => {
          triggerToast(res.data.message || `Dispatched alert successfully to ${emailRecipient}!`);
          if (res.data.previewUrl) {
            triggerToast("SMTP Preview opening in a new tab...");
            window.open(res.data.previewUrl, "_blank");
          }
        })
        .catch(err => {
          console.error(err);
          triggerToast("Relay Failed. Make sure SMTP server settings or backend is running.", "error");
        })
        .finally(() => {
          setIsSendingEmail(false);
          setIsEmailOpen(false);
          setEmailAnimationState("sent");
        });
    }, 2200);
  };

  // Helper styles for drag and drop column states
  const getColumnStyle = (isDraggingOver) => ({
    background: isDraggingOver ? "rgba(59, 82, 154, 0.06)" : "var(--bg-column)",
    border: isDraggingOver ? "1.5px dashed var(--primary)" : "1px solid var(--border-subtle)",
    borderRadius: "8px",
    padding: "16px",
    minHeight: "550px",
    transition: "var(--transition-smooth)",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactSubject.trim() || !contactMessage.trim()) {
      triggerToast("Please fill in all form fields.", "warning");
      return;
    }
    
    setIsSubmittingContact(true);
    setTimeout(() => {
      triggerToast("Message sent successfully! Our coordinator will contact you shortly.");
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
      setIsSubmittingContact(false);
    }, 1500);
  };

  const renderPublicNavbar = () => {
    return (
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 60px",
        background: theme === "dark" ? "#0f172a" : "#ffffff",
        borderBottom: theme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        transition: "var(--transition-smooth)"
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setLandingTab("home")}
          style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-sans)", fontWeight: "800", fontSize: "28px", cursor: "pointer" }}
        >
          <span style={{ color: "#ef4444" }}>Apni</span>
          <span style={{ color: "#3b529a", position: "relative", display: "inline-flex", alignItems: "center" }}>
            Leap
            <span style={{ color: "#10b981", marginLeft: "4px", fontSize: "20px", fontWeight: "900" }}>↗</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {[
            { key: "home", label: "Home" },
            { key: "about", label: "About" },
            { key: "collaboration", label: "Industry-Academia Collaboration" },
            { key: "contact", label: "Contact Us" }
          ].map(link => {
            const isActive = landingTab === link.key;
            return (
              <button
                key={link.key}
                onClick={() => setLandingTab(link.key)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: isActive 
                    ? "#ef4444" 
                    : (theme === "dark" ? "#cbd5e1" : "#3b529a"),
                  fontWeight: "700",
                  fontSize: "14.5px",
                  cursor: "pointer",
                  padding: "8px 0",
                  position: "relative",
                  transition: "var(--transition-smooth)"
                }}
              >
                {link.label}
                {isActive && (
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "3px",
                    backgroundColor: "#ef4444",
                    borderRadius: "2px"
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action CTA */}
        <div>
          {isAuthenticated ? (
            <button
              onClick={() => setViewMode("dashboard")}
              style={{
                background: "#ef4444",
                color: "#ffffff",
                border: "none",
                padding: "10px 22px",
                borderRadius: "8px",
                fontWeight: "750",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "var(--transition-smooth)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(239, 68, 68, 0.2)";
              }}
            >
              Go to Dashboard <FaChevronRight size={12} />
            </button>
          ) : (
            <button
              onClick={() => setLandingTab("login")}
              style={{
                background: "#3b529a",
                color: "#ffffff",
                border: "none",
                padding: "10px 22px",
                borderRadius: "8px",
                fontWeight: "750",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(59, 82, 154, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "var(--transition-smooth)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 82, 154, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(59, 82, 154, 0.2)";
              }}
            >
              Portal Sign In <FaLock size={12} />
            </button>
          )}
        </div>
      </header>
    );
  };

  const renderPublicFooter = () => {
    return (
      <footer style={{
        background: "#0a1128",
        color: "#ffffff",
        padding: "60px 80px 20px 80px",
        fontFamily: "var(--font-sans)",
        width: "100%",
        borderTop: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "40px",
          marginBottom: "40px",
          maxWidth: "1200px",
          margin: "0 auto 40px auto"
        }}>
          {/* Column 1: Logo & Socials */}
          <div style={{ flex: "1 1 300px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "800", fontSize: "28px", marginBottom: "20px" }}>
              <span style={{ color: "#ef4444" }}>Apni</span>
              <span style={{ color: "#ffffff", position: "relative", display: "inline-flex", alignItems: "center" }}>
                Leap
                <span style={{ color: "#10b981", marginLeft: "4px", fontSize: "20px" }}>↗</span>
              </span>
            </div>
            {/* Social Circles */}
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              {[
                { icon: <FaGlobe />, url: "#" },
                { icon: <FaEnvelope />, url: "mailto:info@apnileap.org" },
                { icon: <FaUser />, url: "#" },
                { icon: <FaUsers />, url: "#" }
              ].map((soc, idx) => (
                <a 
                  key={idx}
                  href={soc.url}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#122047",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    transition: "var(--transition-smooth)",
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#122047";
                  }}
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div style={{ flex: "1 1 200px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>
              Quick Links
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { key: "home", label: "HOME" },
                { key: "about", label: "ABOUT" },
                { key: "collaboration", label: "INDUSTRY-ACADEMIA COLLABORATION" },
                { key: "contact", label: "CONTACT US" }
              ].map(link => (
                <button
                  key={link.key}
                  onClick={() => {
                    setLandingTab(link.key);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: landingTab === link.key ? "#ef4444" : "#cbd5e1",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                    transition: "var(--transition-smooth)",
                    letterSpacing: "0.5px"
                  }}
                  onMouseEnter={(e) => {
                    if (landingTab !== link.key) e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    if (landingTab !== link.key) e.currentTarget.style.color = "#cbd5e1";
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Address */}
          <div style={{ flex: "1 1 300px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>
              Address
            </h4>
            <p style={{ fontSize: "13.5px", color: "#94a3b8", lineHeight: "1.7", fontWeight: "500" }}>
              NETRA Accelerator Foundation CTIE, RH Kulkarni Memorial Complex, BVB Campus, Revenue Colony, Vidya Nagar BVB, Hubli Eng College, Dharwad, Hubli 580031, Karnataka, India
            </p>
          </div>
        </div>

        {/* Copyright line */}
        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          paddingTop: "20px",
          textAlign: "center",
          fontSize: "12px",
          color: "#64748b",
          fontWeight: "600",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          Copyright © 2026 ApniLeap | Powered by ArrayPointer
        </div>
      </footer>
    );
  };

  const renderPortalModals = () => {
    if (!portalModal) return null;
    
    let title = "";
    let content = null;
    
    if (portalModal === "academia") {
      title = "Select Campus Workspace";
      const spokesList = [
        { id: "3", name: "KLE Tech Hub Campus", mentor: "coordinator@kle.edu", student: "student@kle.edu" },
        { id: "101", name: "COEP Campus", mentor: "coordinator@coep.edu", student: "student@coep.edu" },
        { id: "102", name: "MMCOEP Campus", mentor: "coordinator@mmcoep.edu", student: "student@mmcoep.edu" },
        { id: "103", name: "RIT Campus", mentor: "coordinator@rit.edu", student: "student@rit.edu" }
      ];
      
      content = (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          {spokesList.map(sp => (
            <div key={sp.id} style={{
              padding: "16px",
              borderRadius: "12px",
              background: theme === "dark" ? "#1e293b" : "#f8fafc",
              border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              <span style={{ fontWeight: "800", fontSize: "14.5px", color: theme === "dark" ? "#f8fafc" : "#3b529a" }}>{sp.name}</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  onClick={() => {
                    handleQuickConnect(sp.mentor);
                    setPortalModal(null);
                  }}
                  style={{
                    background: "#3b529a",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  Faculty Coordinator
                </button>
                <button
                  onClick={() => {
                    handleQuickConnect(sp.student);
                    setPortalModal(null);
                  }}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  Student Developer Space
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (portalModal === "industries") {
      title = "Select Corporate Partner Workspace";
      content = (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          <button
            onClick={() => {
              handleQuickConnect("moderator@apnileap.com");
              setPortalModal(null);
            }}
            style={{
              background: "#3b529a",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "750",
              fontSize: "14px",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <FaTools /> Central Portfolio & Moderation Hub
          </button>
          <button
            onClick={() => {
              handleQuickConnect("sponsor@nvidia.com");
              setPortalModal(null);
            }}
            style={{
              background: "#3b529a",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "750",
              fontSize: "14px",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <FaDesktop /> Company Sponsorship Portal
          </button>
        </div>
      );
    } else if (portalModal === "startups") {
      title = "Select Partner Workspace";
      content = (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          <button
            onClick={() => {
              handleQuickConnect("admin@apnileap.com");
              setPortalModal(null);
            }}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "750",
              fontSize: "14px",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <FaCrown /> Executive Dashboard
          </button>
        </div>
      );
    }
    
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          background: theme === "dark" ? "#0f172a" : "#ffffff",
          border: theme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "420px",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          position: "relative"
        }}>
          <button
            onClick={() => setPortalModal(null)}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "transparent",
              border: "none",
              color: theme === "dark" ? "#cbd5e1" : "#475569",
              cursor: "pointer",
              fontSize: "18px"
            }}
          >
            <FaTimes />
          </button>
          
          <h3 style={{
            fontSize: "18px",
            fontWeight: "800",
            color: theme === "dark" ? "#ffffff" : "#0f172a",
            textAlign: "center"
          }}>
            {title}
          </h3>
          
          {content}
        </div>
      </div>
    );
  };

  const renderPublicTabContent = () => {
    if (landingTab === "home") {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          background: theme === "dark" ? "#0b0f19" : "#ffffff",
          transition: "var(--transition-smooth)"
        }}>
          {/* SECTION 1: OVERVIEW */}
          <div style={{
            width: "100%",
            padding: "60px 20px",
            background: theme === "dark" ? "#0f172a" : "#ffffff",
            display: "flex",
            justifyContent: "center"
          }}>
            <div style={{
              width: "100%",
              maxWidth: "1150px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "40px",
              alignItems: "center"
            }}>
              <div>
                <h2 style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: "850",
                  fontSize: "30px",
                  color: theme === "dark" ? "#60a5fa" : "#0048ba",
                  marginBottom: "24px",
                  letterSpacing: "-0.5px"
                }}>
                  Overview
                </h2>
                <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    "Netra Accelerator Foundation is a Non-Profit organization founded in year 2020 in the city of Hubballi in Karnataka State.",
                    "Objective of Netra has been to transform engineering campuses into Product Innovation Centers (EPIC) through industry partnerships.",
                    "To drive this aim, Netra has created a thoughtful, proven execution model under “A Product Nation Innovation Leap” which has been branded as APNILeap.",
                    "APNILeap helps build an ecosystem of academia, startups, and industries on campus using the APNILeap Playbook.",
                    "Under APNILeap, there is another foundational program called VidyaLeap that helps establish initial engagements with engineering colleges and drive product/project activities on campus.",
                    "APNILeap has been innovating this model continuously for several years and has now become an implementable and scalable model, gaining acceptance from academia and support from many industries."
                  ].map((pt, idx) => (
                    <li key={idx} style={{
                      position: "relative",
                      paddingLeft: "24px",
                      fontSize: "14.5px",
                      lineHeight: "1.6",
                      color: theme === "dark" ? "#cbd5e1" : "#1e3a8a",
                      fontWeight: "500"
                    }}>
                      <span style={{
                        position: "absolute",
                        left: "4px",
                        top: "9px",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#ef4444"
                      }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Flowchart Diagram */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: theme === "dark" ? "#1e293b" : "#f8fafc",
                borderRadius: "24px",
                border: theme === "dark" ? "1px solid #334155" : "1.5px solid rgba(0,0,0,0.03)",
                boxShadow: theme === "dark" ? "none" : "0 8px 24px rgba(0,0,0,0.02)"
              }}>
                <div style={{
                  width: "100%",
                  maxWidth: "280px",
                  padding: "16px 20px",
                  background: theme === "dark" ? "#0f172a" : "#ffffff",
                  border: "2px solid #3b529a",
                  borderRadius: "14px",
                  textAlign: "center",
                  fontWeight: "800",
                  fontSize: "14px",
                  color: "#3b529a",
                  boxShadow: "0 4px 10px rgba(59, 82, 154, 0.08)"
                }}>
                  Netra Accelerator Foundation
                </div>
                <div style={{ margin: "8px 0", color: "#3b529a", fontSize: "20px", fontWeight: "900" }}>↓</div>
                
                <div style={{
                  width: "100%",
                  maxWidth: "280px",
                  padding: "16px 20px",
                  background: theme === "dark" ? "#0f172a" : "#ffffff",
                  border: "2px solid #3b529a",
                  borderRadius: "14px",
                  textAlign: "center",
                  fontWeight: "800",
                  fontSize: "14px",
                  color: "#3b529a",
                  boxShadow: "0 4px 10px rgba(59, 82, 154, 0.08)"
                }}>
                  APNILeap
                </div>
                <div style={{ margin: "8px 0", color: "#3b529a", fontSize: "20px", fontWeight: "900" }}>↓</div>
                
                <div style={{
                  width: "100%",
                  maxWidth: "280px",
                  padding: "16px 20px",
                  background: theme === "dark" ? "#0f172a" : "#ffffff",
                  border: "2px solid #3b529a",
                  borderRadius: "14px",
                  textAlign: "center",
                  fontWeight: "800",
                  fontSize: "14px",
                  color: "#3b529a",
                  boxShadow: "0 4px 10px rgba(59, 82, 154, 0.08)"
                }}>
                  VidyaLeap
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: BENEFICIARIES / STAKEHOLDERS */}
          <div style={{
            width: "100%",
            padding: "60px 20px",
            background: theme === "dark" ? "#111827" : "#f8fafc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <h2 style={{
              fontFamily: "var(--font-sans)",
              fontWeight: "850",
              fontSize: "30px",
              color: theme === "dark" ? "#60a5fa" : "#0048ba",
              marginBottom: "32px",
              letterSpacing: "-0.5px"
            }}>
              Beneficiaries / Stakeholders
            </h2>
            
            {/* Main Triple-Column Card */}
            <div style={{
              background: theme === "dark" ? "#1e293b" : "#ffffff",
              border: theme === "dark" ? "1px solid #334155" : "1.5px solid rgba(0,0,0,0.04)",
              borderRadius: "32px",
              boxShadow: theme === "dark" ? "0 10px 30px rgba(0,0,0,0.3)" : "0 15px 45px rgba(0,0,0,0.04)",
              width: "100%",
              maxWidth: "1150px",
              padding: "50px 40px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "40px",
              transition: "var(--transition-smooth)",
              marginBottom: "40px"
            }}>
              {/* Column 1: Academia */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}>
                <div style={{ marginBottom: "20px" }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#ef4444", marginBottom: "4px" }}>Academia</h3>
                <p style={{ fontSize: "14px", fontWeight: "700", color: theme === "dark" ? "#94a3b8" : "#475569", marginBottom: "24px" }}>Students + Faculties</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "260px" }}>
                  <button 
                    onClick={() => setPortalModal("academia")}
                    style={{
                      background: "#0048ba",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      fontWeight: "750",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#00368c"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#0048ba"}
                  >
                    Product Based Ecosystem
                  </button>
                  <button 
                    onClick={() => setPortalModal("academia")}
                    style={{
                      background: "#0048ba",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      fontWeight: "750",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#00368c"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#0048ba"}
                  >
                    Quality Placements/ Startups Creation
                  </button>
                </div>
              </div>
              
              {/* Column 2: Industries */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}>
                <div style={{ marginBottom: "20px" }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#ef4444", marginBottom: "4px" }}>Industries</h3>
                <p style={{ fontSize: "14px", fontWeight: "700", color: theme === "dark" ? "#94a3b8" : "#475569", marginBottom: "24px" }}>Product Base</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "260px" }}>
                  <button 
                    onClick={() => setPortalModal("industries")}
                    style={{
                      background: "#0048ba",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      fontWeight: "750",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#00368c"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#0048ba"}
                  >
                    Product Development
                  </button>
                  <button 
                    onClick={() => setPortalModal("industries")}
                    style={{
                      background: "#0048ba",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      fontWeight: "750",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#00368c"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#0048ba"}
                  >
                    Research Collaboration
                  </button>
                </div>
              </div>
              
              {/* Column 3: Startups */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}>
                <div style={{ marginBottom: "20px" }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M12 2C6 2 2 6 2 12c0 2.5 1 4.5 2.5 6h11c1.5-1.5 2.5-3.5 2.5-6 0-6-4-10-10-10z"/>
                    <path d="M9 15l6-6M11.5 6.5A1.5 1.5 0 1 0 10 5a1.5 1.5 0 0 0 1.5 1.5z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#ef4444", marginBottom: "4px" }}>Startups</h3>
                <p style={{ fontSize: "14px", fontWeight: "700", color: theme === "dark" ? "#94a3b8" : "#475569", marginBottom: "24px" }}>Business</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "260px" }}>
                  <button 
                    onClick={() => setPortalModal("startups")}
                    style={{
                      background: "#0048ba",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      fontWeight: "750",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#00368c"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#0048ba"}
                  >
                    Business Support
                  </button>
                  <button 
                    onClick={() => setPortalModal("startups")}
                    style={{
                      background: "#0048ba",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      fontWeight: "750",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#00368c"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#0048ba"}
                  >
                    Funding Support
                  </button>
                </div>
              </div>
            </div>
            
            {/* Bottom Call to Action */}
            <button 
              onClick={() => setLandingTab("contact")}
              style={{
                background: "#0048ba",
                color: "#ffffff",
                border: "none",
                padding: "14px 28px",
                borderRadius: "8px",
                fontWeight: "750",
                fontSize: "15px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0, 72, 186, 0.2)",
                transition: "var(--transition-smooth)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 72, 186, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 72, 186, 0.2)";
              }}
            >
              To Know More, Contact us
            </button>
          </div>

          {/* SECTION 3: CHALLENGES IN INDIA IAC ECOSYSTEM MODEL */}
          <div style={{
            width: "100%",
            padding: "60px 20px",
            background: theme === "dark" ? "#0f172a" : "#ffffff",
            display: "flex",
            justifyContent: "center"
          }}>
            <div style={{
              width: "100%",
              maxWidth: "1150px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "50px",
              alignItems: "center"
            }}>
              {/* Left Column: Venn Diagram */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h2 style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: "850",
                  fontSize: "26px",
                  color: theme === "dark" ? "#60a5fa" : "#0048ba",
                  marginBottom: "24px",
                  letterSpacing: "-0.5px",
                  textAlign: "center",
                  alignSelf: "stretch"
                }}>
                  Challenges in India IAC Ecosystem Model
                </h2>
                
                <svg width="340" height="320" viewBox="0 0 340 320" style={{ maxWidth: "100%", height: "auto" }}>
                  <circle cx="170" cy="120" r="80" fill={theme === "dark" ? "rgba(99, 102, 241, 0.08)" : "rgba(224, 231, 255, 0.55)"} stroke="#3b529a" strokeWidth="2.5" />
                  <circle cx="120" cy="200" r="75" fill={theme === "dark" ? "rgba(239, 68, 68, 0.05)" : "rgba(254, 242, 242, 0.6)"} stroke="#ef4444" strokeWidth="2" />
                  <circle cx="220" cy="200" r="75" fill={theme === "dark" ? "rgba(16, 185, 129, 0.05)" : "rgba(236, 253, 245, 0.6)"} stroke="#10b981" strokeWidth="2" />
                  
                  <text x="170" y="70" textAnchor="middle" fill="#3b529a" fontWeight="800" fontSize="10.5">Academic Institution</text>
                  <text x="90" y="195" textAnchor="middle" fill="#ef4444" fontWeight="800" fontSize="9.5">Learning</text>
                  <text x="90" y="208" textAnchor="middle" fill="#ef4444" fontWeight="800" fontSize="9.5">Ecosystem</text>
                  <text x="90" y="221" textAnchor="middle" fill="#ef4444" fontWeight="600" fontSize="8.5">(Students)</text>
                  
                  <text x="250" y="195" textAnchor="middle" fill="#10b981" fontWeight="800" fontSize="9.5">Research</text>
                  <text x="250" y="208" textAnchor="middle" fill="#10b981" fontWeight="800" fontSize="9.5">Ecosystem</text>
                  <text x="250" y="221" textAnchor="middle" fill="#10b981" fontWeight="600" fontSize="8.5">(Faculty)</text>
                  
                  <text x="170" y="155" textAnchor="middle" fill="#3b529a" fontWeight="800" fontSize="9.5">Industry and</text>
                  <text x="170" y="167" textAnchor="middle" fill="#3b529a" fontWeight="800" fontSize="9.5">Startup Ecosystem</text>
                  
                  <text x="170" y="300" textAnchor="middle" fill={theme === "dark" ? "#cbd5e1" : "#1e3a8a"} fontWeight="850" fontSize="13">IAC Ecosystem Model</text>
                </svg>
                
                <div style={{
                  fontSize: "12px",
                  color: theme === "dark" ? "#64748b" : "#475569",
                  fontWeight: "600",
                  marginTop: "16px",
                  textAlign: "center",
                  lineHeight: "1.4",
                  maxWidth: "400px"
                }}>
                  Note: In India there are very few role models for IAC – with some exceptions like leading Medical Colleges, IITM, IITB, KLE Tech
                </div>
              </div>
              
              {/* Right Column: Challenges List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: theme === "dark" ? "#60a5fa" : "#3b529a", marginBottom: "4px" }}>
                  Challenges and Impact
                </h3>
                
                {[
                  "Systemic Issues: Lack of alignment, lack of knowledge transfer and <strong>Poor collaboration</strong>",
                  "Creating a <strong>Valley of Death</strong> of failed joint-research projects that hinder the nation’s goal to become a product-driven economy.",
                  "Impacting innovation output: India ranks <strong>86th globally</strong> in Industry-Academia collaboration."
                ].map((item, idx) => (
                  <div key={idx} style={{
                    padding: "20px",
                    background: theme === "dark" ? "#1e293b" : "#f8fafc",
                    border: theme === "dark" ? "1px solid #334155" : "1.5px solid rgba(0,0,0,0.03)",
                    borderLeft: "4px solid #ef4444",
                    borderRadius: "0 12px 12px 0",
                    boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0,0,0,0.01)",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: theme === "dark" ? "#cbd5e1" : "#1e3a8a",
                    fontWeight: "500"
                  }} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: THE VALLEY OF DEATH */}
          <div style={{
            width: "100%",
            padding: "60px 20px",
            background: theme === "dark" ? "#111827" : "#f8fafc",
            display: "flex",
            justifyContent: "center"
          }}>
            <div style={{
              width: "100%",
              maxWidth: "1150px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "40px",
              alignItems: "center"
            }}>
              {/* Left Column: Points */}
              <div>
                <h2 style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: "850",
                  fontSize: "30px",
                  color: theme === "dark" ? "#60a5fa" : "#0048ba",
                  marginBottom: "24px",
                  letterSpacing: "-0.5px"
                }}>
                  The Valley of Death
                </h2>
                <div style={{
                  padding: "24px",
                  background: theme === "dark" ? "#1e293b" : "#ffffff",
                  border: theme === "dark" ? "1px solid #334155" : "1.5px solid rgba(0,0,0,0.03)",
                  borderRadius: "16px",
                  boxShadow: theme === "dark" ? "none" : "0 10px 30px rgba(0,0,0,0.02)"
                }}>
                  <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[
                      "The missing link isn't talent or ideas",
                      "It's the culture and ability to collaborate within the ecosystem",
                      "Without it, academic innovations stall before reaching industry or consumers"
                    ].map((pt, idx) => (
                      <li key={idx} style={{
                        position: "relative",
                        paddingLeft: "24px",
                        fontSize: "15px",
                        lineHeight: "1.6",
                        color: theme === "dark" ? "#cbd5e1" : "#1e3a8a",
                        fontWeight: "600"
                      }}>
                        <span style={{
                          position: "absolute",
                          left: "4px",
                          top: "9px",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#ef4444"
                        }} />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Right Column: Valley of Death SVG Diagram */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                background: theme === "dark" ? "#1e293b" : "#ffffff",
                border: theme === "dark" ? "1px solid #334155" : "1.5px solid rgba(0,0,0,0.03)",
                borderRadius: "24px",
                boxShadow: theme === "dark" ? "none" : "0 8px 30px rgba(0,0,0,0.02)"
              }}>
                <svg width="550" height="280" viewBox="0 0 550 280" style={{ maxWidth: "100%", height: "auto" }}>
                  <path d="M 50 210 C 100 100, 150 90, 220 200 L 220 210 Z" fill={theme === "dark" ? "rgba(99, 102, 241, 0.15)" : "rgba(219, 234, 254, 0.6)"} />
                  <path d="M 330 210 C 370 200, 420 100, 500 130 L 500 210 Z" fill={theme === "dark" ? "rgba(239, 68, 68, 0.1)" : "rgba(254, 226, 226, 0.6)"} />

                  <line x1="40" y1="210" x2="520" y2="210" stroke={theme === "dark" ? "#475569" : "#cbd5e1"} strokeWidth="2" />

                  <text x="135" y="145" textAnchor="middle" fill="#3b529a" fontWeight="800" fontSize="10.5">Academic Research</text>

                  <text x="445" y="145" textAnchor="middle" fill="#dc2626" fontWeight="800" fontSize="10.5">Industry Application</text>

                  <text x="275" y="195" textAnchor="middle" fill="#ef4444" fontWeight="850" fontSize="12">Valley of Death</text>

                  <text x="70" y="80" fill="gray" fontSize="8" fontWeight="600">Public Funding /</text>
                  <text x="70" y="90" fill="gray" fontSize="8" fontWeight="600">Private Investment</text>
                  <line x1="120" y1="95" x2="120" y2="120" stroke="gray" strokeWidth="1" strokeDasharray="3" />

                  <text x="390" y="80" fill="gray" fontSize="8" fontWeight="600">Private</text>
                  <text x="390" y="90" fill="gray" fontSize="8" fontWeight="600">Investment</text>
                  <line x1="410" y1="95" x2="430" y2="115" stroke="gray" strokeWidth="1" strokeDasharray="3" />

                  <path d="M 50 210 C 100 100, 150 90, 220 200 C 275 220, 275 220, 330 210 C 370 200, 420 100, 500 130" fill="none" stroke="#2563eb" strokeWidth="3" />
                  <path d="M 310 212 C 340 205, 380 140, 500 130" fill="none" stroke="#ef4444" strokeWidth="3" />

                  <circle cx="60" cy="210" r="4" fill="#ef4444" />
                  <line x1="60" y1="210" x2="60" y2="245" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                  <text x="60" y="255" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="600">Discovery</text>

                  <circle cx="120" cy="210" r="4" fill="#ef4444" />
                  <line x1="120" y1="210" x2="120" y2="245" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                  <text x="120" y="255" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Fundamental</text>
                  <text x="120" y="265" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Research</text>

                  <circle cx="180" cy="210" r="4" fill="#ef4444" />
                  <line x1="180" y1="210" x2="180" y2="245" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                  <text x="180" y="255" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Concept &</text>
                  <text x="180" y="265" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Applied</text>
                  <text x="180" y="275" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Research</text>

                  <circle cx="240" cy="210" r="4" fill="#ef4444" />
                  <line x1="240" y1="210" x2="240" y2="245" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                  <text x="240" y="255" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Technology</text>
                  <text x="240" y="265" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Transfer</text>

                  <circle cx="300" cy="210" r="4" fill="#ef4444" />
                  <line x1="300" y1="210" x2="300" y2="245" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                  <text x="300" y="255" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Development</text>

                  <circle cx="360" cy="210" r="4" fill="#ef4444" />
                  <line x1="360" y1="210" x2="360" y2="245" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                  <text x="360" y="255" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Product</text>
                  <text x="360" y="265" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Launch</text>

                  <circle cx="430" cy="210" r="4" fill="#ef4444" />
                  <line x1="430" y1="210" x2="430" y2="245" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                  <text x="430" y="255" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Success</text>
                  <text x="430" y="265" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">as a new</text>
                  <text x="430" y="275" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Product</text>

                  <circle cx="490" cy="210" r="4" fill="#ef4444" />
                  <line x1="490" y1="210" x2="490" y2="245" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                  <text x="490" y="255" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Success as</text>
                  <text x="490" y="265" textAnchor="middle" fill="gray" fontSize="7.5" fontWeight="500">Business</text>
                </svg>
                
                <div style={{
                  fontSize: "10px",
                  color: "gray",
                  marginTop: "12px",
                  textAlign: "center",
                  lineHeight: "1.4"
                }}>
                  Valley of death reprinted and adapted from Chirazi, Wanieck, Fayemi, Zollfrank, & Jacobs, 2019, under CC By 4.0 license
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (landingTab === "about") {
      const coFounders = [
        {
          name: "Vivek Pawar",
          region: "India",
          initials: "VP",
          img: "/images/vivek_pawar.png",
          bulletPoints: [
            "Vivek's previous role was the CEO of the Deshpande Foundation and continues to serve as an Advisor on the Academic council of BVB KLE Tech University",
            "Prior, Vivek was the Founder and Executive Chairman of Sankalp Semiconductors which he incubated at BVBKLE Tech. Acquired by HCL in 2019."
          ]
        },
        {
          name: "Prof. Dr. Ashok Shettar",
          region: "India",
          initials: "AS",
          img: "/images/ashok_shettar.png",
          bulletPoints: [
            "Professor Shettar is Pro-Chancellor of KLE Tech University and previously served as the Principal of BVB College of Engineering",
            "Nationally recognized thought leader in engineering education and industry collaboration, he has led KLE Tech for past 20 years."
          ]
        },
        {
          name: "Mahesh Jadhav",
          region: "USA",
          initials: "MJ",
          img: "/images/mahesh_jadhav.png",
          bulletPoints: [
            "Mahesh was one of the Founding Investors and Board Members of Sankalp Semiconductors and serves as a Board Member of BVB KLE Tech Incubation Center",
            "Mahesh is a Private Equity Investor (Mubadala Capital). Prior, he worked in R&D, Finance & Strategic Leadership roles (Tata, Siemens, PwC, Accenture, Cognizant)."
          ]
        }
      ];

      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          background: theme === "dark" ? "#0b0f19" : "#ffffff",
          padding: "60px 20px",
          transition: "var(--transition-smooth)"
        }}>
          <h2 style={{
            fontFamily: "var(--font-sans)",
            fontWeight: "850",
            fontSize: "36px",
            color: theme === "dark" ? "#60a5fa" : "#1e3a8a",
            marginBottom: "50px",
            letterSpacing: "-0.5px"
          }}>
            ApniLeap Co-Founders
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "40px", width: "100%", maxWidth: "900px" }}>
            {coFounders.map((founder, idx) => (
              <div key={idx} style={{
                display: "flex",
                background: theme === "dark" ? "#1e293b" : "#ffffff",
                border: theme === "dark" ? "1px solid #334155" : "1.5px solid rgba(0,0,0,0.04)",
                borderRadius: "16px",
                boxShadow: theme === "dark" ? "0 4px 20px rgba(0,0,0,0.2)" : "0 10px 30px rgba(0,0,0,0.03)",
                overflow: "hidden",
                flexDirection: "row",
                flexWrap: "wrap",
                transition: "var(--transition-smooth)"
              }}>
                {/* Left Profile Panel */}
                <div style={{
                  flex: "1 1 320px",
                  background: theme === "dark" ? "#1e293b" : "#ffeef0",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "24px",
                  gap: "20px",
                  transition: "var(--transition-smooth)"
                }}>
                  {/* Styled Avatar/Photo Container */}
                  <div style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "14px",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                    border: "1.5px solid rgba(0,0,0,0.02)"
                  }}>
                    <img 
                      src={founder.img} 
                      alt={founder.name} 
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "cover",
                        display: "block"
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:900; color:${theme === "dark" ? "#60a5fa" : "#3b529a"}; background:${theme === "dark" ? "#1e293b" : "#ffeef0"};">${founder.initials}</div>`;
                      }}
                    />
                  </div>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "left"
                  }}>
                    <h4 style={{ fontSize: "20px", fontWeight: "800", color: theme === "dark" ? "#60a5fa" : "#0048ba", margin: "0", lineHeight: "1.2" }}>{founder.name}</h4>
                    <span style={{ fontSize: "14px", fontWeight: "750", color: theme === "dark" ? "#cbd5e1" : "#475569", marginTop: "6px" }}>-{founder.region}</span>
                  </div>
                </div>
                
                {/* Right Content Panel */}
                <div style={{
                  flex: "2 1 400px",
                  padding: "30px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  borderLeft: theme === "dark" ? "1px solid #334155" : "1px solid #f1f5f9"
                }}>
                  <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                    {founder.bulletPoints.map((bp, bpIdx) => (
                      <li key={bpIdx} style={{
                        position: "relative",
                        paddingLeft: "24px",
                        fontSize: "14.5px",
                        lineHeight: "1.7",
                        color: theme === "dark" ? "#cbd5e1" : "#1e3a8a",
                        fontWeight: "500"
                      }}>
                        <span style={{
                          position: "absolute",
                          left: "4px",
                          top: "8px",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#0055d4"
                        }} />
                        {bp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (landingTab === "collaboration") {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          background: theme === "dark" ? "#0b0f19" : "#ffffff",
          transition: "var(--transition-smooth)"
        }}>
          {/* SECTION 1: IAC COLLABORATION CHALLENGES (DETAIL) */}
          <div style={{
            width: "100%",
            padding: "60px 20px",
            background: theme === "dark" ? "#0f172a" : "#ffffff",
            display: "flex",
            justifyContent: "center",
            borderBottom: theme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0"
          }}>
            <div style={{
              width: "100%",
              maxWidth: "1150px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <h2 style={{
                fontFamily: "var(--font-sans)",
                fontWeight: "850",
                fontSize: "30px",
                color: theme === "dark" ? "#60a5fa" : "#0048ba",
                marginBottom: "12px",
                letterSpacing: "-0.5px",
                textAlign: "center"
              }}>
                IAC Collaboration Challenges (detail)
              </h2>
              <p style={{
                fontSize: "14.5px",
                color: theme === "dark" ? "#cbd5e1" : "#475569",
                fontWeight: "600",
                textAlign: "center",
                marginBottom: "40px",
                maxWidth: "850px",
                lineHeight: "1.6"
              }}>
                Lot of piece-meal solutions and ideas exist today but there is a major gap and lack of comprehensive framework to address these multi-dimensional collaboration challenges
              </p>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "50px",
                width: "100%",
                alignItems: "start"
              }}>
                {/* Left side: Venn Diagram */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <svg width="340" height="320" viewBox="0 0 340 320" style={{ maxWidth: "100%", height: "auto" }}>
                    <circle cx="170" cy="120" r="80" fill={theme === "dark" ? "rgba(99, 102, 241, 0.08)" : "rgba(224, 231, 255, 0.55)"} stroke="#3b529a" strokeWidth="2.5" />
                    <circle cx="120" cy="200" r="75" fill={theme === "dark" ? "rgba(239, 68, 68, 0.05)" : "rgba(254, 242, 242, 0.6)"} stroke="#ef4444" strokeWidth="2" />
                    <circle cx="220" cy="200" r="75" fill={theme === "dark" ? "rgba(16, 185, 129, 0.05)" : "rgba(236, 253, 245, 0.6)"} stroke="#10b981" strokeWidth="2" />
                    
                    <text x="170" y="70" textAnchor="middle" fill="#3b529a" fontWeight="800" fontSize="10.5">Academic Institution</text>
                    <text x="90" y="195" textAnchor="middle" fill="#ef4444" fontWeight="800" fontSize="9.5">Learning</text>
                    <text x="90" y="208" textAnchor="middle" fill="#ef4444" fontWeight="800" fontSize="9.5">Ecosystem</text>
                    <text x="90" y="221" textAnchor="middle" fill="#ef4444" fontWeight="600" fontSize="8.5">(Students)</text>
                    
                    <text x="250" y="195" textAnchor="middle" fill="#10b981" fontWeight="800" fontSize="9.5">Research</text>
                    <text x="250" y="208" textAnchor="middle" fill="#10b981" fontWeight="800" fontSize="9.5">Ecosystem</text>
                    <text x="250" y="221" textAnchor="middle" fill="#10b981" fontWeight="600" fontSize="8.5">(Faculty)</text>
                    
                    <text x="170" y="155" textAnchor="middle" fill="#3b529a" fontWeight="800" fontSize="9.5">Industry and</text>
                    <text x="170" y="167" textAnchor="middle" fill="#3b529a" fontWeight="800" fontSize="9.5">Startup Ecosystem</text>
                    
                    <text x="170" y="300" textAnchor="middle" fill={theme === "dark" ? "#cbd5e1" : "#1e3a8a"} fontWeight="850" fontSize="13">IAC Ecosystem Model</text>
                  </svg>
                </div>
                
                {/* Right side: 5 groups of challenges */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[
                    [
                      "Lack of IAC Strategy and Roadmap",
                      "Lack for Formal Org or Owners responsible for driving joint research thru IAC",
                      "Lack of Success Models and experience in IAC"
                    ],
                    [
                      "Unrealistic expectations from Academia and Students",
                      "Institutions pulled in multiple directions by varying demands by multiple Industry players",
                      "Lack of crawl-walk-run segmentation in Project complexity for joint research projects"
                    ],
                    [
                      "Lack of support and enablement for Faculty to manage additional projects load",
                      "Lack of opportunities for faculty to deepen understanding of Industry and startups",
                      "Lack of incentive, career prospects, funding to balance publishing v/s applied research"
                    ],
                    [
                      "Lack of excitement and mindset among Students re product innovation roles",
                      "Curriculum not practical oriented or overly focused on IT",
                      "Lack of Student internships or employment opportunities in Innovation versus IT"
                    ],
                    [
                      "Lack of clear Collaboration processes, systems or tools",
                      "Lack of Collaboration experience and best practices",
                      "Lack of Leading and Logging indicators to measure IAC progress"
                    ]
                  ].map((group, gIdx) => (
                    <div key={gIdx} style={{
                      padding: "20px",
                      background: theme === "dark" ? "#1e293b" : "#f8fafc",
                      border: theme === "dark" ? "1px solid #334155" : "1.5px solid rgba(0,0,0,0.03)",
                      borderLeft: "4px solid #ef4444",
                      borderRadius: "0 12px 12px 0",
                      boxShadow: theme === "dark" ? "none" : "0 4px 12px rgba(0,0,0,0.01)"
                    }}>
                      <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {group.map((pt, ptIdx) => (
                          <li key={ptIdx} style={{
                            position: "relative",
                            paddingLeft: "20px",
                            fontSize: "13.5px",
                            lineHeight: "1.5",
                            color: theme === "dark" ? "#cbd5e1" : "#1e3a8a",
                            fontWeight: "600"
                          }}>
                            <span style={{
                              position: "absolute",
                              left: "2px",
                              top: "7px",
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: "#ef4444"
                            }} />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: OUR THEORY OF CHANGE - STAKEHOLDER VIEW */}
          <div style={{
            width: "100%",
            padding: "60px 20px",
            background: theme === "dark" ? "#111827" : "#f8fafc",
            display: "flex",
            justifyContent: "center"
          }}>
            <div style={{
              width: "100%",
              maxWidth: "1150px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <h2 style={{
                fontFamily: "var(--font-sans)",
                fontWeight: "850",
                fontSize: "30px",
                color: theme === "dark" ? "#60a5fa" : "#0048ba",
                marginBottom: "12px",
                letterSpacing: "-0.5px",
                textAlign: "center"
              }}>
                Our Theory of Change – Stakeholder View
              </h2>
              <p style={{
                fontSize: "14.5px",
                color: theme === "dark" ? "#cbd5e1" : "#475569",
                fontWeight: "600",
                textAlign: "center",
                marginBottom: "40px",
                maxWidth: "850px",
                lineHeight: "1.6"
              }}>
                Operate within the institutional framework, align shared goals and enable ecosystems to collaborate better
              </p>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "50px",
                width: "100%",
                alignItems: "start"
              }}>
                {/* Left side: Venn Diagram with ApniLeap Center */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <svg width="340" height="320" viewBox="0 0 340 320" style={{ maxWidth: "100%", height: "auto" }}>
                    <circle cx="170" cy="120" r="80" fill={theme === "dark" ? "rgba(99, 102, 241, 0.08)" : "rgba(224, 231, 255, 0.55)"} stroke="#3b529a" strokeWidth="2.5" />
                    <circle cx="120" cy="200" r="75" fill={theme === "dark" ? "rgba(239, 68, 68, 0.05)" : "rgba(254, 242, 242, 0.6)"} stroke="#ef4444" strokeWidth="2" />
                    <circle cx="220" cy="200" r="75" fill={theme === "dark" ? "rgba(16, 185, 129, 0.05)" : "rgba(236, 253, 245, 0.6)"} stroke="#10b981" strokeWidth="2" />
                    
                    <text x="170" y="70" textAnchor="middle" fill="#3b529a" fontWeight="800" fontSize="10.5">Academic Institution</text>
                    <text x="90" y="195" textAnchor="middle" fill="#ef4444" fontWeight="800" fontSize="9.5">Learning</text>
                    <text x="90" y="208" textAnchor="middle" fill="#ef4444" fontWeight="800" fontSize="9.5">Ecosystem</text>
                    <text x="90" y="221" textAnchor="middle" fill="#ef4444" fontWeight="600" fontSize="8.5">(Students)</text>
                    
                    <text x="250" y="195" textAnchor="middle" fill="#10b981" fontWeight="800" fontSize="9.5">Research</text>
                    <text x="250" y="208" textAnchor="middle" fill="#10b981" fontWeight="800" fontSize="9.5">Ecosystem</text>
                    <text x="250" y="221" textAnchor="middle" fill="#10b981" fontWeight="600" fontSize="8.5">(Faculty)</text>
                    
                    <text x="170" y="145" textAnchor="middle" fill="#3b529a" fontWeight="800" fontSize="9.5">Industry and</text>
                    <text x="170" y="157" textAnchor="middle" fill="#3b529a" fontWeight="800" fontSize="9.5">Startup Ecosystem</text>
                    
                    {/* Center ApniLeap white circle */}
                    <circle cx="170" cy="180" r="42" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
                    <text x="170" y="177" textAnchor="middle" fill="#ef4444" fontWeight="900" fontSize="9">Apni<tspan fill="#3b529a">Leap</tspan></text>
                    <text x="170" y="191" textAnchor="middle" fill="#3b529a" fontWeight="950" fontSize="7.5">Campus</text>
                    <text x="170" y="200" textAnchor="middle" fill="#3b529a" fontWeight="950" fontSize="7.5">Center*</text>
                    
                    <text x="170" y="300" textAnchor="middle" fill={theme === "dark" ? "#cbd5e1" : "#1e3a8a"} fontWeight="850" fontSize="13">IAC Ecosystem Model</text>
                  </svg>
                </div>
                
                {/* Right side: Theory of Change Details */}
                <div style={{
                  background: theme === "dark" ? "#1e293b" : "#ffffff",
                  border: theme === "dark" ? "1px solid #334155" : "1.5px solid rgba(0,0,0,0.03)",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: theme === "dark" ? "none" : "0 8px 24px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}>
                  {[
                    { title: "Strategy", desc: "Well defined Strategy, Positioning, Roadmap, Metrics for IAC" },
                    { title: "Structure", desc: "ApniLeap Center (run by PoPs, Students) responsible for IAC success" },
                    { title: "Success Models", desc: "BVB KLE Tech, IITM, IITB, Medical Colleges, Business Schools" },
                    { title: "Expectations", desc: "Clear expectation management through joint roadmap, SOWs" },
                    { title: "Engagement", desc: "Industry/Startup involvement in curriculum, Exec PhD, research projects" },
                    { title: "Complexity", desc: "Gradually increase complexity and project duration, 3/6/18 month projects" },
                    { title: "Support", desc: "Leadership and change workshops, research proposal, project mgmt. support" },
                    { title: "Engagement (Faculty)", desc: "Faculty Industry internships and post-doc opportunities" },
                    { title: "Motivation", desc: "Financial incentives, career prospects, funding for joint research projects" },
                    { title: "Programs & Courses", desc: "VidyaLeap, Engg. exploration etc. to develop innovation mindset" },
                    { title: "Curriculum", desc: "Upgrade curriculum with Startup/Industry inputs and make it market ready" },
                    { title: "Opportunities", desc: "Internship and Final Placement as well as Entrepreneurial opportunities" },
                    { title: "Process, systems, tools", desc: "Develop research project mgmt. processes, SOW templates etc." },
                    { title: "Best Practices", desc: "Develop best practices playbook based on BVB KLE Tech and other exp." },
                    { title: "Leading and Logging Indicators", desc: "Select appropriate from ApniLeap Repository" }
                  ].map((item, idx) => (
                    <div key={idx} style={{
                      display: "flex",
                      alignItems: "start",
                      fontSize: "13.5px",
                      lineHeight: "1.4",
                      color: theme === "dark" ? "#cbd5e1" : "#1e3a8a"
                    }}>
                      <strong style={{ width: "160px", flexShrink: 0, color: "#ef4444" }}>{item.title}</strong>
                      <span style={{ fontWeight: "500" }}>: {item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (landingTab === "contact") {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          background: theme === "dark" ? "#0b0f19" : "#ffffff",
          padding: "60px 20px",
          transition: "var(--transition-smooth)"
        }}>
          <h2 style={{
            fontFamily: "var(--font-sans)",
            fontWeight: "850",
            fontSize: "36px",
            color: theme === "dark" ? "#60a5fa" : "#1e3a8a",
            marginBottom: "50px",
            letterSpacing: "-0.5px"
          }}>
            Contact Us
          </h2>
          
          <div style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "50px",
            width: "100%",
            maxWidth: "1050px",
            justifyContent: "center"
          }}>
            {/* Info Panel */}
            <div style={{
              flex: "1 1 350px",
              maxWidth: "400px",
              display: "flex",
              flexDirection: "column",
              gap: "24px"
            }}>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: theme === "dark" ? "#ffffff" : "#1e3a8a" }}>Get in Touch</h3>
              <p style={{ fontSize: "14.5px", color: theme === "dark" ? "#cbd5e1" : "#475569", lineHeight: "1.6", fontWeight: "500" }}>
                Have questions about the ApniLeap platform, campus integration, or sponsorship? Contact our administration team using the details below or send us a message.
              </p>
              
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                marginTop: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(59, 82, 154, 0.1)",
                    color: "#3b529a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px"
                  }}>
                    <FaEnvelope />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Email</span>
                    <a href="mailto:info@apnileap.org" style={{ fontSize: "15px", fontWeight: "700", color: theme === "dark" ? "#60a5fa" : "#3b529a", textDecoration: "none" }}>info@apnileap.org</a>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(59, 82, 154, 0.1)",
                    color: "#3b529a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px"
                  }}>
                    <FaGlobe />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Phone Support</span>
                    <span style={{ fontSize: "15px", fontWeight: "700", color: theme === "dark" ? "#cbd5e1" : "#1e293b" }}>+91 (0836) 2378101</span>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(59, 82, 154, 0.1)",
                    color: "#3b529a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px"
                  }}>
                    <FaBuilding />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Office Address</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: theme === "dark" ? "#cbd5e1" : "#475569", lineHeight: "1.4" }}>
                      CTIE Memorial Complex, BVB KLE Tech Campus, Vidya Nagar, Hubli
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Panel */}
            <div style={{
              flex: "1 1 450px",
              maxWidth: "500px",
              background: theme === "dark" ? "#1e293b" : "#ffffff",
              border: theme === "dark" ? "1px solid #334155" : "1.5px solid rgba(0,0,0,0.04)",
              borderRadius: "16px",
              padding: "30px",
              boxShadow: theme === "dark" ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.03)",
              transition: "var(--transition-smooth)"
            }}>
              <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme === "dark" ? "#94a3b8" : "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Full Name</label>
                  <input 
                    type="text" 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    style={{
                      background: theme === "dark" ? "#0f172a" : "#f8fafc",
                      border: theme === "dark" ? "1px solid #334155" : "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: theme === "dark" ? "#ffffff" : "#0f172a",
                      width: "100%",
                      outline: "none"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme === "dark" ? "#94a3b8" : "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Email Address</label>
                  <input 
                    type="email" 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    style={{
                      background: theme === "dark" ? "#0f172a" : "#f8fafc",
                      border: theme === "dark" ? "1px solid #334155" : "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: theme === "dark" ? "#ffffff" : "#0f172a",
                      width: "100%",
                      outline: "none"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme === "dark" ? "#94a3b8" : "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Subject</label>
                  <input 
                    type="text" 
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    required
                    placeholder="Message subject"
                    style={{
                      background: theme === "dark" ? "#0f172a" : "#f8fafc",
                      border: theme === "dark" ? "1px solid #334155" : "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: theme === "dark" ? "#ffffff" : "#0f172a",
                      width: "100%",
                      outline: "none"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme === "dark" ? "#94a3b8" : "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Message</label>
                  <textarea 
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    placeholder="Type your message here..."
                    rows={4}
                    style={{
                      background: theme === "dark" ? "#0f172a" : "#f8fafc",
                      border: theme === "dark" ? "1px solid #334155" : "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: theme === "dark" ? "#ffffff" : "#0f172a",
                      width: "100%",
                      outline: "none",
                      resize: "vertical"
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    fontWeight: "750",
                    fontSize: "15px",
                    cursor: isSubmittingContact ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.2)",
                    transition: "var(--transition-smooth)",
                    opacity: isSubmittingContact ? 0.8 : 1
                  }}
                >
                  {isSubmittingContact ? (
                    <>
                      <FaSyncAlt style={{ animation: "spin 1.5s infinite linear" }} />
                      <span>Sending message...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }
  };

  if (viewMode === "landing") {
    if (landingTab === "login") {
      if (isAuthenticated && sessionUser && localStorage.getItem("apnileap-token")) {
        setTimeout(() => setViewMode("dashboard"), 0);
        return null;
      }
      const recognizedPersona = mapEmailToPersona(loginEmail);

    return (
      <div style={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        background: "var(--bg-main)",
        fontFamily: "var(--font-sans)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Floating background blur bubbles that change color by theme */}
        <div className="float-bg-1" style={{
          position: "absolute",
          top: "5%",
          right: "10%",
          width: "400px",
          height: "400px",
          background: "var(--primary-glow)",
          borderRadius: "50%",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 1
        }} />
        <div className="float-bg-2" style={{
          position: "absolute",
          bottom: "5%",
          left: "5%",
          width: "400px",
          height: "400px",
          background: "rgba(99, 102, 241, 0.08)",
          borderRadius: "50%",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 1
        }} />

        {/* Global theme selection toggle overlay */}
        <div style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          display: "flex",
          alignItems: "center",
          background: "var(--bg-card)",
          border: "1px solid var(--border-glass)",
          padding: "4px",
          borderRadius: "99px",
          boxShadow: "var(--shadow-premium)",
          zIndex: 100
        }}>
          {[
            { name: "dark", label: "Dark", icon: <FaMoon size={12} /> },
            { name: "light", label: "Light", icon: <FaSun size={12} /> }
          ].map(t => (
            <button
              key={t.name}
              type="button"
              onClick={() => setTheme(t.name)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "99px",
                background: theme === t.name ? "var(--primary)" : "transparent",
                color: theme === t.name ? "var(--text-primary-btn)" : "var(--text-muted)",
                border: "none",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "11px",
                transition: "var(--transition-smooth)"
              }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Major full screen split layout container */}
        <div style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          zIndex: 2,
          position: "relative"
        }}>
          
          {/* Left panel: Overlapping radial gradient 3D spheres & Welcome details */}
          <div style={{
            flex: "1 1 60%",
            maxWidth: "60%",
            background: theme === "dark" ? "#090d16" : "#3b529a",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px",
            borderRight: "1px solid var(--border-subtle)",
            transition: "background 0.5s ease-in-out"
          }}>
            {/* Embedded overlapping gradient 3D Spheres */}
            <div className="login-sphere sphere-1" style={{ top: "-60px", left: "-60px" }} />
            <div className="login-sphere sphere-2" style={{ bottom: "-80px", right: "-40px" }} />
            <div className="login-sphere sphere-3" style={{ top: "35%", left: "30%" }} />
            
            {/* Branding Orb Logo */}
            <div 
              onClick={() => setLandingTab("home")}
              style={{ 
                position: "relative", 
                zIndex: 10, 
                display: "flex", 
                alignItems: "center", 
                gap: "6px", 
                fontFamily: "var(--font-sans)", 
                fontWeight: "800", 
                fontSize: "36px", 
                cursor: "pointer" 
              }}
            >
              <span style={{ color: "#ef4444" }}>Apni</span>
              <span style={{ color: "#ffffff", display: "inline-flex", alignItems: "center" }}>
                Leap
                <span style={{ color: "#10b981", marginLeft: "6px", fontSize: "26px", fontWeight: "900" }}>↗</span>
              </span>
              <span style={{ opacity: 0.85, fontWeight: "400", marginLeft: "10px", color: "#ffffff" }}>Hub</span>
            </div>

            {/* Core welcome text matching reference picture layout */}
            <div style={{ position: "relative", zIndex: 10, margin: "auto 0" }}>
              <h1 style={{
                fontSize: "72px",
                fontWeight: "900",
                color: "white",
                lineHeight: "1.0",
                letterSpacing: "-2px",
                margin: "0 0 10px 0"
              }}>
                WELCOME
              </h1>
              <h2 style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "rgba(255, 255, 255, 0.9)",
                textTransform: "uppercase",
                letterSpacing: "3px",
                marginBottom: "24px"
              }}>
                Campus Governance Portal
              </h2>
              <p style={{
                fontSize: "17px",
                color: "rgba(255, 255, 255, 0.85)",
                lineHeight: "1.7",
                fontWeight: "400",
                maxWidth: "460px",
                margin: "0 0 40px 0"
              }}>
                A robust multi-tenant Agile collaboration suite powered by live Jira Cloud. Experience absolute campus workspace isolation with central Moderator ingestion pathways.
              </p>

              {/* Feature Highlights to balance UI */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "50px" }}>
                
                {/* Feature 1 */}
                <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: "20px", animationDelay: "0.1s" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#4ade80" }}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "17px", color: "white", fontWeight: "700", letterSpacing: "0.5px" }}>Isolated Workspaces</h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>Secure Jira spaces for every corporate project</p>
                  </div>
                </div>
                
                {/* Feature 2 */}
                <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: "20px", animationDelay: "0.2s" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#60a5fa" }}>
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "17px", color: "white", fontWeight: "700", letterSpacing: "0.5px" }}>Live Agile Metrics</h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>Real-time velocity and sprint analytics</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: "20px", animationDelay: "0.3s" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#a78bfa" }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "17px", color: "white", fontWeight: "700", letterSpacing: "0.5px" }}>Multi-Tier Governance</h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>Centralized control for Hub Administrators</p>
                  </div>
                </div>
              </div>

              {/* Quick Connect demo panel removed */}
            </div>

            {/* Footer trademark or copyright */}
            <div style={{ position: "relative", zIndex: 10 }}>
              <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", fontWeight: "500" }}>
                Powered by Jira Cloud API Integration
              </span>
            </div>
          </div>

          {/* Right panel: Modern Sign In form with icons and show password */}
          <div style={{
            flex: "1 1 40%",
            maxWidth: "40%",
            padding: "60px 80px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: theme === "dark" ? "#0f172a" : "#ffffff",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderLeft: "1px solid var(--border-subtle)",
            position: "relative",
            minHeight: "100vh",
            transition: "background 0.5s ease-in-out, border 0.5s ease-in-out"
          }}>
            <div style={{ maxWidth: "450px", width: "100%", margin: "0 auto" }}>
              {!showSignup ? (
                <>
                  <div style={{ marginBottom: "28px" }}>
                    <h3 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)", marginBottom: "6px", letterSpacing: "-0.5px" }}>
                      Sign In
                    </h3>
                    <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                      Enter your campus spoke or administrative email to connect.
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {registrationNotice && (
                      <div style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        color: "var(--text-main)",
                        fontSize: "13px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        position: "relative"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "800", color: "#10b981", fontSize: "14px" }}>
                            <FaUserCheck size={18} /> {registrationNotice.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => setRegistrationNotice(null)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--text-muted)",
                              fontSize: "16px",
                              padding: "2px 6px"
                            }}
                          >
                            ✕
                          </button>
                        </div>
                        <p style={{ margin: 0, lineHeight: "1.5", color: "var(--text-muted)", fontSize: "12.5px" }}>
                          {registrationNotice.message}
                        </p>
                        <div style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          marginTop: "2px",
                          fontSize: "11.5px",
                          fontWeight: "700"
                        }}>
                          <span style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)" }}>
                            Campus: {registrationNotice.campus}
                          </span>
                          <span style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                            Role: {registrationNotice.role}
                          </span>
                          <span style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                            Pending: {registrationNotice.approver} Verification
                          </span>
                        </div>
                      </div>
                    )}
                    {loginError && (
                      <div style={{
                        padding: "11px 14px",
                        borderRadius: "10px",
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.18)",
                        color: "#dc2626",
                        fontSize: "12.5px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#f87171" }}><FaExclamationTriangle /> {loginError}</span>
                      </div>
                    )}

                    {/* Email Input Field */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "var(--text-muted)",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px"
                      }}>
                        Email Address
                      </label>
                      <div style={{ position: "relative" }}>
                        <FaEnvelope style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          fontSize: "14px"
                        }} />
                        <input
                          type="text"
                          placeholder="coordinator@kle.edu or admin@apnileap.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 14px 12px 42px",
                            borderRadius: "10px",
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-main)",
                            outline: "none",
                            fontSize: "14px",
                            transition: "var(--transition-smooth)"
                          }}
                        />
                      </div>
                      
                      {/* Dynamic Persona Indicator badge */}
                      {recognizedPersona && (
                        <div style={{
                          marginTop: "8px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: recognizedPersona === "executive"
                            ? "rgba(124, 58, 237, 0.08)"
                            : recognizedPersona === "moderator"
                            ? "rgba(255, 140, 0, 0.08)"
                            : "rgba(59, 82, 154, 0.08)",
                          border: recognizedPersona === "executive"
                            ? "1px solid rgba(124, 58, 237, 0.2)"
                            : recognizedPersona === "moderator"
                            ? "1px solid rgba(255, 140, 0, 0.2)"
                            : "1px solid rgba(59, 82, 154, 0.2)",
                          color: recognizedPersona === "executive"
                            ? "#7c3aed"
                            : recognizedPersona === "moderator"
                            ? "#ff8c00"
                            : "#3b529a",
                          fontSize: "11.5px",
                          fontWeight: "750",
                          animation: "slideIn 0.2s ease-out"
                        }}>
                          {recognizedPersona === "executive"
                            ? "Executive Administrator"
                            : recognizedPersona === "moderator"
                            ? "Central Moderator"
                            : `${recognizedPersona.replace("spoke-", "").toUpperCase()} Spoke Coordinator`}
                        </div>
                      )}
                    </div>

                    {/* Password Input Field */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "var(--text-muted)",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px"
                      }}>
                        Password
                      </label>
                      <div style={{ position: "relative" }}>
                        <FaLock style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          fontSize: "14px"
                        }} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 65px 12px 42px",
                            borderRadius: "10px",
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-main)",
                            outline: "none",
                            fontSize: "14px",
                            transition: "var(--transition-smooth)"
                          }}
                        />
                        {/* SHOW / HIDE Password button */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            fontSize: "11px",
                            fontWeight: "800",
                            cursor: "pointer",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            outline: "none",
                            padding: "4px"
                          }}
                        >
                          {showPassword ? "HIDE" : "SHOW"}
                        </button>
                      </div>
                    </div>

                    {/* Remember me & Forgot Password */}
                    <div style={{ display: "flex", justifySpaceBetween: "space-between", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                        <input type="checkbox" style={{ accentColor: "var(--primary)" }} />
                        <span>Remember me</span>
                      </label>
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); triggerToast("Password recovery is handled by your local campus AD server.", "info"); }} style={{ color: "var(--secondary)", textDecoration: "none", fontWeight: "700" }}>
                        Forgot Password?
                      </a>
                    </div>

                    {/* Submit Sign In button */}
                    {showOtpInput && (
                      <div style={{
                        marginTop: "10px",
                        padding: "16px",
                        background: "rgba(249, 115, 22, 0.08)",
                        border: "1.5px solid rgba(249, 115, 22, 0.45)",
                        borderRadius: "10px",
                        animation: "slideIn 0.3s ease-out"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                            Enter 6-Digit Email Code
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setShowOtpInput(false);
                              setLoginOtp("");
                              setLoginError("");
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-muted)",
                              fontSize: "11px",
                              cursor: "pointer",
                              textDecoration: "underline"
                            }}
                          >
                            Change Email
                          </button>
                        </div>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            placeholder="123456"
                            value={loginOtp}
                            onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                            maxLength="6"
                            autoFocus
                            style={{
                              width: "100%", padding: "12px 14px", borderRadius: "8px",
                              background: "var(--bg-card)", border: "1.5px solid #f97316",
                              color: "var(--text-main)", outline: "none", fontSize: "18px",
                              textAlign: "center", fontWeight: "800", letterSpacing: "6px"
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "11px" }}>
                          <span style={{ color: "var(--text-muted)" }}>
                            Code sent to <strong>{loginEmail}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                triggerToast("Resending verification code...", "info");
                                await axios.post("http://localhost:5001/api/login", { email: loginEmail, password: loginPassword });
                                triggerToast("A new verification code was sent to your email.", "success");
                              } catch (err) {
                                triggerToast("Failed to resend code.", "error");
                              }
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#f97316",
                              fontWeight: "700",
                              cursor: "pointer",
                              textDecoration: "underline"
                            }}
                          >
                            Resend Code
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      style={{
                        marginTop: "10px",
                        padding: "13px 20px",
                        borderRadius: "10px",
                        background: "#f97316",
                        color: "#ffffff",
                        border: "none",
                        fontWeight: "800",
                        fontSize: "14.5px",
                        cursor: isLoggingIn ? "not-allowed" : "pointer",
                        boxShadow: "0 6px 15px rgba(249, 115, 22, 0.22)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        opacity: isLoggingIn ? 0.8 : 1,
                        transition: "var(--transition-smooth)"
                      }}
                    >
                      {isLoggingIn ? (
                        <>
                          <FaSyncAlt className="pulse-glow" style={{ animation: "pulseGlow 1.5s infinite linear" }} />
                          <span>{showOtpInput ? "Verifying Code..." : "Connecting to Live Jira Hub..."}</span>
                        </>
                      ) : (
                        <>
                          <span>{showOtpInput ? "Verify Code & Sign In" : "Sign In"}</span>
                          <span><FaPaperPlane /></span>
                        </>
                      )}
                    </button>

                    {/* Sign Up Link */}
                    <div style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "var(--text-dim)" }}>
                      Don't have an Account?{" "}
                      <a
                        href="#signup"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowSignup(true);
                          setLoginError("");
                          setSignupError("");
                        }}
                        style={{ color: "var(--secondary)", fontWeight: "700", textDecoration: "none" }}
                      >
                        Register Student / Faculty
                      </a>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "28px" }}>
                    <h3 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)", marginBottom: "6px", letterSpacing: "-0.5px" }}>
                      Campus Registration
                    </h3>
                    <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                      Create a persistent account to track agile sprints, submit deliverables, or manage campus spoke projects.
                    </p>
                  </div>

                  <form onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {signupError && (
                      <div style={{
                        padding: "11px 14px",
                        borderRadius: "10px",
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.18)",
                        color: "#dc2626",
                        fontSize: "12.5px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#f87171" }}><FaExclamationTriangle /> {signupError}</span>
                      </div>
                    )}

                    {/* Full Name Field */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "var(--text-muted)",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px"
                      }}>
                        Full Name
                      </label>
                      <div style={{ position: "relative" }}>
                        <FaUser style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          fontSize: "14px"
                        }} />
                        <input
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 14px 12px 42px",
                            borderRadius: "10px",
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-main)",
                            outline: "none",
                            fontSize: "14px",
                            transition: "var(--transition-smooth)"
                          }}
                        />
                      </div>
                    </div>

                    {/* Email Input Field */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "var(--text-muted)",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px"
                      }}>
                        Email Address
                      </label>
                      <div style={{ position: "relative" }}>
                        <FaEnvelope style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          fontSize: "14px"
                        }} />
                        <input
                          type="text"
                          placeholder="e.g. student@kle.edu"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 14px 12px 42px",
                            borderRadius: "10px",
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-main)",
                            outline: "none",
                            fontSize: "14px",
                            transition: "var(--transition-smooth)"
                          }}
                        />
                      </div>
                    </div>

                    {/* Password Input Field */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "var(--text-muted)",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px"
                      }}>
                        Choose Password
                      </label>
                      <div style={{ position: "relative" }}>
                        <FaLock style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          fontSize: "14px"
                        }} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 65px 12px 42px",
                            borderRadius: "10px",
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-main)",
                            outline: "none",
                            fontSize: "14px",
                            transition: "var(--transition-smooth)"
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            fontSize: "11px",
                            fontWeight: "800",
                            cursor: "pointer",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            outline: "none",
                            padding: "4px"
                          }}
                        >
                          {showPassword ? "HIDE" : "SHOW"}
                        </button>
                      </div>
                    </div>

                    {/* Select Platform Role */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "var(--text-muted)",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px"
                      }}>
                        Select Platform Role
                      </label>
                      <div style={{ position: "relative" }}>
                        <FaBriefcase style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          fontSize: "14px",
                          zIndex: 10
                        }} />
                        <select
                          value={signupRole}
                          onChange={(e) => setSignupRole(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 14px 12px 42px",
                            borderRadius: "10px",
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-main)",
                            outline: "none",
                            fontSize: "14px",
                            cursor: "pointer",
                            appearance: "none",
                            WebkitAppearance: "none",
                            transition: "var(--transition-smooth)"
                          }}
                        >
                          <option value="Student Developer">Student Developer</option>
                          <option value="Faculty Mentor">Faculty Mentor (Spoke Coordinator)</option>
                        </select>
                        <div style={{
                          position: "absolute",
                          right: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          border: "solid transparent",
                          borderWidth: "5px 5px 0 5px",
                          borderTopColor: "#64748b"
                        }} />
                      </div>
                    </div>

                    {/* Select Campus Spoke */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "var(--text-muted)",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px"
                      }}>
                        Select Campus Spoke
                      </label>
                      <div style={{ position: "relative" }}>
                        <FaGraduationCap style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          fontSize: "14px",
                          zIndex: 10
                        }} />
                        <select
                          value={signupCampus}
                          onChange={(e) => setSignupCampus(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 14px 12px 42px",
                            borderRadius: "10px",
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-main)",
                            outline: "none",
                            fontSize: "14px",
                            cursor: "pointer",
                            appearance: "none",
                            WebkitAppearance: "none",
                            transition: "var(--transition-smooth)"
                          }}
                        >
                          {(spokesList.length > 0 ? spokesList : Object.entries(dynamicSpokes).map(([id, s]) => ({ id, ...s }))).map(sp => (
                            <option key={sp.id} value={sp.id}>
                              {sp.name} {sp.id === "3" ? "(Hub Campus)" : ""}
                            </option>
                          ))}
                        </select>
                        <div style={{
                          position: "absolute",
                          right: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          border: "solid transparent",
                          borderWidth: "5px 5px 0 5px",
                          borderTopColor: "#64748b"
                        }} />
                      </div>
                    </div>

                    {/* Submit Registration button */}
                    <button
                      type="submit"
                      disabled={isRegistering}
                      style={{
                        marginTop: "10px",
                        padding: "13px 20px",
                        borderRadius: "10px",
                        background: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        fontWeight: "800",
                        fontSize: "14.5px",
                        cursor: isRegistering ? "not-allowed" : "pointer",
                        boxShadow: "0 6px 15px rgba(239, 68, 68, 0.22)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        opacity: isRegistering ? 0.8 : 1,
                        transition: "var(--transition-smooth)"
                      }}
                    >
                      {isRegistering ? (
                        <>
                          <FaSyncAlt className="pulse-glow" style={{ animation: "pulseGlow 1.5s infinite linear" }} />
                          <span>Creating account persistently...</span>
                        </>
                      ) : (
                        <>
                          <span>Register {signupRole === "Faculty Mentor" ? "Faculty" : "Student"} Account</span>
                          <span>{signupRole === "Faculty Mentor" ? <FaUsers style={{ marginRight: "4px" }} /> : <FaGraduationCap style={{ marginRight: "4px" }} />}</span>
                        </>
                      )}
                    </button>

                    {/* Sign In Link */}
                    <div style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "var(--text-dim)" }}>
                      Already have an account?{" "}
                      <a
                        href="#login"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowSignup(false);
                          setLoginError("");
                          setSignupError("");
                        }}
                        style={{ color: "var(--secondary)", fontWeight: "700", textDecoration: "none" }}
                      >
                        Sign In here
                      </a>
                    </div>
                  </form>
                </>
              )}
            </div> {/* Closing the maxWidth wrapper */}
          </div>
        </div>
      </div>
    );
    } else {
      // Render public site landing pages
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
          background: theme === "dark" ? "#0b0f19" : "#ffffff",
          fontFamily: "var(--font-sans)",
          overflowX: "hidden",
          overflowY: "auto",
          transition: "var(--transition-smooth)"
        }}>
          {renderPublicNavbar()}
          <main style={{ flex: 1, width: "100%" }}>
            {renderPublicTabContent()}
          </main>
          {renderPublicFooter()}
          {renderPortalModals()}
          
          {/* Toast notifications container */}
          <div className="toast-container">
            {toasts.map((toast) => (
              <div key={toast.id} className="toast" style={{
                borderLeftColor: toast.type === "warning" ? "var(--accent)" : "var(--primary)"
              }}>
                {toast.type === "warning" ? <FaExclamationCircle style={{ color: "var(--accent)" }} /> : <FaCheckCircle style={{ color: "var(--primary)" }} />}
                <span>{toast.message}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  const isCentralAdmin = currentPersona === "moderator" || currentPersona === "executive";

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", maxWidth: "100vw", background: "var(--bg-main)", overflow: "hidden" }}>
      <div style={{ display: "flex", width: "100%", height: "100vh", background: "var(--bg-card)", overflow: "hidden" }}>
      
      {/* Visual Animation Keyframes Injection */}
      <style>{`
        @keyframes envelopeSlide {
          0% { transform: translateY(50px) scale(0.8); opacity: 0; }
          20% { transform: translateY(0) scale(1); opacity: 1; }
          80% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-300px) scale(0.3) rotate(15deg); opacity: 0; }
        }
        @keyframes paperInsert {
          0% { transform: translateY(0); opacity: 1; }
          40% { transform: translateY(24px); opacity: 0.8; }
          50%, 100% { transform: translateY(40px); opacity: 0; }
        }
        @keyframes pulseWarning {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .overdue-badge-blink {
          animation: pulseWarning 1.5s infinite ease-in-out;
          background: var(--priority-high-bg) !important;
          border-color: var(--priority-high-border) !important;
          color: var(--priority-high-text) !important;
        }
        @keyframes blockedBorderGlow {
          0%, 100% { border-color: rgba(249, 115, 22, 0.35); box-shadow: 0 0 4px rgba(249, 115, 22, 0.15); }
          50% { border-color: rgba(249, 115, 22, 0.95); box-shadow: 0 0 12px rgba(249, 115, 22, 0.35); }
        }
        .kanban-card-blocked {
          animation: blockedBorderGlow 2s infinite ease-in-out !important;
          border-style: dashed !important;
          border-width: 1.5px !important;
        }
      `}</style>

      {/* DUAL-COLUMN SIDEBAR ASIDE COMPONENT */}
      <aside
        style={{
          width: isSidebarCollapsed ? "80px" : "320px",
          display: "flex",
          flexDirection: "row",
          transition: "var(--transition-smooth)",
          zIndex: 10,
          background: "transparent",
        }}
      >
        {/* COLUMN 1: NARROW UTILITY RAIL (LEFT SIDE) */}
        <div
          style={{
            width: isSidebarCollapsed ? "80px" : "65px",
            background: "var(--bg-sidebar-rail)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px 8px",
            gap: "28px",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "var(--transition-smooth)",
          }}
        >
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              background: "var(--sidebar-btn-bg)",
              border: "1px solid var(--sidebar-btn-border)",
              color: "var(--sidebar-btn-color)",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
              transition: "var(--transition-smooth)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--sidebar-hover-bg)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--sidebar-btn-bg)"}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />}
          </button>

          {/* Rail Utility Icons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
            {/* View Landing/Public Website */}
            <div
              onClick={() => {
                setViewMode("landing");
                setLandingTab("home");
                triggerToast("Navigating to Public Landing Page");
              }}
              className="sidebar-rail-icon"
              title="Public Home Page"
            >
              <FaGlobe size={20} />
            </div>

            {isCentralAdmin ? (
              <div
                onClick={() => {
                  setActiveWorkspace("hub");
                  triggerToast("Switched Workspace: Executive Portfolio Hub");
                }}
                className={`sidebar-rail-icon ${activeWorkspace === "hub" ? "active" : ""}`}
                title="Executive Portfolio Hub"
              >
                <FaHome size={20} />
              </div>
            ) : currentPersona === "moderator" ? (
              <>
                <div
                  onClick={() => {
                    setActiveWorkspace("moderator");
                    triggerToast("Switched Workspace: Central Moderation Portal");
                  }}
                  className={`sidebar-rail-icon ${activeWorkspace === "moderator" ? "active" : ""}`}
                  title="Central Moderation Portal"
                >
                  <FaBook size={20} />
                </div>

                <div
                  onClick={() => {
                    setActiveWorkspace("meetings");
                    triggerToast("Switched Workspace: Collaboration & Sync Meetings");
                  }}
                  className={`sidebar-rail-icon ${activeWorkspace === "meetings" ? "active" : ""}`}
                  title="Sync Schedule"
                >
                  <FaCalendarAlt size={20} />
                </div>
              </>
            ) : sessionUser?.role === "Corporate Partner" ? (
              <div
                onClick={() => {
                  setActiveWorkspace(currentPersona);
                  setActiveView("dashboard");
                  triggerToast(`Switched Workspace: Sponsor Dashboard`);
                }}
                className={`sidebar-rail-icon ${(activeWorkspace === currentPersona && activeView === "dashboard") ? "active" : ""}`}
                title="Sponsor Portal"
              >
                <FaHome size={20} />
              </div>
            ) : (
              <>
                <div
                  onClick={() => {
                    setActiveWorkspace(currentPersona);
                    setActiveView("dashboard");
                    triggerToast(`Switched Workspace: ${sessionUser?.role === "Faculty Mentor" ? "Faculty Mentor Portal" : sessionUser?.role === "Student Developer" ? "Student Dashboard" : "Spoke Dashboard"}`);
                  }}
                  className={`sidebar-rail-icon ${(activeWorkspace === currentPersona && activeView === "dashboard") ? "active" : ""}`}
                  title={sessionUser?.role === "Faculty Mentor" ? "Faculty Mentor Portal" : sessionUser?.role === "Student Developer" ? "Student Dashboard" : "Spoke Dashboard"}
                >
                  <FaHome size={20} />
                </div>


              </>
            )}

            {sessionUser?.role !== "Corporate Partner" && (
              <>
                <div
                  onClick={() => {
                    setShowChatDrawer(true);
                    triggerToast("Opening FIP Cohort Live Chat...");
                  }}
                  className={`sidebar-rail-icon ${showChatDrawer ? "active" : ""}`}
                  title="Cohort Forums Chat"
                >
                  <FaComments size={20} />
                </div>

                <div
                  onClick={() => {
                    setShowCohortModal(true);
                    triggerToast("Opening Academic Cohort Progress...");
                  }}
                  className={`sidebar-rail-icon ${showCohortModal ? "active" : ""}`}
                  title="Academic Cohorts"
                >
                  <FaGraduationCap size={20} />
                </div>

                <div
                  onClick={() => {
                    setShowSettingsModal(true);
                    triggerToast("Opening System Settings...");
                  }}
                  className={`sidebar-rail-icon ${showSettingsModal ? "active" : ""}`}
                  title="System Settings"
                >
                  <FaCog size={20} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* COLUMN 2: MAIN NAVIGATION PANEL (RIGHT SIDE) */}
        <div
          style={{
            width: isSidebarCollapsed ? "0px" : "255px",
            opacity: isSidebarCollapsed ? 0 : 1,
            background: "var(--bg-sidebar)",
            display: "flex",
            flexDirection: "column",
            padding: isSidebarCollapsed ? "24px 0px" : "24px 0px 24px 16px",
            overflow: "hidden",
            transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease-in-out, padding 0.25s ease",
            boxSizing: "border-box"
          }}
        >
          {/* Sidebar Logo Header */}
          <div 
            onClick={() => {
              setViewMode("landing");
              setLandingTab("home");
            }}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              fontFamily: "var(--font-sans)", 
              fontWeight: "800", 
              fontSize: "24px", 
              cursor: "pointer", 
              marginBottom: "32px", 
              paddingLeft: "12px" 
            }}
          >
            <span style={{ color: "#ef4444" }}>Apni</span>
            <span style={{ color: "#3b529a", display: "inline-flex", alignItems: "center" }}>
              Leap
              <span style={{ color: "#10b981", marginLeft: "4px", fontSize: "18px", fontWeight: "900" }}>↗</span>
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, overflowY: "auto", paddingRight: "4px" }}>
            
            {/* Multi-Tenant Persona Access Controller (Admin Only) */}
            {sessionUser && sessionUser.role === "Central Moderator" && (
              <div style={{
                padding: "12px 14px",
                marginBottom: "16px",
                background: "var(--sidebar-card-bg)",
                border: "1px solid var(--sidebar-border)",
                borderRadius: "16px",
                marginRight: "16px",
                marginTop: "4px"
              }}>
                <label style={{
                  display: "block",
                  fontSize: "9px",
                  fontWeight: "900",
                  color: "var(--sidebar-text-dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: "8px"
                }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><FaUser /> Active Role</span>
                </label>
                <select
                  value={currentPersona}
                  onChange={(e) => {
                    const newPersona = e.target.value;
                    setCurrentPersona(newPersona);
                    const name = newPersona === "moderator" 
                      ? "Central Moderator" 
                      : newPersona === "project-manager" 
                        ? "Project Manager" 
                        : newPersona === "faculty-mentor" 
                          ? "Faculty Mentor" 
                          : (dynamicSpokes[newPersona.replace("spoke-", "")]?.name || (newPersona === "spoke-kle" ? "KLE Spoke" : newPersona === "spoke-coep" ? "COEP Spoke" : newPersona === "spoke-mmcoep" ? "MMCOEP Spoke" : newPersona === "spoke-rit" ? "RIT Spoke" : newPersona));
                    triggerToast(`Switched Profile: Active permissions set to ${name}`);
                  }}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--sidebar-border)",
                    color: "var(--sidebar-text-main)",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    width: "100%",
                    outline: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)"
                  }}
                >
                  <option value="moderator" style={{ background: "var(--bg-sidebar)" }}>Moderator</option>
                  <option value="project-manager" style={{ background: "var(--bg-sidebar)" }}>Project Manager</option>
                  <option value="faculty-mentor" style={{ background: "var(--bg-sidebar)" }}>Faculty Mentor</option>
                  {Object.entries(dynamicSpokes).map(([id, spoke]) => {
                    const val = id === "3" ? "spoke-kle" : id === "101" ? "spoke-coep" : id === "102" ? "spoke-mmcoep" : id === "103" ? "spoke-rit" : ("spoke-" + id);
                    return (
                      <option key={id} value={val} style={{ background: "var(--bg-sidebar)" }}>
                        {spoke.name.replace(/ Spoke$/i, '').replace(/ Campus$/i, '').replace(/ Technological University$/i, ' Tech')} Coordinator
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Section 1: ACTIVE VIEW MODE (Hidden if viewing Hub or Moderator or Sponsor) */}
            {activeWorkspace !== "hub" && activeWorkspace !== "moderator" && activeWorkspace !== "meetings" && sessionUser?.role !== "Corporate Partner" && sessionUser?.role !== "Project Mentor" && (
              <>
                <div style={{ fontSize: "9px", fontWeight: "850", textTransform: "uppercase", color: "var(--sidebar-text-dim)", letterSpacing: "1px", paddingLeft: "12px", marginTop: "8px", marginBottom: "4px" }}>
                  Views
                </div>
                {activeWorkspace === "faculty-mentor" ? (
                  <>
                    <SidebarNavItem
                      active={activeView === "dashboard"}
                      icon={<FaChartPie size={16} />}
                      label="Overview"
                      collapsed={false}
                      onClick={() => setActiveView("dashboard")}
                      variant="accent"
                    />
                    <SidebarNavItem
                      active={activeView === "teams"}
                      icon={<FaUsers size={16} />}
                      label="Create & Manage Teams"
                      collapsed={false}
                      onClick={() => setActiveView("teams")}
                    />
                    <SidebarNavItem
                      active={activeView === "meetings"}
                      icon={<FaCalendarAlt size={16} />}
                      label="Create Meeting"
                      collapsed={false}
                      onClick={() => setActiveView("meetings")}
                    />
                    <SidebarNavItem
                      active={activeView === "student-approvals"}
                      icon={<FaUserCheck size={16} />}
                      label="Student Verifications"
                      collapsed={false}
                      onClick={() => setActiveView("student-approvals")}
                    />
                    <SidebarNavItem
                      active={activeView === "confluence"}
                      icon={<FaBook size={16} />}
                      label="Wiki & Docs"
                      collapsed={false}
                      onClick={() => setActiveView("confluence")}
                    />
                  </>
                ) : (
                  <>
                    <SidebarNavItem
                      active={activeView === "dashboard"}
                      icon={<FaChartPie size={16} />}
                      label={sessionUser?.role === "Student Developer" ? "Student Dashboard" : "Overview"}
                      collapsed={false}
                      onClick={() => setActiveView("dashboard")}
                      variant="accent"
                    />
                    {sessionUser?.role === "Student Developer" && (
                      <SidebarNavItem
                        active={activeView === "kanban"}
                        icon={<FaClipboardList size={16} />}
                        label="Sprint Kanban Board"
                        collapsed={false}
                        onClick={() => setActiveView("kanban")}
                      />
                    )}
                    <SidebarNavItem
                      active={activeView === "confluence"}
                      icon={<FaBook size={16} />}
                      label="Wiki & Docs"
                      collapsed={false}
                      onClick={() => setActiveView("confluence")}
                    />
                  </>
                )}
                
                <hr style={{ border: "none", borderTop: "1px solid var(--sidebar-border)", margin: "8px 16px 8px 0" }} />
              </>
            )}

            {/* Section 3: Campuses & Roles (Hidden for Faculty Mentors) */}
            {sessionUser?.role !== "Faculty Mentor" && currentPersona !== "faculty-mentor" && activeWorkspace !== "faculty-mentor" && (
              <>
                <div style={{ fontSize: "9px", fontWeight: "850", textTransform: "uppercase", color: "var(--sidebar-text-dim)", letterSpacing: "1px", paddingLeft: "12px", marginTop: "4px", marginBottom: "4px" }}>
                  {sessionUser?.role === "Student Developer" ? "Student Workspace" : "Campuses & Roles"}
                </div>

                {((isCentralAdmin && currentPersona !== "executive") || currentPersona === "project-manager") && (
                  <SidebarNavItem
                    active={activeWorkspace === "project-manager"}
                    icon={<FaClipboardList style={{ fontSize: "16px" }} />}
                    label="Project Manager Portal"
                    collapsed={false}
                    onClick={() => {
                      setActiveWorkspace("project-manager");
                      setActiveView("dashboard");
                    }}
                  />
                )}

                {((isCentralAdmin && currentPersona !== "executive" && currentPersona !== "faculty-mentor")) && (
                  <SidebarNavItem
                    active={activeWorkspace === "faculty-mentor"}
                    icon={<FaGraduationCap style={{ fontSize: "16px" }} />}
                    label="Faculty Mentor Portal"
                    collapsed={false}
                    onClick={() => {
                      setActiveWorkspace("faculty-mentor");
                      setActiveView("dashboard");
                    }}
                  />
                )}
                
                {isCentralAdmin && (
                  <SidebarNavItem
                    active={activeWorkspace === "hub"}
                    icon={<FaGlobe style={{ fontSize: "16px" }} />}
                    label="Main Dashboard"
                    collapsed={false}
                    onClick={() => setActiveWorkspace("hub")}
                  />
                )}

                {currentPersona === "moderator" && (
                  <>
                    <SidebarNavItem
                      active={activeWorkspace === "moderator" && moderatorActiveTab !== "spokes"}
                      icon={<FaBriefcase size={16} />}
                      label="Central Moderation Portal"
                      collapsed={false}
                      onClick={() => {
                        setActiveWorkspace("moderator");
                        setModeratorActiveTab("proposals");
                      }}
                    />
                    <SidebarNavItem
                      active={activeWorkspace === "moderator" && moderatorActiveTab === "spokes"}
                      icon={<FaBuilding style={{ fontSize: "16px" }} />}
                      label="Campus Spokes"
                      collapsed={false}
                      onClick={() => {
                        setActiveWorkspace("moderator");
                        setModeratorActiveTab("spokes");
                      }}
                    />
                    <SidebarNavItem
                      active={activeWorkspace === "meetings"}
                      icon={<FaCalendarAlt style={{ fontSize: "16px" }} />}
                      label="Meetings"
                      collapsed={false}
                      onClick={() => setActiveWorkspace("meetings")}
                    />
                  </>
                )}

                {/* Spoke Campuses list (Dynamic from PostgreSQL) */}
                {Object.entries(dynamicSpokes).map(([spokeId, spoke]) => {
                  const ws = spokeId === "3" ? "spoke-kle" : spokeId === "101" ? "spoke-coep" : spokeId === "102" ? "spoke-mmcoep" : spokeId === "103" ? "spoke-rit" : ("spoke-" + spokeId);
                  const canView = (isCentralAdmin || currentPersona === ws || (sessionUser?.role === "Student Developer" && String(sessionUser.campusId || sessionUser.spokeId) === String(spokeId)) || (sessionUser?.role === "Spoke Coordinator" && String(sessionUser.campusId || sessionUser.spokeId) === String(spokeId))) && sessionUser?.role !== "Faculty Mentor" && currentPersona !== "faculty-mentor" && activeWorkspace !== "faculty-mentor";
                  if (!canView) return null;
                  const isStudent = sessionUser?.role === "Student Developer";
                  const cleanName = spoke.name.replace(/ Spoke$/i, '').replace(/ Campus$/i, '').replace(/ Technological University$/i, ' Tech');
                  return (
                    <SidebarNavItem
                      key={spokeId}
                      active={activeWorkspace === ws}
                      icon={isStudent ? <FaGraduationCap /> : <FaBuilding />}
                      label={isStudent ? (cleanName + " Student Hub") : (cleanName + " Campus")}
                      collapsed={false}
                      onClick={() => {
                        setActiveWorkspace(ws);
                        setActiveView("dashboard");
                      }}
                    />
                  );
                })}
              </>
            )}
            
            <hr style={{ border: "none", borderTop: "1px solid var(--sidebar-border)", margin: "12px 16px 12px 0" }} />

            {/* Connection Status Indicator */}
            <div style={{ padding: "12px 14px", fontSize: "11px", border: "1px solid var(--sidebar-border)", background: "var(--sidebar-card-bg)", borderRadius: "16px", marginRight: "16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: hasError ? "#ef4444" : "#10b981",
                  display: "inline-block"
                }} className={hasError ? "" : "pulse-glow"}></span>
                <span style={{ fontWeight: "700", color: "var(--sidebar-text-main)" }}>{connectionStatus}</span>
              </div>
              <p style={{ color: "var(--sidebar-text-muted)", fontSize: "10px", lineHeight: "1.3" }}>
                {hasError 
                  ? "Jira API server offline. Check logs."
                  : "Live tracking active. Auto-refreshing."}
              </p>
            </div>
          </nav>

          {/* Sidebar Footer User Detail */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: "16px",
            borderTop: "1px solid var(--sidebar-border)",
            marginRight: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
              <img
                src={currentUser?.avatarUrls?.["48x48"] || "https://i.pravatar.cc/100?img=64"}
                alt="Logged user profile"
                style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid var(--sidebar-border)" }}
              />
              <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <span style={{ fontWeight: "600", fontSize: "13px", color: "var(--sidebar-text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {sessionUser?.displayName || currentUser?.displayName || "Jira Administrator"}
                </span>
                <span style={{ color: "var(--sidebar-text-muted)", fontSize: "10px" }}>
                  {sessionUser?.role || "Active Session"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main style={{ flex: 1, padding: "26px 36px", display: "flex", flexDirection: "column", gap: "26px", overflowY: "auto", background: "var(--bg-content)", minWidth: 0 }}>
        
        {/* HEADER & NAV BAR */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          width: "100%"
        }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px", margin: "0" }}>
              {(() => {
                if (activeWorkspace === "hub") return "ApniLeap Executive Portfolio Hub";
                if (activeWorkspace === "moderator") return "Central Moderation Portal";
                if (activeWorkspace === "meetings") return "Collaboration & Sync Meetings";
                
                let wsName = "Spoke";
                if (sessionUser?.role === "Student Developer") {
                  return activeView === "dashboard"
                    ? "Student Dashboard"
                    : "Student Task Board";
                } else if (activeWorkspace === "playground") {
                  wsName = "Playground";
                } else if (activeWorkspace === "project-manager") {
                  wsName = "Project Manager";
                } else if (activeWorkspace === "faculty-mentor") {
                  if (activeView === "teams") return "Faculty Mentor - Create & Manage Teams";
                  if (activeView === "meetings") return "Faculty Mentor - Team Meetings & Syncs";
                  if (activeView === "student-approvals") return "Faculty Mentor - Student Verifications";
                  if (activeView === "kanban") return "Faculty Mentor Task Board";
                  return "Faculty Mentor Overview";
                } else if (activeWorkspace?.startsWith("sponsor-") || activeWorkspace === "project-mentor" || sessionUser?.role === "Corporate Partner" || sessionUser?.role === "Project Mentor") {
                  const company = sessionUser?.displayName?.replace(" Sponsor", "")?.replace(" Mentor", "") || activeWorkspace?.replace("sponsor-", "").toUpperCase() || "Corporate";
                  const suffix = (sessionUser?.role === "Project Mentor" || activeWorkspace === "project-mentor") ? "Project Mentor" : "Sponsor";
                  wsName = `${company} ${suffix}`;
                } else {
                  wsName = (dynamicSpokes[currentBoardId] || SPOKES[currentBoardId])?.name || "Spoke";
                }
                
                return activeView === "dashboard"
                  ? `${wsName} Dashboard`
                  : `${wsName} Task Board`;
              })()}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              {activeWorkspace === "hub"
                ? "Unified metrics, multi-spoke tracking, corporate partner projects, and live milestone delivery across all 4 institutions."
                : activeWorkspace === "moderator"
                ? "Review project proposals, sponsor allocations, and inter-spoke synchronization."
                : activeWorkspace === "meetings"
                ? "Track your active sprint tasks, team project deliverables, mentor feedback, and upcoming deadlines."
                : activeWorkspace === "faculty-mentor" && activeView === "teams"
                ? "Assemble student sprint teams, designate student leaders, and evaluate final project milestones."
                : activeWorkspace === "faculty-mentor" && activeView === "meetings"
                ? "Schedule team sprint syncs, review agendas, and conduct virtual evaluations with your student teams."
                : activeWorkspace === "faculty-mentor" && activeView === "student-approvals"
                ? "Review and verify newly registered students for your campus spoke before granting workspace access."
                : activeWorkspace === "faculty-mentor" && activeView === "dashboard"
                ? "Monitor assigned industry projects, verify deliverables, and track campus progress."
                : activeView === "dashboard" 
                ? "Track student progress, team assignments, project tasks, and upcoming deadlines." 
                : "Drag issues across columns to transition status, update fields, or track work progression."
              }
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            {/* Global theme selection toggle bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0, 0, 0, 0.04)",
              padding: "4px",
              borderRadius: "99px",
              boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.03)"
            }}>
              {[
                { name: "dark", label: "Dark", icon: <FaMoon size={11} /> },
                { name: "light", label: "Light", icon: <FaSun size={11} /> }
              ].map(t => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setTheme(t.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "5px 11px",
                    borderRadius: "99px",
                    background: theme === t.name ? "var(--primary)" : "transparent",
                    color: theme === t.name ? "#ffffff" : "var(--text-muted)",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "10.5px",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Live Refresh button */}
            <button
              onClick={() => activeWorkspace === "hub" ? fetchHubMetrics(false) : activeWorkspace === "moderator" ? fetchModeratorProjects(false) : fetchJiraTasks(false)}
              className="btn-secondary"
              disabled={isLoading || (activeWorkspace === "hub" && isHubLoading) || (activeWorkspace === "moderator" && isModeratorLoading)}
              style={{ padding: "10.5px 12px", border: "1px solid rgba(0, 0, 0, 0.08)", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)" }}
              title="Refetch Data"
            >
              <FaSyncAlt size={13} className={isLoading || (activeWorkspace === "hub" && isHubLoading) || (activeWorkspace === "moderator" && isModeratorLoading) ? "pulse-glow" : ""} />
            </button>

            {activeView === "kanban" && activeWorkspace !== "hub" && activeWorkspace !== "moderator" && activeWorkspace !== "meetings" && currentPersona !== "moderator" && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="btn-primary"
              >
                <FaPlus size={12} />
                <span>New Issue</span>
              </button>
            )}

            <div style={{ position: "relative" }}>
              <div 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: showNotifications ? "rgba(249, 115, 22, 0.15)" : "#ffffff",
                  border: showNotifications ? "1.5px solid var(--accent)" : "1px solid rgba(0, 0, 0, 0.06)",
                  padding: "10.5px 12px",
                  borderRadius: "10px",
                  color: showNotifications ? "var(--accent)" : "var(--text-main)",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                title="Notifications"
              >
                <FaBell size={15} />
              </div>
              {allSubmissions.filter(s => s.status === "Awaiting Review").length > 0 ? (
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
                  pointerEvents: "none"
                }}>{allSubmissions.filter(s => s.status === "Awaiting Review").length}</span>
              ) : activeWorkspace === "hub" ? (
                hubMetrics?.blockers?.length > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none"
                  }}>{hubMetrics.blockers.length}</span>
                )
              ) : (
                metrics.overdue > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none"
                  }}>{metrics.overdue}</span>
                )
              )}

              {/* Interactive Notification Center Popover */}
              {showNotifications && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: "370px",
                  maxHeight: "460px",
                  background: theme === "dark" ? "#1e293b" : "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid var(--border-glass)",
                  boxShadow: "0 12px 36px rgba(0, 0, 0, 0.28)",
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  animation: "fadeIn 0.2s ease-out"
                }}>
                  {/* Notification Popover Header */}
                  <div style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid var(--border-glass)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: theme === "dark" ? "rgba(15, 23, 42, 0.6)" : "#f8fafc"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaBell style={{ color: "var(--accent)" }} size={14} />
                      <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>Notifications</strong>
                      {allSubmissions.filter(s => s.status === "Awaiting Review").length > 0 && (
                        <span style={{
                          fontSize: "10px",
                          fontWeight: "800",
                          padding: "2px 7px",
                          borderRadius: "6px",
                          background: "rgba(239, 68, 68, 0.12)",
                          color: "#ef4444"
                        }}>
                          {allSubmissions.filter(s => s.status === "Awaiting Review").length} Pending
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: "15px",
                        padding: "2px 6px"
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Notification Items List */}
                  <div style={{ overflowY: "auto", padding: "6px 0", flex: 1 }}>
                    {allSubmissions.length > 0 ? (
                      allSubmissions.slice(0, 8).map(sub => (
                        <div
                          key={sub._id || sub.id}
                          style={{
                            padding: "12px 18px",
                            borderBottom: "1px solid var(--border-glass)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            transition: "background 0.15s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                            <span style={{ fontSize: "12.5px", fontWeight: "750", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                              <span>👤</span> {sub.studentName}
                            </span>
                            <span style={{
                              fontSize: "9px",
                              fontWeight: "800",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: sub.status === "Approved" ? "rgba(45, 212, 191, 0.12)" : sub.status === "Re-work Requested" ? "rgba(239, 68, 68, 0.12)" : "rgba(249, 115, 22, 0.12)",
                              color: sub.status === "Approved" ? "#2dd4bf" : sub.status === "Re-work Requested" ? "#ef4444" : "var(--accent)"
                            }}>
                              {sub.status}
                            </span>
                          </div>
                          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                            Submitted deliverable for <strong style={{ color: "var(--primary)" }}>{sub.projectName || "Assigned Project"}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                            <span style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>
                              Task #{sub.taskId} • {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString()}
                            </span>
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                color: "var(--primary)",
                                textDecoration: "none"
                              }}
                            >
                              Open File ↗
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "12.5px" }}>
                        <FaCheckCircle style={{ color: "#10b981", fontSize: "26px", marginBottom: "8px" }} />
                        <p style={{ margin: 0, fontWeight: "700", color: "var(--text-main)" }}>All caught up!</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: "11.5px", color: "var(--text-dim)" }}>
                          No pending deliverables awaiting verification.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Popover Footer */}
                  {allSubmissions.length > 0 && (
                    <div style={{
                      padding: "10px 18px",
                      borderTop: "1px solid var(--border-glass)",
                      textAlign: "center",
                      background: theme === "dark" ? "rgba(15, 23, 42, 0.4)" : "#f8fafc"
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNotifications(false);
                          if (activeWorkspace !== "faculty-mentor") {
                            setActiveWorkspace("faculty-mentor");
                          }
                          setActiveView("dashboard");
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--accent)",
                          fontSize: "12px",
                          fontWeight: "750",
                          cursor: "pointer"
                        }}
                      >
                        View Project Deliverables →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="btn-secondary"
              style={{
                padding: "10.5px 14px",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                background: "rgba(239, 68, 68, 0.05)",
                color: "#ef4444",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(239, 68, 68, 0.02)",
                fontWeight: "750",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                transition: "var(--transition-smooth)"
              }}
              title="Sign Out"
            >
              <FaSignOutAlt size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* SEARCH & DYNAMIC FILTER BAR */}
        {activeWorkspace !== "hub" && activeWorkspace !== "moderator" && (
          <section className="glass-panel" style={{
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            {/* Search Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
              <FaSearch color="var(--text-dim)" size={14} />
              <input
                type="text"
                placeholder="Search by Key or Summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-main)",
                  outline: "none",
                  fontSize: "14px",
                  width: "100%"
                }}
              />
              {searchQuery && (
                <FaTimes
                  color="var(--text-muted)"
                  onClick={() => setSearchQuery("")}
                  style={{ cursor: "pointer" }}
                  size={12}
                />
              )}
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              {/* Priority Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaFilter size={12} color="var(--text-muted)" />
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Priority:</span>
                <select
                  className="form-select"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  style={{ padding: "6px 28px 6px 12px", width: "110px", height: "34px", fontSize: "13px" }}
                >
                  <option value="All">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Assignee Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaFilter size={12} color="var(--text-muted)" />
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Assignee:</span>
                <select
                  className="form-select"
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  style={{ padding: "6px 28px 6px 12px", width: "140px", height: "34px", fontSize: "13px" }}
                >
                  <option value="All">All</option>
                  <option value="Unassigned">Unassigned</option>
                  {activeAssignees.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Project / Epic Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaFilter size={12} color="var(--text-muted)" />
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Project:</span>
                <select
                  className="form-select"
                  value={filterProject}
                  onChange={(e) => {
                    setFilterProject(e.target.value);
                    setActiveCustomBoardTitle("");
                    setActiveCustomBoardId(null);
                  }}
                  style={{ padding: "6px 28px 6px 12px", width: "180px", height: "34px", fontSize: "13px" }}
                >
                  <option value="All">All Projects</option>
                  {activeProjectsList.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              
              {/* Reset Filters indicator */}
              {(searchQuery || filterPriority !== "All" || filterAssignee !== "All" || filterProject !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterPriority("All");
                    setFilterAssignee("All");
                    setFilterProject("All");
                    setActiveCustomBoardId(null);
                    setActiveCustomBoardTitle("");
                    triggerToast("Filters cleared");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: "600",
                    textDecoration: "underline"
                  }}
                >
                  Reset filters
                </button>
              )}
            </div>
          </section>
        )}

        {/* LOADING SHIMMER STATE */}
        {(isLoading && !["hub", "moderator", "meetings", "playground", "b2b-sponsor", "faculty-mentor"].includes(activeWorkspace)) ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "4px solid rgba(99, 102, 241, 0.1)",
              borderTopColor: "var(--primary)",
              borderRadius: "50%",
            }} className="pulse-glow"></div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Synchronizing live data from board...</p>
          </div>
        ) : hasError ? (
          <div className="glass-panel" style={{
            padding: "50px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            borderColor: "rgba(239, 68, 68, 0.2)"
          }}>
            <FaExclamationTriangle size={48} color="#ef4444" className="pulse-glow" style={{ borderRadius: "50%" }} />
            <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Jira Backend Connection Failed</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "450px", lineHeight: "1.6" }}>
              The dashboard was unable to fetch tasks because the local Express server is not running on port 5001 (or the Jira API timed out). 
            </p>
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px 24px", borderRadius: "8px", fontFamily: "var(--mono)", fontSize: "13px", color: "var(--text-main)", border: "1px solid var(--border-glass)" }}>
              cd backend<br/>
              npm start
            </div>
            <button
              onClick={() => activeWorkspace === "hub" ? fetchHubMetrics(false) : fetchJiraTasks(false)}
              className="btn-primary"
              style={{ marginTop: "10px" }}
            >
              <FaSyncAlt size={12} />
              <span>Retry Sync</span>
            </button>
          </div>
        ) : activeWorkspace === "hub" ? (
          <HubDashboardView
            metrics={hubMetrics}
            loading={isHubLoading}
            onRefresh={() => fetchHubMetrics(false)}
            onIngestClick={() => setIsIngestOpen(true)}
            triggerToast={triggerToast}
            currentPersona={currentPersona}
          />
        ) : activeWorkspace === "moderator" ? (
          <ModeratorDashboardView
            projects={moderatorProjects}
            loading={isModeratorLoading}
            onRefresh={() => fetchModeratorProjects(false)}
            onAssignClick={(proj) => {
              setSelectedAssignProject(proj);
              setAllocationPhases(
                proj.phases && proj.phases.length > 0 
                  ? proj.phases.map(p => ({ name: p.name, description: p.description || "" }))
                  : [
                      { name: "Lab Infrastructure Setup & Hardware Procurement", description: "" },
                      { name: "Faculty Upskilling & Student Cohort Selection", description: "" },
                      { name: "Development, Industry Mentorship & Evaluation", description: "" }
                    ]
              );
              setIsAssignModalOpen(true);
            }}
            onIngestClick={() => setIsIngestOpen(true)}
            onEditClick={(proj) => {
              setEditingProject(proj);
              setEditCompany(proj.company);
              setEditTitle(proj.title);
              setEditDescription(proj.description || "");
              setEditBudget(proj.budget);
              setEditDuration(proj.duration);
              setEditDueDate(proj.proposedDueDate ? proj.proposedDueDate.split("T")[0] : "2026-08-25");
            }}
            onDeleteClick={(proj) => handleDeleteProject(proj._id || proj.id)}
            spokes={spokesList.length > 0 ? spokesList : Object.entries(dynamicSpokes).map(([id, s]) => ({ id, ...s }))}
            onRefreshSpokes={fetchSpokes}
            triggerToast={triggerToast}
            activeTab={moderatorActiveTab}
            setActiveTab={setModeratorActiveTab}
          />
        ) : sessionUser?.role === "Corporate Partner" || sessionUser?.role === "Project Mentor" || activeWorkspace === "sponsor-nvidia" || activeWorkspace === "project-mentor" ? (
          <CorporateSponsorDashboardView
            projects={moderatorProjects}
            loading={isModeratorLoading}
            onRefresh={() => fetchModeratorProjects(false)}
            onSubmitProposal={async (payload) => {
              try {
                const res = await axios.post("http://localhost:5001/moderator/projects", {
                  company: sessionUser?.displayName?.replace(" Sponsor", "")?.replace(" Mentor", "") || "Company 1",
                  ...payload
                });
                if (res.data && res.data.success) {
                  triggerToast("Corporate project proposal submitted successfully!");
                  fetchModeratorProjects(true);
                }
              } catch (err) {
                console.error(err);
                triggerToast("Failed to submit project proposal.", "error");
              }
            }}
            triggerToast={triggerToast}
            sessionUser={sessionUser}
            spokes={spokesList.length > 0 ? spokesList : Object.entries(dynamicSpokes).map(([id, spoke]) => ({ id, ...spoke }))}
            tasks={tasks}
            meetings={meetings}
          />
        ) : activeWorkspace === "project-manager" ? (
          <ProjectManagerDashboardView
            projects={moderatorProjects}
            loading={isModeratorLoading}
            onRefresh={() => fetchModeratorProjects(false)}
            triggerToast={triggerToast}
            spokes={spokesList.length > 0 ? spokesList : Object.entries(dynamicSpokes).map(([id, spoke]) => ({ id, ...spoke }))}
            onDeleteProject={(proj) => handleDeleteProject(proj._id || proj.id)}
          />
        ) : activeWorkspace === "faculty-mentor" && (activeView === "dashboard" || activeView === "teams" || activeView === "student-approvals") ? (
          <FacultyMentorDashboardView
            sessionUser={sessionUser}
            triggerToast={triggerToast}
            spokes={spokesList.length > 0 ? spokesList : Object.entries(dynamicSpokes).map(([id, spoke]) => ({ id, ...spoke }))}
            allSubmissions={allSubmissions}
            handleUpdateSubmissionStatus={handleUpdateSubmissionStatus}
            meetings={meetings.filter(m => String(m.campusId) === String(sessionUser?.spokeId || "3"))}
            handleDeleteSubmission={handleDeleteSubmission}
            fetchAllSubmissions={fetchAllSubmissions}
            setActiveView={setActiveView}
            handleRunAiVerificationSweep={handleRunAiVerificationSweep}
            activeSubView={activeView === "teams" ? "teams" : activeView === "student-approvals" ? "student-approvals" : "overview"}
            setActiveCustomBoardId={setActiveCustomBoardId}
            setActiveCustomBoardTitle={setActiveCustomBoardTitle}
            fetchJiraTasks={fetchJiraTasks}
            setFilterProject={setFilterProject}
          />
        ) : activeWorkspace === "meetings" || (activeWorkspace === "faculty-mentor" && activeView === "meetings") ? (
          <MeetingsPortalView
            meetings={meetings}
            loading={isMeetingsLoading}
            onRefresh={() => fetchMeetings(false)}
            spokes={spokesList.length > 0 ? spokesList : Object.entries(dynamicSpokes).map(([id, spoke]) => ({ id, ...spoke }))}
            triggerToast={triggerToast}
            moderatorProjects={moderatorProjects}
            sessionUser={sessionUser}
            isFacultyMentor={activeWorkspace === "faculty-mentor" || sessionUser?.role === "Faculty Mentor"}
          />
        ) : (
          <>
            {/* Proposed Project Decision Banner (Multi-tenant Coordinator Review Privilege) */}
            {sessionUser?.role !== "Student Developer" && proposedProjectsForSpoke.map((proj) => (
              <div key={proj.id} className="glass-panel pulse-glow" style={{
                background: theme === "dark"
                  ? "rgba(45, 212, 191, 0.08)"
                  : "rgba(13, 148, 136, 0.04)",
                border: "1.5px dashed var(--border-glow)",
                padding: "22px 26px",
                borderRadius: "16px",
                marginBottom: "25px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "28px" }}><FaCheckCircle style={{ color: "var(--status-done-text)" }} /></span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "850", color: "var(--text-main)" }}>
                        New Project Proposed!
                      </h4>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
                        Your institution has been nominated by the Moderator for a premium company program.
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "900",
                    background: "rgba(249, 115, 22, 0.15)",
                    border: "1px solid rgba(249, 115, 22, 0.3)",
                    color: "var(--accent)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    textTransform: "uppercase"
                  }}>
                    Awaiting Spoke Decision
                  </span>
                </div>

                <div style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-glass)",
                  padding: "16px",
                  borderRadius: "12px",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "16px",
                  alignItems: "center"
                }}>
                  <CompanyLogo company={proj.company} size={48} />
                  <div>
                    <h5 style={{ margin: 0, fontSize: "15.5px", fontWeight: "800", color: "var(--text-main)" }}>
                      {proj.title} <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "500" }}>by {proj.company}</span>
                    </h5>
                    <p style={{ margin: "6px 0 0 0", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                      {proj.description}
                    </p>
                    <div style={{ display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "12.5px", color: "var(--text-main)" }}>
                        <strong>Duration:</strong> {proj.duration}
                      </span>
                      <span style={{ fontSize: "12.5px", color: "var(--text-main)" }}>
                        <strong>Proposed Deadline:</strong> <em>{proj.proposedDueDate}</em>
                      </span>
                    </div>
                  </div>
                </div>

                {isCentralAdmin ? (
                  <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-glass)", paddingTop: "14px", marginTop: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "13.5px", fontStyle: "italic", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", padding: "10px 18px", borderRadius: "8px" }}>
                      <span>ℹ️</span>
                      <span>Accepting or declining proposals is restricted to Spoke Coordinators. (Read-Only Mode)</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", borderTop: "1px solid var(--border-glass)", paddingTop: "14px", marginTop: "4px" }}>
                    <button
                      onClick={() => handleDeclineProject(proj.id)}
                      disabled={isRespondingToProject}
                      className="btn-secondary"
                      style={{
                        padding: "8px 18px",
                        fontSize: "13px",
                        borderRadius: "8px",
                        borderColor: "rgba(239, 68, 68, 0.3)",
                        color: "#f87171",
                        cursor: "pointer"
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><FaTimes /> Decline Proposal</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      disabled={isRespondingToProject}
                      className="btn-secondary"
                      style={{
                        padding: "8px 14px",
                        fontSize: "13px",
                        borderRadius: "8px",
                        borderColor: "rgba(239, 68, 68, 0.5)",
                        color: "#ef4444",
                        background: "rgba(239, 68, 68, 0.08)",
                        cursor: "pointer"
                      }}
                      title="Delete Project Completely"
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><FaTrashAlt /> Delete</span>
                    </button>
                    <button
                      onClick={() => handleAcceptProject(proj.id)}
                      disabled={isRespondingToProject}
                      className="btn-primary"
                      style={{
                        padding: "8px 18px",
                        fontSize: "13px",
                        borderRadius: "8px",
                        background: "#ef4444",
                        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                        cursor: "pointer"
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><FaCheck /> Accept Project</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {todayMeetingsForSpoke.length > 0 && (
              <div className="glass-panel" style={{
                background: todayConflictsForSpoke.length > 0
                  ? (theme === "dark"
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(239, 68, 68, 0.04)")
                  : (theme === "dark"
                    ? "rgba(13, 148, 136, 0.1)"
                    : "rgba(13, 148, 136, 0.04)"),
                border: todayConflictsForSpoke.length > 0
                  ? "1.5px solid rgba(239, 68, 68, 0.35)"
                  : "1.5px solid var(--border-glass)",
                boxShadow: todayConflictsForSpoke.length > 0
                  ? "var(--shadow-premium), 0 0 25px rgba(239, 68, 68, 0.12)"
                  : "var(--shadow-premium), 0 0 25px rgba(13, 148, 136, 0.08)",
                padding: "20px 24px",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginBottom: "25px",
                animation: todayConflictsForSpoke.length > 0 ? "pulse-glow 3s infinite alternate" : "pulse-glow 5s infinite alternate"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}><FaCalendarAlt /></span>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "850", color: "var(--text-main)" }}>
                      Today's FIP Sprint Syncs Scheduled ({todayMeetingsForSpoke.length})
                    </h4>
                  </div>
                  {todayConflictsForSpoke.length > 0 && (
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: theme === "dark" ? "#fca5a5" : "#b91c1c",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }} className="pulse-glow">
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent)" }}><FaExclamationTriangle /> OVERLAP CONFLICT</span>
                    </span>
                  )}
                </div>

                {todayConflictsForSpoke.length > 0 && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    background: theme === "dark" ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.05)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: "8px",
                    color: theme === "dark" ? "#fca5a5" : "#b91c1c",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    lineHeight: "1.4"
                  }}>
                    <span><FaExclamationTriangle /></span>
                    <span>
                      <strong>Schedule Conflict:</strong> Multiple meetings are scheduled at the same time today. Please coordinate to resolve the conflict.
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {todayMeetingsForSpoke.map((meet) => {
                    const hasConflict = todayConflictsForSpoke.some(c => c.id === meet.id);
                    return (
                      <div key={meet.id} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                        padding: "14px 18px",
                        background: hasConflict
                          ? (theme === "dark" ? "rgba(239, 68, 68, 0.06)" : "rgba(239, 68, 68, 0.04)")
                          : (theme === "dark" ? "rgba(45, 212, 191, 0.03)" : "rgba(13, 148, 136, 0.03)"),
                        border: hasConflict
                          ? "1px solid rgba(239, 68, 68, 0.3)"
                          : "1px solid var(--border-glass)",
                        borderRadius: "12px",
                        boxShadow: hasConflict ? "0 0 10px rgba(239, 68, 68, 0.05)" : "none",
                        transition: "var(--transition-smooth)"
                      }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "280px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{
                              fontSize: "11px",
                              fontWeight: "800",
                              background: hasConflict ? "rgba(239, 68, 68, 0.12)" : "var(--primary-glow)",
                              color: hasConflict ? (theme === "dark" ? "#fca5a5" : "#b91c1c") : "var(--primary)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontFamily: "var(--mono)"
                            }}>
                              <span><FaClock style={{ marginRight: "4px", verticalAlign: "middle" }} /> {meet.time}</span>
                            </span>
                            {hasConflict && (
                              <span style={{
                                fontSize: "10px",
                                fontWeight: "800",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                color: theme === "dark" ? "#fca5a5" : "#dc2626",
                                padding: "2px 6px",
                                borderRadius: "4px"
                              }} className="pulse-glow">
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent)" }}><FaExclamationTriangle /> Time Conflict</span>
                              </span>
                            )}
                            <strong style={{ fontSize: "14.5px", color: "var(--text-main)" }}>{meet.title}</strong>
                          </div>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                            Agenda: <em>{meet.agenda}</em>
                          </p>
                        </div>
                        <a
                          href={meet.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{
                            padding: "8px 16px",
                            fontSize: "12px",
                            borderRadius: "8px",
                            background: "#ef4444",
                            color: "var(--text-primary-btn)",
                            textDecoration: "none",
                            fontWeight: "750",
                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)"
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>Join Meeting <FaPaperPlane /></span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 1. DASHBOARD VIEW */}
            {activeView === "dashboard" && (
              <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                
                {sessionUser?.role === "Student Developer" ? (
                  // ==========================================
                  // 💻 STUDENT DEVELOPER DASHBOARD VIEW
                  // ==========================================
                  <>
                    {/* Student Persona Header */}
                    <div className="glass-panel" style={{
                      padding: "20px 24px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "16px"
                    }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "850", color: "var(--text-main)" }}>
                          Welcome Back, {sessionUser?.displayName}!
                        </h2>
                        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                          Student Developer at <strong style={{ color: "var(--primary)" }}>{(dynamicSpokes[currentBoardId] || SPOKES[currentBoardId])?.name || "Our Campus Spoke"}</strong>. Track your active sprint tasks, review mentor feedback, and submit your deliverables.
                        </p>
                      </div>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        background: "var(--primary-glow)",
                        color: "var(--primary)",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        border: "1px solid rgba(99, 102, 241, 0.2)",
                        textTransform: "uppercase"
                      }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><FaBolt style={{ color: "var(--accent)" }} /> Student Developer Active Session</span>
                      </span>
                    </div>

                    {/* Student Accountable Metrics Card Row */}
                    {(() => {
                      const mySpokeTasks = tasks.filter(t => {
                        const spokeLabel = dynamicCampusLabels[currentBoardId] || CAMPUS_LABELS[currentBoardId];
                        const labels = t.fields?.labels || [];
                        return labels.includes(spokeLabel);
                      });

                      const myTeams = Array.isArray(spokeTeams) ? spokeTeams.filter(team => 
                        team && Array.isArray(team.members) && team.members.some(m => 
                          m && (
                            m.accountId === sessionUser?.accountId || 
                            (m.emailAddress && sessionUser?.email && m.emailAddress.toLowerCase().trim() === sessionUser.email.toLowerCase().trim())
                          )
                        )
                      ) : [];
                      const myTeamIds = myTeams.map(team => team && team._id ? team._id.toString() : "");

                      const ledTeams = myTeams.filter(team => 
                        team && team.teamLeader && (
                          team.teamLeader.accountId === sessionUser?.accountId ||
                          (team.teamLeader.emailAddress && sessionUser?.email && team.teamLeader.emailAddress.toLowerCase().trim() === sessionUser.email.toLowerCase().trim())
                        )
                      );
                      const isTeamLeader = ledTeams.length > 0;

                      const ledTeamsDetails = ledTeams.map(team => {
                        const linkedProj = moderatorProjects.find(p => p._id === team.projectId || p.id === team.projectId);
                        return {
                          teamName: team.name,
                          projectName: linkedProj ? linkedProj.title : "Unresolved Project",
                          githubRepo: team.githubRepo
                        };
                      });

                      const nonLedTeams = myTeams.filter(team => 
                        team && team.teamLeader && !(
                          team.teamLeader.accountId === sessionUser?.accountId ||
                          (team.teamLeader.emailAddress && sessionUser?.email && team.teamLeader.emailAddress.toLowerCase().trim() === sessionUser.email.toLowerCase().trim())
                        )
                      );
                      const isTeamMember = nonLedTeams.length > 0;

                      const nonLedTeamsDetails = nonLedTeams.map(team => {
                        const linkedProj = moderatorProjects.find(p => p._id === team.projectId || p.id === team.projectId);
                        return {
                          teamName: team.name,
                          projectName: linkedProj ? linkedProj.title : "Unresolved Project",
                          githubRepo: team.githubRepo,
                          leaderName: team.teamLeader.displayName || "Unknown Leader",
                          leaderEmail: team.teamLeader.emailAddress || ""
                        };
                      });

                      const myAssignedTasks = mySpokeTasks.filter(t => {
                        const assigneeEmail = t.fields?.assignee?.email || t.fields?.assignee?.emailAddress || "";
                        const assigneeAccountId = t.fields?.assignee?.accountId ? t.fields.assignee.accountId.toString() : "";
                        const currentUserEmail = sessionUser?.email || "";
                        const isDirectlyAssigned = assigneeEmail.toLowerCase().trim() === currentUserEmail.toLowerCase().trim();
                        const isTeamAssigned = myTeamIds.includes(assigneeAccountId);
                        return isDirectlyAssigned || isTeamAssigned;
                      });

                      const studentActiveTasks = myAssignedTasks.filter(t => (t.fields?.status?.name || t.fields?.status || "") !== "Done");
                      const studentDoneTasks = myAssignedTasks.filter(t => (t.fields?.status?.name || t.fields?.status || "") === "Done");
                      const studentBlockedTasks = myAssignedTasks.filter(t => t.fields?.flagged === true);

                      const mySubmissionsList = allSubmissions.filter(sub => {
                        return sub.studentName && (
                          sub.studentName.toLowerCase().includes(sessionUser?.displayName?.toLowerCase()) || 
                          sub.studentName.toLowerCase().includes(sessionUser?.email?.toLowerCase())
                        );
                      });

                      const studentApprovedCount = mySubmissionsList.filter(sub => sub.status === "Approved").length;

                      return (
                        <>
                          {isTeamLeader && (
                            <div className="glass-panel pulse-glow" style={{
                              padding: "16px 20px",
                              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(249, 115, 22, 0.03))",
                              border: "1px solid rgba(139, 92, 246, 0.2)",
                              borderRadius: "16px",
                              marginBottom: "20px",
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              width: "100%"
                            }}>
                              <div style={{
                                background: "rgba(139, 92, 246, 0.15)",
                                color: "#8b5cf6",
                                padding: "10px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                <FaUsers size={20} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: "850", color: "var(--text-main)" }}>
                                  👑 Designated Sprints Team Leader
                                </h4>
                                {ledTeamsDetails.map((details, idx) => (
                                  <p key={idx} style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                                    You are leading team <strong>"{details.teamName}"</strong> working on project <strong>"{details.projectName}"</strong>.
                                    {details.githubRepo && (
                                      <span style={{ display: "block", marginTop: "4px" }}>
                                        Collaboration GitHub Space: <a href={details.githubRepo} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: "700" }}>{details.githubRepo}</a>
                                      </span>
                                    )}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {isTeamMember && !isTeamLeader && (
                            <div className="glass-panel" style={{
                              padding: "16px 20px",
                              background: "rgba(59, 130, 246, 0.04)",
                              border: "1px solid rgba(59, 130, 246, 0.15)",
                              borderRadius: "16px",
                              marginBottom: "20px",
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              width: "100%"
                            }}>
                              <div style={{
                                background: "rgba(59, 130, 246, 0.1)",
                                color: "#3b82f6",
                                padding: "10px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                <FaUsers size={20} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: "850", color: "var(--text-main)" }}>
                                  🤝 Team Collaboration
                                </h4>
                                {nonLedTeamsDetails.map((details, idx) => (
                                  <p key={idx} style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                                    You are a member of <strong>"{details.teamName}"</strong> working on <strong>"{details.projectName}"</strong>.
                                    <span style={{ display: "block", marginTop: "4px" }}>
                                      Your Team Leader is <strong style={{ color: "var(--primary)" }}>{details.leaderName}</strong> 
                                      {details.leaderEmail && <span style={{ color: "var(--text-dim)", fontSize: "11px", marginLeft: "4px" }}>({details.leaderEmail})</span>}
                                    </span>
                                    {details.githubRepo && (
                                      <span style={{ display: "block", marginTop: "4px" }}>
                                        Collaboration GitHub Space: <a href={details.githubRepo} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: "700" }}>{details.githubRepo}</a>
                                      </span>
                                    )}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "20px",
                            width: "100%"
                          }}>
                            <DashboardCard
                              title="My Active Tasks"
                              value={studentActiveTasks.length}
                              subtitle="Assigned tasks in build"
                              glow={studentActiveTasks.length > 0}
                            />
                            <DashboardCard
                              title="My Flagged Blockers"
                              value={studentBlockedTasks.length}
                              subtitle="Tasks requiring support"
                              themeColor="var(--status-backlog-text)"
                              pulse={studentBlockedTasks.length > 0}
                              alert={studentBlockedTasks.length > 0}
                            />
                            <DashboardCard
                              title="Completed Deliverables"
                              value={studentDoneTasks.length}
                              subtitle="Sprint tasks marked Done"
                              themeColor="var(--status-done-text)"
                            />
                            <DashboardCard
                              title="Verified by Faculty"
                              value={studentApprovedCount}
                              subtitle="Approved deliverables artifacts"
                              themeColor="#a855f7"
                              glow={studentApprovedCount > 0}
                            />
                          </div>
                        </>
                      );
                    })()}

                    {/* Student Dashboard 2-Column Split */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr",
                      gap: "30px",
                      alignItems: "flex-start"
                    }}>
                      
                      {/* Left: Active Tasks & Submissions Feedback */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                        
                        {/* 1. Active Tasks Assigned to Me */}
                        {(() => {
                          const mySpokeTasks = tasks.filter(t => {
                            const spokeLabel = dynamicCampusLabels[currentBoardId] || CAMPUS_LABELS[currentBoardId];
                            const labels = t.fields?.labels || [];
                            return labels.includes(spokeLabel);
                          });

                          const myTeams = Array.isArray(spokeTeams) ? spokeTeams.filter(team => 
                            team && Array.isArray(team.members) && team.members.some(m => 
                              m && (
                                m.accountId === sessionUser?.accountId || 
                                (m.emailAddress && sessionUser?.email && m.emailAddress.toLowerCase().trim() === sessionUser.email.toLowerCase().trim())
                              )
                            )
                          ) : [];
                          const myTeamIds = myTeams.map(team => team && team._id ? team._id.toString() : "");

                          const myAssignedTasks = mySpokeTasks.filter(t => {
                            const assigneeEmail = t.fields?.assignee?.email || t.fields?.assignee?.emailAddress || "";
                            const assigneeAccountId = t.fields?.assignee?.accountId ? t.fields.assignee.accountId.toString() : "";
                            const currentUserEmail = sessionUser?.email || "";
                            const isDirectlyAssigned = assigneeEmail.toLowerCase().trim() === currentUserEmail.toLowerCase().trim();
                            const isTeamAssigned = myTeamIds.includes(assigneeAccountId);
                            return isDirectlyAssigned || isTeamAssigned;
                          });

                          return (
                            <div className="glass-panel" style={{ padding: "24px" }}>
                              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "16px", color: "var(--text-main)" }}>
                                My Assigned Sprint Tasks ({myAssignedTasks.length})
                              </h3>
                              {myAssignedTasks.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                  {myAssignedTasks.map(t => {
                                    const tStatus = t.fields?.status?.name || t.fields?.status || "To Do";
                                    const isTDone = tStatus === "Done";
                                    const isTeamTask = t.fields?.assignee?.isTeam || 
                                      t.fields?.assignee?.displayName?.includes("[TEAM]") || 
                                      (t.fields?.assignee?.accountId && myTeamIds.includes(t.fields.assignee.accountId.toString()));
                                    return (
                                      <div key={t.id} style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "16px 20px",
                                        background: "rgba(255, 255, 255, 0.015)",
                                        border: "1px solid var(--border-glass)",
                                        borderRadius: "12px"
                                      }}>
                                        <div style={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                                          <span style={{
                                            fontFamily: "var(--mono)",
                                            fontSize: "12px",
                                            color: "var(--primary)",
                                            background: "rgba(99, 102, 241, 0.1)",
                                            padding: "3px 6px",
                                            borderRadius: "4px",
                                            fontWeight: "750"
                                          }}>{t.key}</span>
                                          <span style={{
                                            fontWeight: "600",
                                            fontSize: "13.5px",
                                            color: isTDone ? "var(--text-dim)" : "var(--text-main)",
                                            textDecoration: isTDone ? "line-through" : "none",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                          }}>{t.fields.summary}</span>
                                          {isTeamTask && (
                                            <span style={{
                                              fontSize: "10px",
                                              fontWeight: "800",
                                              background: "rgba(59, 130, 246, 0.12)",
                                              color: "#3b82f6",
                                              border: "1px solid rgba(59, 130, 246, 0.2)",
                                              padding: "2px 6px",
                                              borderRadius: "6px",
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: "6px"
                                            }}>
                                              <FaUsers size={12} />
                                              <span>Team Task</span>
                                            </span>
                                          )}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "16px", shrink: 0 }}>
                                          <Badge status={tStatus} />
                                          {!isTDone ? (
                                            <button 
                                              onClick={() => {
                                                setSelectedTask(t);
                                                setModalTab("deliverables");
                                              }}
                                              style={{
                                                padding: "6px 12px",
                                                background: "#ef4444",
                                                border: "none",
                                                borderRadius: "6px",
                                                color: "white",
                                                fontSize: "11px",
                                                fontWeight: "800",
                                                cursor: "pointer",
                                                boxShadow: "0 4px 10px rgba(239, 68, 68, 0.2)"
                                              }}
                                            >
                                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>Submit Work <FaPaperPlane /></span>
                                            </button>
                                          ) : (
                                            <span style={{ fontSize: "11px", color: "var(--status-done-text)", fontWeight: "750" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><FaCheckCircle style={{ color: "var(--status-done-text)" }} /> Submitted</span></span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <EmptyStateMessage text="No sprint tasks currently assigned to your account." showIcon={true} />
                              )}
                            </div>
                          );
                        })()}

                        {/* 2. My Submissions & Mentor Evaluation Timeline */}
                        {(() => {
                          const mySubmissionsList = allSubmissions.filter(sub => {
                            return sub.studentName && (
                              sub.studentName.toLowerCase().includes(sessionUser?.displayName?.toLowerCase()) || 
                              sub.studentName.toLowerCase().includes(sessionUser?.email?.toLowerCase())
                            );
                          });

                          return (
                            <div className="glass-panel" style={{ padding: "24px" }}>
                              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "16px", color: "var(--text-main)" }}>
                                My Submissions & Mentor Evaluations ({mySubmissionsList.length})
                              </h3>
                              {mySubmissionsList.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                  {mySubmissionsList.map(sub => {
                                    const badgeBg = sub.status === "Approved" ? "rgba(45, 212, 191, 0.08)" : sub.status === "Re-work Requested" ? "rgba(239, 68, 68, 0.08)" : "rgba(251, 146, 60, 0.08)";
                                    const badgeColor = sub.status === "Approved" ? "#2dd4bf" : sub.status === "Re-work Requested" ? "#ef4444" : "var(--accent)";
                                    const badgeBorder = sub.status === "Approved" ? "1px solid rgba(45, 212, 191, 0.2)" : sub.status === "Re-work Requested" ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(251, 146, 60, 0.2)";

                                    return (
                                      <div key={sub._id} style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px",
                                        padding: "16px",
                                        background: "rgba(255, 255, 255, 0.01)",
                                        border: "1px solid var(--border-glass)",
                                        borderRadius: "12px"
                                      }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                            <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-main)" }}>{sub.fileName}</span>
                                            <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                                              Task Ref: <strong style={{ color: "var(--primary)" }}>{sub.taskId}</strong> • Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <span style={{
                                            fontSize: "9.5px",
                                            fontWeight: "900",
                                            background: badgeBg,
                                            color: badgeColor,
                                            border: badgeBorder,
                                            padding: "2px 8px",
                                            borderRadius: "4px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                          }}>{sub.status}</span>
                                        </div>

                                        <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "12px", marginTop: "4px" }}>
                                          <a 
                                            href={sub.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            style={{
                                              color: "var(--primary)",
                                              fontWeight: "750",
                                              textDecoration: "none"
                                            }}
                                          >
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><FaLink /> Open Deliverable Link</span>
                                          </a>
                                          {sub.comments && (
                                            <span style={{ color: "var(--text-dim)" }}>
                                              • Comments: <em style={{ color: "var(--text-muted)" }}>"{sub.comments}"</em>
                                            </span>
                                          )}
                                        </div>

                                        {sub.grade && (
                                          <div style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontSize: "12px",
                                            marginTop: "4px",
                                            marginBottom: "4px"
                                          }}>
                                            <span style={{ color: "var(--text-muted)" }}>Awarded Grade:</span>
                                            <span style={{
                                              fontSize: "11px",
                                              fontWeight: "900",
                                              background: "rgba(249, 115, 22, 0.08)",
                                              color: "var(--accent)",
                                              border: "1px solid rgba(249, 115, 22, 0.2)",
                                              padding: "2px 8px",
                                              borderRadius: "4px"
                                            }}>{sub.grade}</span>
                                          </div>
                                        )}

                                        {sub.feedback && (
                                          <div style={{
                                            marginTop: "8px",
                                            padding: "10px 14px",
                                            background: sub.status === "Approved" ? "rgba(45, 212, 191, 0.03)" : "rgba(239, 68, 68, 0.03)",
                                            borderLeft: `3px solid ${badgeColor}`,
                                            borderRadius: "0 8px 8px 0",
                                            fontSize: "12px"
                                          }}>
                                            <strong style={{ color: "var(--text-main)" }}>Faculty Feedback: </strong>
                                            <span style={{ color: "var(--text-muted)" }}>{sub.feedback}</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <EmptyStateMessage text="You haven't submitted any deliverables for review yet." showIcon={true} />
                              )}
                            </div>
                          );
                        })()}

                      </div>

                      {/* Right: Collaborative Teams & Projects */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>

                        {/* My Collaborative Teams */}
                        <div className="glass-panel" style={{ padding: "20px 24px", marginBottom: "20px" }}>
                          <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            MY TEAM
                          </h3>
                          {(() => {
                            const myTeamsList = Array.isArray(spokeTeams) ? spokeTeams.filter(team => 
                              team && Array.isArray(team.members) && team.members.some(m => 
                                m && (
                                  m.accountId === sessionUser?.accountId || 
                                  (m.emailAddress && sessionUser?.email && m.emailAddress.toLowerCase().trim() === sessionUser.email.toLowerCase().trim())
                                )
                              )
                            ) : [];

                            if (myTeamsList.length > 0) {
                              return (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                  {myTeamsList.map((team) => {
                                    const linkedProj = moderatorProjects.find(p => String(p._id) === String(team.projectId) || String(p.id) === String(team.projectId));
                                    let targetBoardId = null;
                                    if (linkedProj && linkedProj.allocations) {
                                      const alloc = linkedProj.allocations.find(a => String(a.targetCampusId) === String(currentBoardId));
                                      if (alloc && alloc.customBoardId) targetBoardId = alloc.customBoardId;
                                    }

                                    return (
                                    <div key={team._id} style={{
                                      padding: "14px",
                                      background: "rgba(99, 102, 241, 0.02)",
                                      border: "1px solid var(--border-glass)",
                                      borderRadius: "10px",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "10px"
                                    }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>{team.name}</strong>
                                        {targetBoardId && (
                                          <button
                                              onClick={() => {
                                                  setActiveCustomBoardId(targetBoardId);
                                                  setActiveCustomBoardTitle(linkedProj ? linkedProj.title : team.name);
                                                  fetchJiraTasks(false, targetBoardId);
                                                  setFilterProject("All");
                                                  setActiveView("kanban");
                                                  window.scrollTo(0,0);
                                              }}
                                              style={{ fontSize: "10px", padding: "4px 10px", borderRadius: "12px", background: "var(--primary)", border: "none", color: "white", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: "700" }}
                                          >
                                              <FaChartPie size={10} /> Kanban Board
                                          </button>
                                        )}
                                      </div>
                                      
                                      {linkedProj && (
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                                          Project: <strong style={{ color: "var(--text-main)" }}>{linkedProj.title}</strong>
                                        </div>
                                      )}

                                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

                                        {team.teamLeader && (
                                          <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            background: "rgba(16, 185, 129, 0.05)",
                                            border: "1px solid rgba(16, 185, 129, 0.15)",
                                            borderRadius: "6px",
                                            padding: "4px 8px"
                                          }}>
                                            <img src={team.teamLeader.avatarUrl} alt={team.teamLeader.displayName} style={{ width: "18px", height: "18px", borderRadius: "50%" }} />
                                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                              Leader: <strong style={{ color: "var(--text-main)" }}>{team.teamLeader.displayName}</strong>
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div>
                                        <div style={{ fontSize: "10px", color: "var(--text-dim)", fontWeight: "700", textTransform: "uppercase", marginBottom: "6px" }}>Team Members</div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                          {team.members.map((m) => (
                                            <div key={m.accountId} style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "4px",
                                              background: "rgba(255, 255, 255, 0.03)",
                                              border: "1px solid var(--border-glass)",
                                              borderRadius: "12px",
                                              padding: "2px 8px"
                                            }}>
                                              <img src={m.avatarUrl} alt={m.displayName} style={{ width: "14px", height: "14px", borderRadius: "50%" }} />
                                              <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>
                                                {m.displayName}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                  })}
                                </div>
                              );
                            } else {
                              return (
                                <div style={{
                                  fontSize: "12px",
                                  color: "var(--text-dim)",
                                  fontStyle: "italic",
                                  textAlign: "center",
                                  padding: "16px 0",
                                  border: "1px dashed var(--border-glass)",
                                  borderRadius: "8px",
                                  background: "rgba(255,255,255,0.002)"
                                }}>
                                  Not assigned to any collaborative team yet. Contact your coordinator to join a team!
                                </div>
                              );
                            }
                          })()}
                        </div>

                        {/* Active Spoke Project */}
                        {acceptedProjectsForSpoke.length > 0 && (
                          <div className="glass-panel" style={{ padding: "20px 24px" }}>
                            <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              MY PROJECTS
                            </h3>
                            {acceptedProjectsForSpoke.slice(0, 1).map((proj) => {
                              const epicKey = proj.allocations ? proj.allocations.find(a => a.targetCampusId === currentBoardId)?.assignedKey : proj.assignedKey;
                              const allocation = proj.allocations ? proj.allocations.find(a => a.targetCampusId === currentBoardId) : null;
                              const mentorName = allocation?.facultyMentor?.displayName || proj.facultyMentor?.displayName;
                              return (
                                <div key={proj.id} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <CompanyLogo company={proj.company} size={36} />
                                    <div>
                                      <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {proj.title}
                                        {mentorName && <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(168,85,247,0.1)", color: "#a855f7", fontWeight: "600" }}>Mentor: {mentorName}</span>}
                                      </h4>
                                      <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Sponsor: <strong>{proj.company}</strong></span>
                                    </div>
                                  </div>
                                  <div style={{
                                    padding: "10px 14px",
                                    background: "rgba(255, 255, 255, 0.01)",
                                    border: "1px solid var(--border-glass)",
                                    borderRadius: "8px",
                                    fontSize: "11.5px",
                                    display: "flex",
                                    justifyContent: "space-between"
                                  }}>
                                    <span style={{ color: "var(--text-dim)" }}>Jira key: <strong style={{ color: "var(--text-main)", fontFamily: "var(--mono)" }}>{epicKey || "PNLP-3"}</strong></span>
                                    <span style={{ color: "var(--text-dim)" }}>Deadline: <strong style={{ color: "var(--text-main)" }}>{proj.proposedDueDate}</strong></span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>

                    </div>
                  </>
                ) : (
                  // ==========================================
                  // 🎓 FACULTY MENTOR (COORDINATOR) DASHBOARD
                  // ==========================================
                  <>
                    {/* Faculty Dashboard Tab Navigation */}
                    <div style={{
                      display: "flex",
                      gap: "10px",
                      borderBottom: "1px solid var(--border-glass)",
                      paddingBottom: "12px",
                      marginBottom: "25px"
                    }}>
                      <button
                        type="button"
                        onClick={() => setActiveCoordinatorTab("analytics")}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "8px",
                          border: "1px solid transparent",
                          background: activeCoordinatorTab === "analytics" ? "rgba(99, 102, 241, 0.12)" : "transparent",
                          color: activeCoordinatorTab === "analytics" ? "var(--primary)" : "var(--text-muted)",
                          borderColor: activeCoordinatorTab === "analytics" ? "rgba(99, 102, 241, 0.25)" : "transparent",
                          fontWeight: "750",
                          fontSize: "12.5px",
                          cursor: "pointer",
                          transition: "var(--transition-smooth)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><FaChartPie /></span> Overview & Student Submissions
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCoordinatorTab("projects")}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "8px",
                          border: "1px solid transparent",
                          background: activeCoordinatorTab === "projects" ? "rgba(99, 102, 241, 0.12)" : "transparent",
                          color: activeCoordinatorTab === "projects" ? "var(--primary)" : "var(--text-muted)",
                          borderColor: activeCoordinatorTab === "projects" ? "rgba(99, 102, 241, 0.25)" : "transparent",
                          fontWeight: "750",
                          fontSize: "12.5px",
                          cursor: "pointer",
                          transition: "var(--transition-smooth)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><FaBriefcase /></span> Assigned Company Projects
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveCoordinatorTab("spoke-teams")}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "8px",
                          border: "1px solid transparent",
                          background: activeCoordinatorTab === "spoke-teams" ? "rgba(99, 102, 241, 0.12)" : "transparent",
                          color: activeCoordinatorTab === "spoke-teams" ? "var(--primary)" : "var(--text-muted)",
                          borderColor: activeCoordinatorTab === "spoke-teams" ? "rgba(99, 102, 241, 0.25)" : "transparent",
                          fontWeight: "750",
                          fontSize: "12.5px",
                          cursor: "pointer",
                          transition: "var(--transition-smooth)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><FaUsers /></span> Student Teams & Sprint Board
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveCoordinatorTab("faculty-approvals");
                          fetchPendingFaculty(currentBoardId);
                        }}
                        style={{
                          padding: "8px 18px",
                          borderRadius: "8px",
                          border: "1px solid transparent",
                          background: activeCoordinatorTab === "faculty-approvals" ? "rgba(99, 102, 241, 0.12)" : "transparent",
                          color: activeCoordinatorTab === "faculty-approvals" ? "var(--primary)" : "var(--text-muted)",
                          borderColor: activeCoordinatorTab === "faculty-approvals" ? "rgba(99, 102, 241, 0.25)" : "transparent",
                          fontWeight: "750",
                          fontSize: "12.5px",
                          cursor: "pointer",
                          transition: "var(--transition-smooth)",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><FaUserCheck /></span> Faculty Verifications
                        {pendingFacultyList.length > 0 && (
                          <span style={{
                            background: "#ef4444",
                            color: "#ffffff",
                            fontSize: "10.5px",
                            fontWeight: "800",
                            padding: "1px 7px",
                            borderRadius: "10px"
                          }}>
                            {pendingFacultyList.length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* TAB 1: ANALYTICS & DELIVERABLES */}
                    {activeCoordinatorTab === "analytics" && (
                      <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                        {/* Faculty Stats Cards Row */}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "20px"
                        }}>
                          <DashboardCard
                            title="Total Tasks"
                            value={metrics.total}
                            subtitle="Matching active Spoke sprint"
                            glow={true}
                          />
                          <DashboardCard
                            title="Overdue Tasks"
                            value={metrics.overdue}
                            subtitle="Late sprint deadline tasks"
                            themeColor="var(--status-backlog-text)"
                            pulse={metrics.overdue > 0}
                            alert={metrics.overdue > 0}
                          />
                          <DashboardCard
                            title="Need Review"
                            value={allSubmissions.filter(sub => {
                              const userPersona = currentPersona.replace("spoke-", "");
                              const subSpoke = sub.studentName && sub.studentName.toLowerCase();
                              const targetSpoke = userPersona === "kle" ? "kle" : userPersona === "coep" ? "coep" : userPersona === "mmcoep" ? "mmcoep" : "rit";
                              const isMatch = subSpoke && (subSpoke.includes(targetSpoke) || subSpoke.includes("student"));
                              return isMatch && sub.status === "Awaiting Review";
                            }).length}
                            subtitle="Awaiting coordinator review"
                            themeColor="var(--status-progress-text)"
                            pulse={allSubmissions.filter(sub => {
                              const userPersona = currentPersona.replace("spoke-", "");
                              const subSpoke = sub.studentName && sub.studentName.toLowerCase();
                              const targetSpoke = userPersona === "kle" ? "kle" : userPersona === "coep" ? "coep" : userPersona === "mmcoep" ? "mmcoep" : "rit";
                              const isMatch = subSpoke && (subSpoke.includes(targetSpoke) || subSpoke.includes("student"));
                              return isMatch && sub.status === "Awaiting Review";
                            }).length > 0}
                          />
                          <DashboardCard
                            title="Completed Tasks"
                            value={metrics.done}
                            subtitle="Tasks marked Done"
                            themeColor="#a855f7"
                            glow={true}
                          />
                        </div>

                        {/* Student Deliverables Verification Queue */}
                        {(() => {
                          const userPersona = currentPersona.replace("spoke-", "");
                          const targetSpoke = userPersona === "kle" ? "kle" : userPersona === "coep" ? "coep" : userPersona === "mmcoep" ? "mmcoep" : "rit";
                          
                          const spokeSubmissions = allSubmissions.filter(sub => {
                            const subSpoke = sub.studentName && sub.studentName.toLowerCase();
                            const isMatch = subSpoke && subSpoke.includes(targetSpoke);
                            return isMatch || currentPersona === "moderator" || currentPersona === "executive";
                          });

                          return (
                            <div className="glass-panel" style={{
                              background: "var(--bg-card)",
                              border: "1px solid var(--border-glass)",
                              padding: "24px",
                              borderRadius: "16px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "16px"
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                                    <span style={{ fontSize: "20px", display: "inline-flex", alignItems: "center" }}><FaExclamationTriangle style={{ color: "var(--accent)" }} /></span>
                                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "850", color: "var(--text-main)" }}>
                                      Student Tasks Review
                                    </h3>
                                  </div>
                                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                    Review and approve tasks submitted by students
                                  </span>
                                </div>
                                <button
                                  onClick={handleRunAiVerificationSweep}
                                  style={{
                                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    color: "#fff",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    fontWeight: "750",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                                  }}
                                >
                                  <span>🤖 Run AI Verification Sweep</span>
                                </button>
                              </div>

                              {spokeSubmissions.length > 0 ? (
                                <div style={{ overflowX: "auto" }}>
                                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", color: "var(--text-main)", textAlign: "left" }}>
                                    <thead>
                                      <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-dim)" }}>
                                        <th style={{ padding: "12px 8px", fontWeight: "750" }}>Developer</th>
                                        <th style={{ padding: "12px 8px", fontWeight: "750" }}>Sprint Task</th>
                                        <th style={{ padding: "12px 8px", fontWeight: "750" }}>Artifact Access</th>
                                        <th style={{ padding: "12px 8px", fontWeight: "750" }}>Review Status</th>
                                        <th style={{ padding: "12px 8px", fontWeight: "750", textAlign: "right" }}>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {spokeSubmissions.map((sub) => {
                                        const badgeBg = sub.status === "Approved" ? "rgba(45, 212, 191, 0.08)" : sub.status === "Re-work Requested" ? "rgba(239, 68, 68, 0.08)" : "rgba(251, 146, 60, 0.08)";
                                        const badgeColor = sub.status === "Approved" ? "#2dd4bf" : sub.status === "Re-work Requested" ? "#ef4444" : "var(--accent)";
                                        const badgeBorder = sub.status === "Approved" ? "1px solid rgba(45, 212, 191, 0.2)" : sub.status === "Re-work Requested" ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(251, 146, 60, 0.2)";

                                        return (
                                          <tr key={sub._id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                                            <td style={{ padding: "14px 8px", fontWeight: "600" }}>{sub.studentName}</td>
                                            <td style={{ padding: "14px 8px" }}>
                                              <div style={{ display: "flex", flexDirection: "column" }}>
                                                <strong style={{ color: "var(--primary)", fontFamily: "var(--mono)" }}>{sub.taskId}</strong>
                                                {sub.comments && <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>"{sub.comments}"</span>}
                                              </div>
                                            </td>
                                            <td style={{ padding: "14px 8px" }}>
                                              <a 
                                                href={sub.fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                style={{
                                                  color: "var(--secondary)",
                                                  fontWeight: "750",
                                                  textDecoration: "none"
                                                }}
                                              >
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><FaLink /> {sub.fileName}</span>
                                              </a>
                                            </td>
                                            <td style={{ padding: "14px 8px" }}>
                                              <span style={{
                                                fontSize: "9px",
                                                fontWeight: "900",
                                                background: badgeBg,
                                                color: badgeColor,
                                                border: badgeBorder,
                                                padding: "2px 6px",
                                                borderRadius: "3px",
                                                textTransform: "uppercase"
                                              }}>{sub.status}</span>
                                            </td>
                                            <td style={{ padding: "14px 8px", textAlign: "right" }}>
                                              {sub.status === "Awaiting Review" ? (
                                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                  <button 
                                                    onClick={() => handleUpdateSubmissionStatus(sub._id, "Approved", "Meets all FIP criteria. Excellent work!")}
                                                    style={{
                                                      padding: "6px 12px",
                                                      background: "rgba(45, 212, 191, 0.15)",
                                                      border: "1px solid rgba(45, 212, 191, 0.3)",
                                                      borderRadius: "6px",
                                                      color: "#2dd4bf",
                                                      fontSize: "11px",
                                                      fontWeight: "800",
                                                      cursor: "pointer"
                                                    }}
                                                  >
                                                    Approve
                                                  </button>
                                                  <button 
                                                    onClick={() => {
                                                      const feedback = prompt("Please enter evaluation comments / requested changes for the student developer:", "Re-work required: please refine your layout controller.");
                                                      if (feedback !== null) {
                                                        handleUpdateSubmissionStatus(sub._id, "Re-work Requested", feedback || "Please revise task artifacts.");
                                                      }
                                                    }}
                                                    style={{
                                                      padding: "6px 12px",
                                                      background: "rgba(239, 68, 68, 0.15)",
                                                      border: "1px solid rgba(239, 68, 68, 0.3)",
                                                      borderRadius: "6px",
                                                      color: "#ef4444",
                                                      fontSize: "11px",
                                                      fontWeight: "800",
                                                      cursor: "pointer"
                                                    }}
                                                  >
                                                    Flag Re-work
                                                  </button>
                                                </div>
                                              ) : sub.status === "Re-work Requested" ? (
                                                <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "flex-end" }}>
                                                  <span style={{
                                                    fontSize: "11px", 
                                                    color: "#ef4444", 
                                                    fontWeight: "750",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px"
                                                  }}>
                                                    <FaExclamationTriangle size={12} />
                                                    <span>Revision Required</span>
                                                  </span>
                                                  <button 
                                                    onClick={() => handleUpdateSubmissionStatus(sub._id, "Approved", "Re-evaluated and approved! Meets all criteria.")}
                                                    style={{
                                                      padding: "6px 12px",
                                                      background: "rgba(45, 212, 191, 0.15)",
                                                      border: "1px solid rgba(45, 212, 191, 0.3)",
                                                      borderRadius: "6px",
                                                      color: "#2dd4bf",
                                                      fontSize: "11px",
                                                      fontWeight: "800",
                                                      cursor: "pointer",
                                                      transition: "all 0.2s ease"
                                                    }}
                                                  >
                                                    Re-evaluate & Approve
                                                  </button>
                                                </div>
                                              ) : (
                                                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                                                  <span style={{
                                                    fontSize: "11px", 
                                                    color: "#2dd4bf", 
                                                    fontWeight: "600",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px"
                                                  }}>
                                                    <FaCheck size={11} />
                                                    <span>Verified Completed</span>
                                                  </span>
                                                  <button
                                                    onClick={() => handleDeleteSubmission(sub._id)}
                                                    style={{
                                                      padding: "4px 6px",
                                                      background: "rgba(239, 68, 68, 0.08)",
                                                      border: "1px solid rgba(239, 68, 68, 0.2)",
                                                      borderRadius: "4px",
                                                      color: "#ef4444",
                                                      cursor: "pointer",
                                                      display: "inline-flex",
                                                      alignItems: "center",
                                                      verticalAlign: "middle",
                                                      transition: "var(--transition-smooth)",
                                                      marginLeft: "8px"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                                                    }}
                                                    title="Delete old submission history"
                                                  >
                                                    <FaTrashAlt size={10} />
                                                  </button>
                                                </div>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div style={{
                                  textAlign: "center",
                                  padding: "40px 20px",
                                  border: "1px dashed var(--border-glass)",
                                  borderRadius: "12px",
                                  color: "var(--text-dim)",
                                  fontSize: "13px"
                                }}>
                                  No deliverables have been submitted by Spoke student developers for review yet.
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Analytical Charts Grid */}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                          gap: "24px"
                        }}>
                          {/* Status distribution chart */}
                          <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", height: "350px", border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "16px" }}>Status Distribution</h3>
                            <div style={{ flex: 1, minHeight: 0 }}>
                              {statusPieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={statusPieData}
                                      cx="50%"
                                      cy="45%"
                                      innerRadius={60}
                                      outerRadius={85}
                                      paddingAngle={4}
                                      dataKey="value"
                                    >
                                      {statusPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} />
                                  </PieChart>
                                </ResponsiveContainer>
                              ) : (
                                <EmptyStateMessage text="No status data available matching filters." />
                              )}
                            </div>
                          </div>

                          {/* Priority chart */}
                          <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", height: "350px", border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "16px" }}>Priority Breakdown</h3>
                            <div style={{ flex: 1, minHeight: 0 }}>
                              {metrics.total > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={priorityBarData} margin={{ bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.02)" }} />
                                    <Bar dataKey="count" name="Tasks Count" radius={[6, 6, 0, 0]}>
                                      {priorityBarData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              ) : (
                                <EmptyStateMessage text="No priority metrics available." />
                              )}
                            </div>
                          </div>

                          {/* Assignee chart */}
                          <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", height: "350px", gridColumn: "span 1", border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "16px" }}>Team Workload Distribution</h3>
                            <div style={{ flex: 1, minHeight: 0 }}>
                              {assigneeWorkloadData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={assigneeWorkloadData} layout="vertical" margin={{ left: 20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis type="number" stroke="var(--text-muted)" fontSize={11} allowDecimals={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={100} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.02)" }} />
                                    <Bar dataKey="tasks" name="Active Tasks" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              ) : (
                                <EmptyStateMessage text="No active work items assigned." />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Recent Task List Component */}
                        <div className="glass-panel" style={{ padding: "24px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Scope Overview ({filteredTasks.length})</h3>
                            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Click any row to manage task details</span>
                          </div>

                          {filteredTasks.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {filteredTasks.map(t => {
                                const deadline = getDeadlineInfo(t.fields.dueDate, t.fields.status?.name);
                                return (
                                  <div
                                    key={t.id}
                                    onClick={() => setSelectedTask(t)}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      padding: "16px 20px",
                                      background: "rgba(255, 255, 255, 0.02)",
                                      border: "1px solid var(--border-glass)",
                                      borderRadius: "12px",
                                      cursor: "pointer",
                                      transition: "var(--transition-smooth)"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                                      e.currentTarget.style.borderColor = "var(--border-glow)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                                      e.currentTarget.style.borderColor = "var(--border-glass)";
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
                                      <span style={{
                                        fontFamily: "var(--mono)",
                                        fontSize: "13px",
                                        color: "var(--primary)",
                                        fontWeight: "600",
                                        background: "rgba(99, 102, 241, 0.1)",
                                        padding: "4px 8px",
                                        borderRadius: "6px"
                                      }}>
                                        {t.key}
                                      </span>
                                      <span style={{
                                        fontWeight: "600",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        color: "var(--text-main)"
                                      }}>
                                        {t.fields.summary}
                                      </span>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                      {/* Deadline Badge */}
                                      {deadline && (
                                        <span className={deadline.type === "overdue" ? "overdue-badge-blink" : ""} style={{
                                          fontSize: "11px",
                                          fontWeight: "700",
                                          padding: "3px 8px",
                                          borderRadius: "4px",
                                          backgroundColor:
                                            deadline.type === "overdue" ? "var(--priority-high-bg)" :
                                            deadline.type === "soon" ? "var(--priority-medium-bg)" : "rgba(255, 255, 255, 0.04)",
                                          color:
                                            deadline.type === "overdue" ? "var(--priority-high-text)" :
                                            deadline.type === "soon" ? "var(--priority-medium-text)" : "var(--text-muted)",
                                          border: "1px solid",
                                          borderColor:
                                            deadline.type === "overdue" ? "var(--priority-high-border)" :
                                            deadline.type === "soon" ? "var(--priority-medium-border)" : "var(--border-glass)",
                                        }}>
                                          {deadline.text}
                                        </span>
                                      )}

                                      {/* Priority Badge */}
                                      <Badge priority={t.fields.priority?.name} />

                                      {/* Status Badge */}
                                      <Badge status={t.fields.status?.name} />

                                      {/* Assignee Avatar */}
                                      {t.fields.assignee ? (
                                        <img
                                          src={t.fields.assignee.avatarUrl}
                                          alt={t.fields.assignee.displayName}
                                          style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                                          title={t.fields.assignee.displayName}
                                        />
                                      ) : (
                                        <div style={{
                                          width: "24px",
                                          height: "24px",
                                          borderRadius: "50%",
                                          border: "1px dashed var(--text-dim)",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "var(--text-dim)",
                                          fontSize: "10px"
                                        }} title="Unassigned">
                                          ?
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <EmptyStateMessage text="No tasks found matching current search queries or filters." showIcon={true} />
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: 💼 PROJECT & SPRINT ALLOCATOR */}
                    {activeCoordinatorTab === "projects" && (
                      <div className="fade-in" style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px"
                      }}>
                          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", margin: "0 0 10px 0" }}>
                            Active Projects Allocated to {(dynamicSpokes[currentBoardId] || SPOKES[currentBoardId])?.name || "Our Campus"}
                          </h3>

                          {acceptedProjectsForSpoke.length > 0 ? (
                            acceptedProjectsForSpoke.map((proj) => {
                              // Calculate milestones progress
                              const expectedSummary = `[${proj.company}] ${proj.title}`;
                              const epicKey = proj.allocations ? proj.allocations.find(a => a.targetCampusId === currentBoardId)?.assignedKey : proj.assignedKey;
                              const projTasks = tasks.filter(t => {
                                const parentKey = t.fields?.parent?.key || t.parent?.key;
                                const parentSummary = t.fields?.parent?.fields?.summary || t.fields?.parent?.summary || t.parent?.fields?.summary || t.parent?.summary;
                                return (epicKey && parentKey === epicKey) || (parentSummary && parentSummary === expectedSummary);
                              });
                              
                              const totalT = projTasks.length;
                              const doneT = projTasks.filter(t => (t.fields?.status?.name || t.fields?.status || "") === "Done").length;
                              const progressPct = totalT > 0 ? Math.round((doneT / totalT) * 100) : 0;

                              return (
                                <div key={proj.id} className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                      <CompanyLogo company={proj.company} size={36} />
                                      <div>
                                        <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: "800", color: "var(--text-main)" }}>{proj.title}</h4>
                                        <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Sponsor: <strong>{proj.company}</strong> • Epic: <strong style={{ color: "var(--primary)", fontFamily: "var(--mono)" }}>{epicKey || "PNLP-3"}</strong></span>
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const alloc = proj.allocations ? proj.allocations.find(a => a.targetCampusId === currentBoardId) : null;
                                          if (alloc && alloc.customBoardId) {
                                            setActiveCustomBoardId(alloc.customBoardId);
                                            setActiveCustomBoardTitle(proj.title);
                                            fetchJiraTasks(false, alloc.customBoardId);
                                            setFilterProject("All");
                                          } else {
                                            setActiveCustomBoardId(null);
                                            setActiveCustomBoardTitle("");
                                            setFilterProject(`[${proj.company}] ${proj.title}`);
                                          }
                                          setActiveView("kanban");
                                          window.scrollTo(0, 0);
                                        }}
                                        style={{
                                          background: "rgba(99, 102, 241, 0.08)",
                                          border: "1px solid rgba(99, 102, 241, 0.25)",
                                          borderRadius: "8px",
                                          color: "#6366f1",
                                          cursor: "pointer",
                                          fontSize: "12px",
                                          fontWeight: "750",
                                          padding: "6px 12px",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "6px"
                                        }}
                                        title={`Open Kanban Board for ${proj.title}`}
                                      >
                                        <FaClipboardList size={12} />
                                        <span>View Kanban Board</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteProject(proj._id || proj.id)}
                                        className="btn-secondary"
                                        style={{
                                          padding: "6px 12px",
                                          fontSize: "12px",
                                          color: "#ef4444",
                                          borderColor: "rgba(239, 68, 68, 0.3)",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "6px",
                                          borderRadius: "8px",
                                          background: "rgba(239, 68, 68, 0.05)",
                                          cursor: "pointer"
                                        }}
                                        title="Delete Project Completely"
                                      >
                                        <FaTrashAlt size={12} /> Delete Project
                                      </button>
                                    </div>
                                  </div>
                                  <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-muted)", lineHeight: "1.4" }}>{proj.description}</p>
                                  <div style={{
                                    background: "rgba(255, 255, 255, 0.005)",
                                    border: "1px solid var(--border-glass)",
                                    borderRadius: "8px",
                                    padding: "10px 14px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                    fontSize: "12px"
                                  }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                      <span style={{ color: "var(--text-muted)" }}>Agile Sprint Milestone Completion</span>
                                      <strong style={{ color: "var(--primary)", fontFamily: "var(--mono)" }}>{progressPct}% ({doneT}/{totalT} Phases)</strong>
                                    </div>
                                    <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "3px", overflow: "hidden", border: "1px solid var(--border-glass)" }}>
                                      <div style={{ width: `${progressPct}%`, height: "100%", background: "var(--primary)", borderRadius: "3px" }}></div>
                                    </div>
                                  </div>

                                  {/* Mentors Row */}
                                  {(() => {
                                    const allocation = proj.allocations?.find(a => a.targetCampusId === currentBoardId);
                                    const currFacultyMentor = allocation?.facultyMentor || proj.facultyMentor;
                                    const currProjectMentor = allocation?.projectMentor || proj.projectMentor;
                                    return (
                                      <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                        gap: "12px",
                                        marginTop: "6px"
                                      }}>
                                        {/* Faculty Mentor */}
                                        <div style={{
                                          background: "rgba(255, 255, 255, 0.01)",
                                          border: "1px solid var(--border-glass)",
                                          borderRadius: "8px",
                                          padding: "10px 12px",
                                          fontSize: "12px"
                                        }}>
                                          <div style={{ fontWeight: "750", color: "var(--text-main)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                                            <FaGraduationCap style={{ color: "#10b981" }} /> College Faculty Mentor
                                          </div>
                                          {currFacultyMentor ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                              <img src={currFacultyMentor.avatarUrl || "https://ui-avatars.com/api/?name=Mentor&background=10b981&color=fff"} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
                                              <div>
                                                <div style={{ fontWeight: "600", fontSize: "11.5px" }}>{currFacultyMentor.displayName}</div>
                                                <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>{currFacultyMentor.emailAddress}</div>
                                              </div>
                                            </div>
                                          ) : (
                                            <div style={{ fontStyle: "italic", color: "var(--text-dim)", fontSize: "11px", marginBottom: "8px" }}>No Faculty Mentor assigned</div>
                                          )}
                                          
                                          {/* Dropdown select to assign */}
                                          {!currFacultyMentor && (
                                            <div>
                                               <select
                                                value=""
                                                onClick={(e) => e.stopPropagation()}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onChange={async (e) => {
                                                  e.stopPropagation();
                                                  const mentorId = e.target.value;
                                                  if (!mentorId) return;
                                                  try {
                                                    const res = await axios.post(`http://localhost:5001/api/project/${proj._id || proj.id}/spoke/${currentBoardId}/faculty-mentor`, { mentorId });
                                                    if (res.data && res.data.success) {
                                                      triggerToast("Faculty Mentor assigned successfully!");
                                                      fetchModeratorProjects(true); // reload projects list
                                                    }
                                                  } catch (err) {
                                                    console.error(err);
                                                    triggerToast("Failed to assign Faculty Mentor.", "error");
                                                  }
                                                }}
                                                style={{ width: "100%", padding: "6px 8px", background: "#1f2937", border: "1px solid var(--border-glass)", borderRadius: "6px", color: "white", fontSize: "11px", outline: "none", cursor: "pointer" }}
                                              >
                                                <option value="">-- Assign Faculty Mentor --</option>
                                                {spokeMembers.filter(m => {
                                                  const r = (m.role || "").toLowerCase();
                                                  const d = (m.displayName || "").toLowerCase();
                                                  return r.includes("mentor") || r.includes("faculty") || r.includes("professor") || d.includes("mentor") || d.includes("faculty") || d.includes("professor");
                                                }).map(m => (
                                                  <option key={m.accountId} value={m.accountId}>{m.displayName.replace(/ \((Student Developer|Faculty Mentor|Coordinator)\)/g, "")}</option>
                                                ))}
                                              </select>
                                            </div>
                                          )}
                                        </div>

                                        {/* Company Project Mentor */}
                                        <div style={{
                                          background: "rgba(255, 255, 255, 0.01)",
                                          border: "1px solid var(--border-glass)",
                                          borderRadius: "8px",
                                          padding: "10px 12px",
                                          fontSize: "12px"
                                        }}>
                                          <div style={{ fontWeight: "750", color: "var(--text-main)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                                            <FaUser style={{ color: "#f97316" }} /> Company Project Mentor
                                          </div>
                                          {currProjectMentor ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                              <img src={currProjectMentor.avatarUrl || "https://ui-avatars.com/api/?name=Mentor&background=f97316&color=fff"} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
                                              <div>
                                                <div style={{ fontWeight: "600", fontSize: "11.5px" }}>{currProjectMentor.displayName}</div>
                                                <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>{currProjectMentor.emailAddress}</div>
                                              </div>
                                            </div>
                                          ) : (
                                            <span style={{ fontStyle: "italic", color: "var(--text-dim)", fontSize: "11px" }}>Awaiting Sponsor assignment...</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              );
                            })
                          ) : (
                            <div className="glass-panel" style={{ padding: "30px", textAlign: "center", color: "var(--text-dim)", fontStyle: "italic", fontSize: "13px" }}>
                              No active projects have been allocated to your campus spoke yet.
                            </div>
                          )}
                        </div>
                    )}

                    {/* TAB: SPOKE TEAMS & PROJECTS */}
                    {activeCoordinatorTab === "spoke-teams" && (
                      <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--text-main)" }}>
                              🏛️ {(dynamicSpokes[currentBoardId] || SPOKES[currentBoardId])?.name || "This Spoke"} — Active Projects &amp; Teams
                            </h3>
                            <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
                              All projects your spoke is working on, with teams, student members, and collaboration spaces.
                            </p>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: "800", background: "rgba(99,102,241,0.08)", color: "var(--primary)", padding: "4px 12px", borderRadius: "20px", border: "1px solid rgba(99,102,241,0.2)" }}>
                            {acceptedProjectsForSpoke.length} Active Project{acceptedProjectsForSpoke.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {acceptedProjectsForSpoke.length > 0 ? acceptedProjectsForSpoke.map((proj) => {
                          const teamsForProj = Array.isArray(spokeTeams)
                            ? spokeTeams.filter(t => t.projectId === (proj._id || proj.id))
                            : [];

                          const epicAlloc = proj.allocations?.find(a => a.targetCampusId === currentBoardId);
                          const epicKey = epicAlloc?.assignedKey || proj.assignedKey;
                          const projTasks = tasks.filter(t => {
                            const pk = t.fields?.parent?.key || t.parent?.key;
                            const ps = t.fields?.parent?.fields?.summary || t.fields?.parent?.summary || "";
                            return (epicKey && pk === epicKey) || ps.includes(proj.title);
                          });
                          const totalT = projTasks.length;
                          const doneT = projTasks.filter(t => (t.fields?.status?.name || t.fields?.status || "") === "Done").length;
                          const pct = totalT > 0 ? Math.round((doneT / totalT) * 100) : 0;

                          return (
                            <div key={proj._id || proj.id} className="glass-panel" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "18px", border: "1px solid rgba(99,102,241,0.12)" }}>

                              {/* Project Header */}
                              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                                <CompanyLogo company={proj.company} size={42} />
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "850", color: "var(--text-main)" }}>{proj.title}</h4>
                                  <div style={{ display: "flex", gap: "12px", fontSize: "11.5px", color: "var(--text-dim)", marginTop: "3px", flexWrap: "wrap" }}>
                                    <span>Sponsor: <strong>{proj.company}</strong></span>
                                    <span>•</span>
                                    <span>Duration: <strong>{proj.duration}</strong></span>
                                    {epicKey && <><span>•</span><span>Epic: <strong style={{ color: "var(--primary)", fontFamily: "var(--mono)" }}>{epicKey}</strong></span></>}
                                  </div>
                                </div>
                                <div style={{ textAlign: "right", minWidth: "80px" }}>
                                  <div style={{ fontSize: "20px", fontWeight: "900", color: pct === 100 ? "#10b981" : "var(--primary)", fontFamily: "var(--mono)" }}>{pct}%</div>
                                  <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>Sprint Progress</div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div style={{ height: "5px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, var(--primary), #8b5cf6)", borderRadius: "3px", transition: "width 0.5s ease" }} />
                              </div>

                              {/* Teams Section */}
                              {teamsForProj.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                  <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Assigned Teams ({teamsForProj.length})
                                  </span>
                                  {teamsForProj.map((team) => (
                                    <div key={team._id} style={{ background: "rgba(255,255,255,0.015)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>

                                      {/* Team Header Row */}
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "900", fontSize: "14px" }}>
                                            {team.name?.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                            <div style={{ fontWeight: "800", fontSize: "13.5px", color: "var(--text-main)" }}>{team.name}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                                              Leader: <strong style={{ color: "#f97316" }}>{team.teamLeader?.displayName || "Not Assigned"}</strong>
                                              {team.subMentor && <> &nbsp;·&nbsp; Co-Mentor: <strong>{team.subMentor.displayName}</strong></>}
                                            </div>
                                          </div>
                                        </div>
                                        {team.githubRepo && (
                                          <a
                                            href={team.githubRepo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: "6px",
                                              padding: "6px 12px",
                                              background: "rgba(99,102,241,0.08)",
                                              border: "1px solid rgba(99,102,241,0.2)",
                                              borderRadius: "8px",
                                              color: "var(--primary)",
                                              fontSize: "11.5px",
                                              fontWeight: "750",
                                              textDecoration: "none",
                                              transition: "all 0.2s ease"
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
                                          >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                                            View Repo
                                          </a>
                                        )}
                                      </div>

                                      {/* Students Grid */}
                                      <div>
                                        <span style={{ fontSize: "10.5px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: "8px" }}>
                                          Student Members ({team.members?.length || 0})
                                        </span>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
                                          {(team.members || []).map((member, mIdx) => {
                                            const isLeader = team.teamLeader && (
                                              team.teamLeader.accountId === member.accountId ||
                                              team.teamLeader.emailAddress === member.emailAddress
                                            );
                                            return (
                                              <div key={mIdx} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", background: "rgba(255,255,255,0.02)", border: isLeader ? "1px solid rgba(249,115,22,0.3)" : "1px solid var(--border-glass)", borderRadius: "8px" }}>
                                                <img
                                                  src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName || "S")}&background=6366f1&color=fff&size=32`}
                                                  alt=""
                                                  style={{ width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0 }}
                                                />
                                                <div style={{ overflow: "hidden" }}>
                                                  <div style={{ fontSize: "11.5px", fontWeight: "700", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {member.displayName}
                                                    {isLeader && <span style={{ marginLeft: "4px", fontSize: "9px", background: "rgba(249,115,22,0.15)", color: "#f97316", padding: "1px 5px", borderRadius: "4px", fontWeight: "800" }}>LEAD</span>}
                                                  </div>
                                                  <div style={{ fontSize: "10px", color: "var(--text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.emailAddress}</div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ padding: "14px", background: "rgba(255,255,255,0.01)", border: "1px dashed var(--border-glass)", borderRadius: "10px", textAlign: "center", fontSize: "12.5px", color: "var(--text-dim)", fontStyle: "italic" }}>
                                  No teams assigned to this project yet.
                                </div>
                              )}
                            </div>
                          );
                        }) : (
                          <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)", fontStyle: "italic", fontSize: "13px" }}>
                            No active projects allocated to your spoke yet.
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 4: PENDING FACULTY APPROVALS */}
                    {activeCoordinatorTab === "faculty-approvals" && (
                      <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                          <div>
                            <h3 style={{ fontSize: "19px", fontWeight: "800", color: "var(--text-main)", margin: "0 0 4px" }}>
                              Faculty Mentor Verifications
                            </h3>
                            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
                              Review and approve faculty mentors registered for your campus spoke before granting portal access.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => fetchPendingFaculty(currentBoardId)}
                            className="btn-secondary"
                            style={{ padding: "8px 14px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <FaSyncAlt className={isPendingFacultyLoading ? "pulse-glow" : ""} /> Refresh List
                          </button>
                        </div>

                        {isPendingFacultyLoading ? (
                          <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                            <FaSyncAlt className="pulse-glow" style={{ animation: "pulseGlow 1.5s infinite linear", fontSize: "20px", marginBottom: "10px" }} />
                            <div>Checking pending faculty registrations...</div>
                          </div>
                        ) : pendingFacultyList.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {pendingFacultyList.map((faculty) => (
                              <div
                                key={faculty.id}
                                className="glass-panel"
                                style={{
                                  padding: "20px 24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: "16px",
                                  borderRadius: "14px",
                                  border: "1px solid var(--border-glass)"
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                  <div style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    background: "rgba(99, 102, 241, 0.15)",
                                    color: "var(--primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px",
                                    fontWeight: "800"
                                  }}>
                                    {faculty.displayName ? faculty.displayName[0].toUpperCase() : "F"}
                                  </div>
                                  <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                      <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>{faculty.displayName}</strong>
                                      <span style={{
                                        fontSize: "11px",
                                        fontWeight: "800",
                                        padding: "2px 8px",
                                        borderRadius: "6px",
                                        background: "rgba(245, 158, 11, 0.12)",
                                        color: "#f59e0b",
                                        border: "1px solid rgba(245, 158, 11, 0.25)"
                                      }}>
                                        Pending Verification
                                      </span>
                                    </div>
                                    <div style={{ fontSize: "12.5px", color: "var(--text-muted)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                                      <span>📧 {faculty.email}</span>
                                      <span>📅 Registered: {new Date(faculty.createdAt).toLocaleDateString()}</span>
                                      <span>🎓 Role: Faculty Mentor</span>
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectFaculty(faculty.id, faculty.displayName)}
                                    style={{
                                      padding: "8px 16px",
                                      borderRadius: "8px",
                                      border: "1px solid rgba(239, 68, 68, 0.3)",
                                      background: "rgba(239, 68, 68, 0.08)",
                                      color: "#ef4444",
                                      fontWeight: "750",
                                      fontSize: "12.5px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px"
                                    }}
                                  >
                                    <FaUserX /> Decline
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveFaculty(faculty.id, faculty.displayName)}
                                    style={{
                                      padding: "8px 18px",
                                      borderRadius: "8px",
                                      border: "none",
                                      background: "#10b981",
                                      color: "#ffffff",
                                      fontWeight: "750",
                                      fontSize: "12.5px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
                                    }}
                                  >
                                    <FaUserCheck /> Verify & Approve
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="glass-panel" style={{ padding: "48px 24px", textAlign: "center", borderRadius: "14px" }}>
                            <div style={{ fontSize: "36px", color: "#10b981", marginBottom: "12px" }}>
                              <FaUserCheck />
                            </div>
                            <h4 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", margin: "0 0 6px" }}>
                              No Pending Faculty Registrations
                            </h4>
                            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
                              All faculty mentor accounts for your campus spoke have been verified and activated.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

              </div>
            )}

            {/* CONFLUENCE WIKI VIEW */}
            {activeView === "confluence" && (
              <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-main)" }}>
                <ConfluenceView 
                  activeWorkspace={activeWorkspace}
                  activeCustomBoardId={activeCustomBoardId}
                  activeCustomBoardTitle={activeCustomBoardTitle}
                  setFilterProject={setFilterProject}
                />
              </div>
            )}

            {/* 2. DRAGGABLE KANBAN BOARD VIEW */}
            {activeView === "kanban" && (
              <div className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                
                {/* Back Button */}
                <div style={{ marginBottom: "16px" }}>
                  <button
                    onClick={() => setActiveView("dashboard")}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border-subtle)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-main)",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
                  >
                    ← Go Back
                  </button>
                </div>

                {/* Project Title Header */}
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                    {activeCustomBoardTitle 
                      ? `${activeCustomBoardTitle} - Kanban Board` 
                      : (filterProject === "All" 
                          ? "All Projects - Kanban Board" 
                          : `${filterProject.replace(/^\[.*?\]\s*/, '')} - Kanban Board`
                        )
                    }
                  </h2>
                </div>

                {/* DragDrop Board Container */}
                <DragDropContext onDragEnd={onDragEnd}>
                  <div style={{ display: "flex", gap: "20px", flex: 1, minHeight: "600px", alignItems: "stretch", overflowX: "auto" }}>
                    
                    {/* Column 1: Backlog */}
                    <Droppable droppableId="col-backlog">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={getColumnStyle(snapshot.isDraggingOver)}
                        >
                          <ColumnHeader
                            title="To Do"
                            count={filteredTasks.filter(t => t.fields.status.name === "To Do").length}
                            color="var(--status-backlog-text)"
                            bgColor="var(--status-backlog-bg)"
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", flex: 1 }}>
                            {filteredTasks
                              .filter(t => t.fields.status.name === "To Do")
                              .map((task, idx) => (
                                <DraggableCard key={task.id} task={task} index={idx} onClick={() => setSelectedTask(task)} />
                              ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>

                    {/* Column 2: In Progress */}
                    <Droppable droppableId="col-progress">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={getColumnStyle(snapshot.isDraggingOver)}
                        >
                          <ColumnHeader
                            title="In Progress"
                            count={filteredTasks.filter(t => t.fields.status.name === "In Progress").length}
                            color="var(--status-progress-text)"
                            bgColor="var(--status-progress-bg)"
                            pulse={true}
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", flex: 1 }}>
                            {filteredTasks
                              .filter(t => t.fields.status.name === "In Progress")
                              .map((task, idx) => (
                                <DraggableCard key={task.id} task={task} index={idx} onClick={() => setSelectedTask(task)} />
                              ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>

                    {/* Column 3: Done */}
                    <Droppable droppableId="col-done">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={getColumnStyle(snapshot.isDraggingOver)}
                        >
                          <ColumnHeader
                            title="Done"
                            count={filteredTasks.filter(t => t.fields.status.name === "Done").length}
                            color="var(--status-done-text)"
                            bgColor="var(--status-done-bg)"
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", flex: 1 }}>
                            {filteredTasks
                              .filter(t => t.fields.status.name === "Done")
                              .map((task, idx) => (
                                <DraggableCard key={task.id} task={task} index={idx} onClick={() => setSelectedTask(task)} />
                              ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>

                  </div>
                </DragDropContext>
              </div>
            )}
          </>
        )}
      </main>

      {/* TOAST SYSTEM CONTAINER */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="toast"
            style={{
              borderLeftColor:
                toast.type === "warning" ? "#f59e0b" :
                toast.type === "error" ? "#ef4444" : "var(--primary)"
            }}
          >
            {toast.type === "error" ? <FaExclamationTriangle color="#ef4444" /> : toast.type === "warning" ? <FaInfoCircle color="#f59e0b" /> : <FaCheck color="var(--primary)" />}
            <span style={{ fontSize: "13px", fontWeight: "500" }}>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* 🚀 MODAL 1: NEW TASK CREATION */}
      {isCreateOpen && (
        <div style={modalBackdropStyle}>
          <div className="glass-panel" style={{
            width: "550px",
            padding: "30px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            animation: "slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)" }}>Create New Sprint Issue</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={modalLabelStyle}>Task Summary / Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g., Implement dark mode toggles and cookie storage"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                />
              </div>

              <div>
                <label style={modalLabelStyle}>Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: "80px", resize: "vertical", fontFamily: "inherit" }}
                  placeholder="Write clear steps or requirements..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div>
                <label style={modalLabelStyle}>Issue Type *</label>
                <select
                  required
                  className="form-select"
                  value={newIssueType}
                  onChange={(e) => setNewIssueType(e.target.value)}
                >
                  <option value="Task">Task</option>
                  <option value="Story">Story</option>
                  <option value="Bug">Bug</option>
                  <option value="Epic">Epic</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div>
                  <label style={modalLabelStyle}>Assignee</label>
                  <select
                    className="form-select"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {spokeMembers.map(m => (
                      <option key={m.accountId} value={m.displayName}>{m.displayName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={modalLabelStyle}>Reporter</label>
                  <select
                    className="form-select"
                    value={newReporter}
                    onChange={(e) => setNewReporter(e.target.value)}
                  >
                    <option value="">Unreported</option>
                    {spokeMembers.map(m => (
                      <option key={m.accountId} value={m.displayName}>{m.displayName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={modalLabelStyle}>Priority</label>
                  <select
                    className="form-select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={modalLabelStyle}>Column Status</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label style={modalLabelStyle}>Due Date Deadline</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📝 MODAL 2: TASK DETAIL AND EDITOR */}
      {selectedTask && (
        <div style={modalBackdropStyle}>
          <div className="glass-panel" style={{
            width: "600px",
            padding: "32px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            animation: "slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  fontFamily: "var(--mono)",
                  color: "var(--primary)",
                  fontSize: "14px",
                  fontWeight: "700",
                  background: "rgba(45, 212, 191, 0.08)",
                  padding: "6px 12px",
                  borderRadius: "6px"
                }}>
                  {selectedTask.key}
                </span>
                {(() => {
                  const sponsor = getSponsorCompany(selectedTask);
                  return sponsor ? (
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      title={`Project sponsored by ${sponsor.name}`}
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        objectFit: "contain",
                        background: "white",
                        padding: "2px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.15)"
                      }}
                    />
                  ) : null;
                })()}
                {selectedTask.fields.issueType && (
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor:
                      selectedTask.fields.issueType === "Epic" ? "rgba(168, 85, 247, 0.12)" :
                      selectedTask.fields.issueType === "Bug" ? "rgba(239, 68, 68, 0.12)" :
                      selectedTask.fields.issueType === "Story" ? "rgba(16, 185, 129, 0.12)" : "rgba(59, 130, 246, 0.12)",
                    color:
                      selectedTask.fields.issueType === "Epic" ? "#c084fc" :
                      selectedTask.fields.issueType === "Bug" ? "#f87171" :
                      selectedTask.fields.issueType === "Story" ? "#34d399" : "#60a5fa",
                    border: "1px solid",
                    borderColor:
                      selectedTask.fields.issueType === "Epic" ? "rgba(168, 85, 247, 0.25)" :
                      selectedTask.fields.issueType === "Bug" ? "rgba(239, 68, 68, 0.25)" :
                      selectedTask.fields.issueType === "Story" ? "rgba(16, 185, 129, 0.25)" : "rgba(59, 130, 246, 0.25)"
                  }}>
                    {selectedTask.fields.issueType === "Epic" ? "Epic" :
                     selectedTask.fields.issueType === "Bug" ? "Bug" :
                     selectedTask.fields.issueType === "Story" ? "Story" : "Task"}
                  </span>
                )}
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {currentPersona !== "moderator" && (
                  <button
                    onClick={() => handleDeleteTask(selectedTask.id, selectedTask.key)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(239, 68, 68, 0.8)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}
                    title="Delete ticket permanently"
                  >
                    <FaTrashAlt size={14} />
                    <span>Delete</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setModalTab("overview");
                  }}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            {/* Tab Navigation header */}
            <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "10px", marginBottom: "18px" }}>
              {["overview", "subtasks", "worklog", "links", "deliverables"].map(tabName => (
                <button
                  key={tabName}
                  type="button"
                  onClick={() => {
                    setModalTab(tabName);
                    if (tabName === "worklog") {
                      fetchWorklogHistory(selectedTask.key);
                    } else if (tabName === "deliverables") {
                      fetchSubmissions(selectedTask.id);
                    }
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid transparent",
                    background: modalTab === tabName ? "rgba(45, 212, 191, 0.08)" : "transparent",
                    color: modalTab === tabName ? "var(--primary)" : "var(--text-muted)",
                    borderColor: modalTab === tabName ? "rgba(45, 212, 191, 0.15)" : "transparent",
                    fontWeight: "700",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.2px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  {tabName === "overview" && "General"}
                  {tabName === "subtasks" && (selectedTask.fields.issueType === "Epic" ? `Epic Tasks (${currentTaskChildren.length})` : `Subtasks (${currentTaskChildren.length})`)}
                  {tabName === "worklog" && "Worklogs"}
                  {tabName === "links" && "Links & Tags"}
                  {tabName === "deliverables" && "Deliverables"}
                </button>
              ))}
            </div>

            {/* Scrollable Tab Panel Container */}
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px", paddingBottom: "10px" }}>
              
              {/* TAB 1: OVERVIEW PANEL */}
              {modalTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  
                  {/* Blocker Flag impediment toggle Switch */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: selectedTask.fields.flagged ? "rgba(251, 146, 60, 0.08)" : "rgba(255,255,255,0.01)",
                    border: "1px solid",
                    borderColor: selectedTask.fields.flagged ? "var(--accent)" : "var(--border-glass)",
                    borderRadius: "10px",
                    transition: "var(--transition-smooth)"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: "700", color: selectedTask.fields.flagged ? "var(--accent)" : "var(--text-main)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent)" }}><FaExclamationTriangle /> Blocker Flag Impediment</span>
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {selectedTask.fields.flagged ? "Blocked status flash active on board." : "Flag issue as blocked by a dependency."}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isCentralAdmin}
                      onClick={() => handleToggleBlockerFlag(selectedTask)}
                      className="btn-secondary"
                      style={{
                        borderColor: selectedTask.fields.flagged ? "var(--accent)" : "var(--border-glass)",
                        color: selectedTask.fields.flagged ? "var(--accent)" : "var(--text-main)",
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: "700",
                        opacity: isCentralAdmin ? 0.6 : 1,
                        cursor: isCentralAdmin ? "not-allowed" : "pointer"
                      }}
                    >
                      {selectedTask.fields.flagged ? "Blocked" : "Flag Blocker"}
                    </button>
                  </div>

                  {/* Editable Title/Summary */}
                  <div>
                    <label style={modalLabelStyle}>Task Summary</label>
                    <input
                      type="text"
                      readOnly={isCentralAdmin}
                      className="form-input"
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        background: "rgba(0,0,0,0.15)",
                        border: "1.5px solid var(--border-glass)",
                        color: "var(--text-main)",
                        cursor: isCentralAdmin ? "default" : "text"
                      }}
                      onBlur={(e) => {
                        if (isCentralAdmin) return;
                        if (e.target.value.trim() && e.target.value !== selectedTask.fields.summary) {
                          handleUpdateTaskDetail({
                            ...selectedTask,
                            fields: {
                              ...selectedTask.fields,
                              summary: e.target.value
                            }
                          }, "summary");
                        }
                      }}
                      defaultValue={selectedTask.fields.summary}
                    />
                  </div>

                  {/* Description Area */}
                  <div>
                    <label style={modalLabelStyle}>Detailed Description</label>
                    <textarea
                      readOnly={isCentralAdmin}
                      className="form-input"
                      style={{
                        minHeight: "100px",
                        fontSize: "13.5px",
                        lineHeight: "1.6",
                        background: "rgba(0,0,0,0.15)",
                        resize: isCentralAdmin ? "none" : "vertical",
                        cursor: isCentralAdmin ? "default" : "text"
                      }}
                      defaultValue={selectedTask.fields.description || ""}
                      onBlur={(e) => {
                        if (isCentralAdmin) return;
                        if (e.target.value !== selectedTask.fields.description) {
                          handleUpdateTaskDetail({
                            ...selectedTask,
                            fields: {
                              ...selectedTask.fields,
                              description: e.target.value
                            }
                          }, "description");
                        }
                      }}
                    />
                  </div>

                  {/* Fields Selection panel */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "12px",
                    padding: "14px",
                    background: "rgba(255, 255, 255, 0.01)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "12px"
                  }}>
                    {/* Status */}
                    <div>
                      <label style={modalLabelStyle}>Status</label>
                      <select
                        className="form-select"
                        disabled={isCentralAdmin}
                        value={selectedTask.fields.status?.name}
                        onChange={(e) => {
                          handleUpdateTaskDetail({
                            ...selectedTask,
                            fields: {
                              ...selectedTask.fields,
                              status: { name: e.target.value }
                            }
                          }, "status");
                        }}
                        style={{ height: "36px", padding: "6px 12px", fontSize: "13px", cursor: isCentralAdmin ? "not-allowed" : "pointer" }}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label style={modalLabelStyle}>Priority</label>
                      <select
                        className="form-select"
                        disabled={isCentralAdmin}
                        value={selectedTask.fields.priority?.name}
                        onChange={(e) => {
                          handleUpdateTaskDetail({
                            ...selectedTask,
                            fields: {
                              ...selectedTask.fields,
                              priority: { name: e.target.value }
                            }
                          }, "priority");
                        }}
                        style={{ height: "36px", padding: "6px 12px", fontSize: "13px", cursor: isCentralAdmin ? "not-allowed" : "pointer" }}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    {/* Assignee */}
                    <div>
                      <label style={modalLabelStyle}>Assignee</label>
                      <select
                        className="form-select"
                        disabled={isCentralAdmin}
                        value={selectedTask.fields.assignee?.displayName || ""}
                        onChange={(e) => {
                          const foundUser = spokeMembers.find(m => m.displayName === e.target.value);
                          handleUpdateTaskDetail({
                            ...selectedTask,
                            fields: {
                              ...selectedTask.fields,
                              assignee: foundUser ? {
                                accountId: foundUser.accountId,
                                displayName: foundUser.displayName,
                                avatarUrl: foundUser.avatarUrl
                              } : null
                            }
                          }, "assignee");
                        }}
                        style={{ height: "36px", padding: "6px 12px", fontSize: "13px", cursor: isCentralAdmin ? "not-allowed" : "pointer" }}
                      >
                        <option value="">Unassigned</option>
                        {spokeMembers.map(m => (
                          <option key={m.accountId} value={m.displayName}>{m.displayName}</option>
                        ))}
                      </select>
                    </div>

                    {/* Reporter */}
                    <div>
                      <label style={modalLabelStyle}>Reporter</label>
                      <select
                        className="form-select"
                        disabled={isCentralAdmin}
                        value={selectedTask.fields.reporter?.displayName || ""}
                        onChange={(e) => {
                          const foundUser = activeAssignees.find(m => m.name === e.target.value);
                          handleUpdateTaskDetail({
                            ...selectedTask,
                            fields: {
                              ...selectedTask.fields,
                              reporter: foundUser ? {
                                accountId: foundUser.accountId,
                                displayName: foundUser.name,
                                avatarUrl: foundUser.avatar
                              } : null
                            }
                          }, "reporter");
                        }}
                        style={{ height: "36px", padding: "6px 12px", fontSize: "13px", cursor: isCentralAdmin ? "not-allowed" : "pointer" }}
                      >
                        <option value="">Unreported</option>
                        {activeAssignees.map(m => (
                          <option key={m.accountId} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 📅 Due Date & Email reminder alerts */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    padding: "16px",
                    background: "rgba(45, 212, 191, 0.03)",
                    border: "1px solid rgba(45, 212, 191, 0.15)",
                    borderRadius: "12px",
                    gap: "16px",
                    alignItems: "center"
                  }}>
                    <div>
                      <label style={modalLabelStyle}><FaCalendarAlt style={{ marginRight: '6px' }} /> Target Due Date</label>
                      <input
                        type="date"
                        disabled={isCentralAdmin}
                        className="form-input"
                        style={{ height: "36px", padding: "6px 12px", fontSize: "13px", cursor: isCentralAdmin ? "not-allowed" : "pointer" }}
                        value={selectedTask.fields.dueDate || ""}
                        onChange={(e) => {
                          handleUpdateTaskDetail({
                            ...selectedTask,
                            fields: {
                              ...selectedTask.fields,
                              dueDate: e.target.value
                            }
                          }, "dueDate");
                        }}
                      />
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn-primary pulse-glow"
                        disabled={!selectedTask.fields.assignee || isCentralAdmin}
                        style={{
                          height: "36px",
                          background: "#ef4444",
                          boxShadow: "0 4px 15px rgba(239, 68, 68, 0.2)",
                          opacity: (selectedTask.fields.assignee && !isCentralAdmin) ? 1 : 0.5,
                          cursor: (selectedTask.fields.assignee && !isCentralAdmin) ? "pointer" : "not-allowed",
                          color: "white",
                          fontWeight: "750"
                        }}
                        onClick={() => handleOpenEmailComposer(selectedTask)}
                        title={isCentralAdmin ? "Central Administrators cannot send email alerts from spoke boards" : selectedTask.fields.assignee ? "Send alert email to assignee" : "Assign task to a team member to trigger alerts"}
                      >
                        <FaEnvelope size={12} />
                        <span>Send Email Alert</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SUBTASKS CHECKLIST PANEL */}
              {modalTab === "subtasks" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h3 style={{ fontSize: "13.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                    {selectedTask.fields.issueType === "Epic" ? "Epic Child Tasks" : "Child Checklist Items"}
                  </h3>

                  {/* Add subtask inline form */}
                  {currentPersona !== "moderator" && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleCreateSubtask(selectedTask.key, subtaskInputSummary, subtaskAssigneeId, selectedTask.fields.issueType);
                    }} style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={selectedTask.fields.issueType === "Epic" ? "Add child task summary... (e.g. Implement API route)" : "Add subtask summary... (e.g. Write unit tests)"}
                        value={subtaskInputSummary}
                        onChange={(e) => setSubtaskInputSummary(e.target.value)}
                        style={{ flex: "2 1 200px", padding: "10px 14px", fontSize: "13px" }}
                      />
                      
                      <select
                        className="form-select"
                        value={subtaskAssigneeId}
                        onChange={(e) => setSubtaskAssigneeId(e.target.value)}
                        style={{ flex: "1 1 150px", padding: "10px 14px", fontSize: "13px", height: "auto" }}
                      >
                        <option value="">Assignee...</option>
                        {activeAssignees.map(member => (
                          <option key={member.accountId} value={member.accountId}>
                            {member.name}
                          </option>
                        ))}
                      </select>

                      <button type="submit" className="btn-primary" style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        Add Task
                      </button>
                    </form>
                  )}

                  {/* Subtasks checklist */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto", marginTop: "4px" }}>
                    {currentTaskChildren && currentTaskChildren.length > 0 ? (
                      currentTaskChildren.map(sub => (
                        <div
                          key={sub.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            background: "rgba(255,255,255,0.01)",
                            border: "1px solid var(--border-glass)",
                            borderRadius: "8px",
                            fontSize: "13px",
                            gap: "12px"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: "11px", color: "var(--primary)", fontFamily: "var(--mono)", fontWeight: "700", background: "rgba(45, 212, 191, 0.05)", padding: "2px 6px", borderRadius: "4px", whiteSpace: "nowrap" }}>
                              {sub.key}
                            </span>
                            <span style={{ color: "var(--text-main)", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {sub.summary}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                            {/* Subtask Assignee Avatar */}
                            {sub.assignee ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }} title={`Assigned to ${sub.assignee.displayName}`}>
                                <img
                                  src={sub.assignee.avatarUrl || "https://i.pravatar.cc/150"}
                                  alt={sub.assignee.displayName}
                                  style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1px solid var(--border-glass)" }}
                                />
                                <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                  {sub.assignee.displayName.split(" ")[0]}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: "11.5px", color: "var(--text-dim)", fontStyle: "italic" }}>
                                Unassigned
                              </span>
                            )}
                            <Badge status={sub.statusName} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic", textAlign: "center", padding: "40px" }}>
                        {selectedTask.fields.issueType === "Epic" 
                          ? "No child tasks configured under this Epic."
                          : "No child subtasks configured for this ticket."}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: WORK LOGGING & ESTIMATION PANEL */}
              {modalTab === "worklog" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "13.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                      Log Spent Hours
                    </h3>
                    {selectedTask.fields.timetracking && (
                      <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "700" }}>
                        Logged: {selectedTask.fields.timetracking.timeSpent || "0h"}
                      </span>
                    )}
                  </div>

                  {/* Add work log entry form */}
                  {currentPersona !== "moderator" && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleLogWorkSpent(selectedTask.key, worklogTimeSpent, worklogComment);
                    }} className="glass-panel" style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px" }}>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Time Spent *</label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            placeholder="e.g. 1h 30m, 45m"
                            value={worklogTimeSpent}
                            onChange={(e) => setWorklogTimeSpent(e.target.value)}
                            style={{ padding: "8px 12px", fontSize: "13px" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Work log comment</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Brief comment on what you worked on..."
                            value={worklogComment}
                            onChange={(e) => setWorklogComment(e.target.value)}
                            style={{ padding: "8px 12px", fontSize: "13px" }}
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn-primary" style={{ padding: "8px 14px", alignSelf: "flex-end", fontSize: "12px" }}>
                        Submit Worklog
                      </button>
                    </form>
                  )}

                  {/* Logs history list */}
                  <div style={{ marginTop: "4px" }}>
                    <h4 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.2px" }}>Logged Entries Feed</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
                      {isHistoryLoading ? (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>Fetching worklogs...</span>
                      ) : worklogHistory.length > 0 ? (
                        worklogHistory.map(log => (
                          <div
                            key={log.id}
                            style={{
                              padding: "10px 12px",
                              background: "rgba(255,255,255,0.01)",
                              border: "1px solid var(--border-glass)",
                              borderRadius: "8px",
                              fontSize: "12.5px"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontWeight: "700", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}><FaClock /> {log.timeSpent} spent</span>
                              <span style={{ color: "var(--text-dim)", fontSize: "10.5px" }}>{new Date(log.created).toLocaleDateString()}</span>
                            </div>
                            <p style={{ color: "var(--text-main)", fontStyle: "italic", margin: "0 0 4px 0", fontSize: "12px" }}>
                              "{log.comment?.body || log.comment || "No comment note added."}"
                            </p>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                              Developer: {log.author?.displayName}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: "var(--text-muted)", fontSize: "12.5px", fontStyle: "italic", textAlign: "center", padding: "10px" }}>
                          No hours logged on this ticket yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LINKS & TAGS ORGANIZER PANEL */}
              {modalTab === "links" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  
                  {/* Labels Organizer */}
                  <div>
                    <h3 style={{ fontSize: "13.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "8px" }}>
                      Labels & Custom Tags
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                      {selectedTask.fields.labels && selectedTask.fields.labels.length > 0 ? (
                        selectedTask.fields.labels.map(lbl => (
                          <span
                            key={lbl}
                            style={{
                              fontSize: "10.5px",
                              fontWeight: "700",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              background: "rgba(34, 211, 238, 0.08)",
                              color: "var(--secondary)",
                              border: "1px solid rgba(34, 211, 238, 0.15)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                          >
                            <span>{lbl}</span>
                            {currentPersona !== "moderator" && (
                              <FaTimes
                                size={10}
                                style={{ cursor: "pointer", color: "var(--accent)" }}
                                onClick={() => {
                                  const updated = selectedTask.fields.labels.filter(l => l !== lbl);
                                  handleUpdateLabels(selectedTask.key, updated);
                                }}
                              />
                            )}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>No labels associated.</span>
                      )}
                    </div>
                    
                    {currentPersona !== "moderator" && (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (labelInputString.trim()) {
                          const existing = selectedTask.fields.labels || [];
                          if (!existing.includes(labelInputString.trim())) {
                            handleUpdateLabels(selectedTask.key, [...existing, labelInputString.trim()]);
                          }
                          setLabelInputString("");
                        }
                      }} style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Add tag string... (e.g. backend)"
                          value={labelInputString}
                          onChange={(e) => setLabelInputString(e.target.value)}
                          style={{ padding: "8px 12px", fontSize: "12px" }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: "8px 14px", fontSize: "12px" }}>
                          Add tag
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Issue dependency linking */}
                  <div>
                    <h3 style={{ fontSize: "13.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "8px" }}>
                      Issue Dependency Relations
                    </h3>

                    {currentPersona !== "moderator" && (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleLinkIssues(selectedTask.key, linkTargetKey, linkRelationType);
                      }} className="glass-panel" style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px" }}>
                          <div>
                            <label style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>RELATION</label>
                            <select
                              className="form-select"
                              value={linkRelationType}
                              onChange={(e) => setLinkRelationType(e.target.value)}
                              style={{ height: "34px", padding: "4px 8px", fontSize: "12px" }}
                            >
                              <option value="blocks">Blocks</option>
                              <option value="is blocked by">Is Blocked By</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>TARGET BOARD ISSUE</label>
                            <select
                              className="form-select"
                              value={linkTargetKey}
                              onChange={(e) => setLinkTargetKey(e.target.value)}
                              style={{ height: "34px", padding: "4px 8px", fontSize: "12px" }}
                            >
                              <option value="">Select ticket...</option>
                              {tasks.filter(t => t.key !== selectedTask.key).map(t => (
                                <option key={t.key} value={t.key}>{t.key} - {t.fields.summary.substring(0, 30)}...</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <button type="submit" className="btn-primary" style={{ padding: "6px 12px", alignSelf: "flex-end", fontSize: "11px" }}>
                          Execute Link
                        </button>
                      </form>
                    )}

                    {/* Linked dependencies history */}
                    <div style={{ marginTop: "12px" }}>
                      <h4 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase" }}>Linked Issues</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto" }}>
                        {selectedTask.fields.issuelinks && selectedTask.fields.issuelinks.length > 0 ? (
                          selectedTask.fields.issuelinks.map(lnk => (
                            <div
                              key={lnk.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 12px",
                                background: "rgba(255,255,255,0.01)",
                                border: "1px solid var(--border-glass)",
                                borderRadius: "6px",
                                fontSize: "12px"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                <span style={{ fontWeight: "700", color: "var(--accent)" }}>{lnk.direction}</span>
                                <span style={{ fontFamily: "var(--mono)", color: "var(--primary)", fontWeight: "600", background: "rgba(45, 212, 191, 0.05)", padding: "2px 6px", borderRadius: "4px" }}>
                                  {lnk.key}
                                </span>
                                <span style={{ color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                  {lnk.summary}
                                </span>
                              </div>
                              <Badge status={lnk.statusName} />
                            </div>
                          ))
                        ) : (
                          <div style={{ color: "var(--text-muted)", fontSize: "12px", fontStyle: "italic" }}>
                            No linked dependencies defined on this ticket.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DELIVERABLES SUBMISSION PORTAL PANEL */}
              {modalTab === "deliverables" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {selectedTask.fields.issueType === "Epic" ? (
                    <div style={{
                      padding: "20px",
                      background: "rgba(239, 68, 68, 0.05)",
                      border: "1px dashed rgba(239, 68, 68, 0.2)",
                      borderRadius: "12px",
                      textAlign: "center",
                      color: "#ef4444",
                      fontSize: "13.5px"
                    }}>
                      Epic Alert: Deliverables must be submitted on sprint child tasks, not Epics.
                    </div>
                  ) : (
                    <>
                      {/* Submission Form */}
                      <div className="glass-panel" style={{ padding: "16px", background: "rgba(255,255,255,0.015)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <h3 style={{ fontSize: "13.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", margin: 0 }}>
                            Submit Sprint Deliverable Artifact
                          </h3>
                          {/* Mode toggle */}
                          <div style={{ display: "flex", gap: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "3px" }}>
                            <button
                              type="button"
                              onClick={() => { setSubmitMode("file"); setSubmitFile(null); setSubmitFileName(""); setSubmitFileUrl(""); }}
                              style={{
                                padding: "4px 12px", fontSize: "11px", fontWeight: "700", borderRadius: "6px", border: "none", cursor: "pointer", transition: "all 0.2s",
                                background: submitMode === "file" ? "var(--primary)" : "transparent",
                                color: submitMode === "file" ? "#fff" : "var(--text-dim)"
                              }}
                            >📁 Upload File</button>
                            <button
                              type="button"
                              onClick={() => { setSubmitMode("link"); setSubmitFile(null); setSubmitFileName(""); setSubmitFileUrl(""); }}
                              style={{
                                padding: "4px 12px", fontSize: "11px", fontWeight: "700", borderRadius: "6px", border: "none", cursor: "pointer", transition: "all 0.2s",
                                background: submitMode === "link" ? "var(--primary)" : "transparent",
                                color: submitMode === "link" ? "#fff" : "var(--text-dim)"
                              }}
                            >🔗 Submit Link</button>
                          </div>
                        </div>

                        <form onSubmit={handleSubmitDeliverable} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                          {submitMode === "file" ? (
                            /* FILE UPLOAD MODE */
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {/* Drag-drop / file picker */}
                              <label
                                htmlFor="deliverable-file-input"
                                style={{
                                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                  gap: "8px", padding: "22px", borderRadius: "10px", cursor: "pointer",
                                  border: "2px dashed", borderColor: submitFile ? "var(--primary)" : "rgba(255,255,255,0.18)",
                                  background: submitFile ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)",
                                  transition: "all 0.2s"
                                }}
                                onDragOver={(ev) => ev.preventDefault()}
                                onDrop={(ev) => { ev.preventDefault(); const f = ev.dataTransfer.files[0]; if (f) { setSubmitFile(f); setSubmitFileName(f.name); } }}
                              >
                                <span style={{ fontSize: "28px" }}>{submitFile ? "✅" : "📂"}</span>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: submitFile ? "var(--primary)" : "var(--text-muted)" }}>
                                  {submitFile ? submitFile.name : "Click or drag & drop any file here"}
                                </span>
                                <span style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>
                                  {submitFile ? `${(submitFile.size / 1024).toFixed(1)} KB` : "PDF, ZIP, DOCX, PY, IPYNB, MP4 — up to 50 MB"}
                                </span>
                                <input
                                  id="deliverable-file-input"
                                  type="file"
                                  style={{ display: "none" }}
                                  onChange={(e) => { const f = e.target.files[0]; if (f) { setSubmitFile(f); setSubmitFileName(f.name); } }}
                                />
                              </label>

                              {/* Optional custom label */}
                              <div>
                                <label style={{ fontSize: "10px", fontWeight: "750", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>CUSTOM FILE LABEL (OPTIONAL)</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder={submitFile ? submitFile.name : "e.g., Sprint_2_Final_Report"}
                                  value={submitFileName}
                                  onChange={(e) => setSubmitFileName(e.target.value)}
                                  style={{ padding: "8px 12px", fontSize: "12.5px" }}
                                />
                              </div>
                            </div>
                          ) : (
                            /* LINK MODE */
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                              <div>
                                <label style={{ fontSize: "10px", fontWeight: "750", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>ARTIFACT FILE NAME</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="e.g., VLSI_controller_layout.pdf"
                                  value={submitFileName}
                                  onChange={(e) => setSubmitFileName(e.target.value)}
                                  style={{ padding: "8px 12px", fontSize: "12.5px" }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: "10px", fontWeight: "750", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>ACCESS LINK (GITHUB / CLOUD)</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="e.g., https://github.com/..."
                                  value={submitFileUrl}
                                  onChange={(e) => setSubmitFileUrl(e.target.value)}
                                  style={{ padding: "8px 12px", fontSize: "12.5px" }}
                                />
                              </div>
                            </div>
                          )}

                          <div>
                            <label style={{ fontSize: "10px", fontWeight: "750", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>EXPLANATORY COMMENTS</label>
                            <textarea
                              className="form-input"
                              placeholder="Provide any review instructions or context for the coordinator..."
                              value={submitComments}
                              onChange={(e) => setSubmitComments(e.target.value)}
                              style={{ padding: "8px 12px", fontSize: "12.5px", height: "60px", resize: "none" }}
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmittingDeliverable}
                            className="btn-primary"
                            style={{ alignSelf: "flex-end", padding: "8px 18px", fontSize: "12px" }}
                          >
                            {isSubmittingDeliverable ? (submitMode === "file" ? "Uploading file..." : "Submitting link...") : "Submit Deliverable"}
                          </button>
                        </form>
                      </div>

                      {/* Submissions History List */}
                      <div>
                        <h3 style={{ fontSize: "13.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "12px" }}>
                          Submitted Artifacts History
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
                          {isSubmissionsLoading ? (
                            <div style={{ textAlign: "center", color: "var(--text-dim)", padding: "20px", fontSize: "12.5px" }}>Loading submissions...</div>
                          ) : submissions.length > 0 ? (
                            submissions.map((sub) => (
                              <div
                                key={sub._id}
                                style={{
                                  padding: "14px",
                                  background: "rgba(255,255,255,0.01)",
                                  border: "1px solid var(--border-glass)",
                                  borderRadius: "10px",
                                  fontSize: "12.5px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                              >
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: 1, marginRight: "16px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontWeight: "700", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      <span><FaPaperclip style={{ marginRight: '6px' }} /> {sub.fileName}</span>
                                    </span>
                                    <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                                      {new Date(sub.submittedAt).toLocaleString()}
                                    </span>
                                  </div>
                                  {sub.comments && (
                                    <p style={{ margin: "2px 0 0 0", fontStyle: "italic", color: "var(--text-muted)", fontSize: "11.5px" }}>
                                      "{sub.comments}"
                                    </p>
                                  )}
                                  <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: "600" }}>
                                    By: {sub.studentName}
                                  </span>
                                </div>
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-secondary"
                                  style={{ padding: "6px 12px", textDecoration: "none", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                >
                                  <span><FaLink style={{ marginRight: '6px' }} /> Open Artifact</span>
                                </a>
                              </div>
                            ))
                          ) : (
                            <div style={{ color: "var(--text-dim)", fontSize: "12.5px", fontStyle: "italic", textAlign: "center", padding: "30px", background: "rgba(255,255,255,0.005)", border: "1px dashed var(--border-glass)", borderRadius: "10px" }}>
                              No deliverables submitted yet. Upload a file or paste a link using the form above!
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "14px", marginTop: "14px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                Created: {new Date(selectedTask.fields.created).toLocaleDateString()}
              </span>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setModalTab("overview");
                }}
                className="btn-primary"
                style={{ padding: "8px 18px" }}
              >
                Done Editing
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📧 MODAL 3: INTERACTIVE EMAIL ALERT COMPOSER */}
      {isEmailOpen && (
        <div style={modalBackdropStyle}>
          <div className="glass-panel" style={{
            width: "550px",
            padding: "30px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            position: "relative",
            overflow: "hidden",
            animation: "slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            
            {/* Outgoing animation overlay */}
            {isSendingEmail && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(7, 9, 14, 0.95)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
                gap: "24px"
              }}>
                <div style={{ position: "relative", width: "120px", height: "100px" }}>
                  {/* Envelope Base */}
                  <div style={{
                    width: "80px",
                    height: "50px",
                    border: "2.5px solid var(--primary)",
                    borderRadius: "4px",
                    position: "absolute",
                    bottom: "10px",
                    left: "20px",
                    background: "rgba(99, 102, 241, 0.1)",
                    animation: "envelopeSlide 2.2s infinite ease-in-out"
                  }}>
                    {/* Flap */}
                    <div style={{
                      width: "0",
                      height: "0",
                      borderLeft: "37px solid transparent",
                      borderRight: "37px solid transparent",
                      borderTop: "24px solid var(--primary)",
                      position: "absolute",
                      top: 0,
                      left: "1.5px"
                    }}></div>
                  </div>

                  {/* Letter sliding in */}
                  <div style={{
                    width: "60px",
                    height: "40px",
                    background: "white",
                    borderRadius: "2px",
                    position: "absolute",
                    left: "30px",
                    top: "10px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                    animation: "paperInsert 2.2s infinite ease-in-out"
                  }}>
                    <div style={{ width: "40px", height: "3px", background: "#cbd5e1", margin: "8px auto 0" }}></div>
                    <div style={{ width: "40px", height: "3px", background: "#cbd5e1", margin: "4px auto 0" }}></div>
                    <div style={{ width: "30px", height: "3px", background: "#e2e8f0", margin: "4px auto 0" }}></div>
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700" }}>
                    {emailAnimationState === "sending" ? "Relaying via Secure SMTP Gateway..." : "Assembling envelope payload..."}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px" }}>
                    Relaying request to active Express server...
                  </p>
                </div>
              </div>
            )}

            {/* Email Header info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaEnvelope color="var(--accent)" />
                <span>Send Deadline Warning Email</span>
              </h2>
              <button
                onClick={() => setIsEmailOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleSendReminderEmail} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={modalLabelStyle}>To (Assignee Email)</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label style={modalLabelStyle}>Subject Header</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div>
                <label style={modalLabelStyle}>Formatted Message Template</label>
                <textarea
                  required
                  className="form-input"
                  style={{ minHeight: "180px", fontSize: "13px", lineHeight: "1.6", fontFamily: "var(--mono)" }}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setIsEmailOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ background: "#ef4444", color: "white" }}
                >
                  <FaPaperPlane size={12} />
                  <span>Dispatch Email</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 🚀 MODAL 4: AUTOMATED PROJECT ASSIGNMENT & PROVISIONING */}
      {isAssignModalOpen && selectedAssignProject && (
        <div style={modalBackdropStyle}>
          <div className="glass-panel" style={{
            width: "550px",
            padding: "30px",
            border: "1.5px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            position: "relative",
            overflow: "hidden",
            animation: "slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            
            {/* Automatic Provisioning Animation Overlay */}
            {isProvisioning && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(3, 7, 18, 0.96)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
                gap: "24px"
              }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  border: "4px solid rgba(45, 212, 191, 0.1)",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                }} className="pulse-glow"></div>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Automating Campus Provisioning...
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px", maxWidth: "340px", lineHeight: "1.6" }}>
                    Calling Live Atlassian Jira Cloud REST APIs, generating standard workstreams, and provisioning Epics & Child Tasks...
                  </p>
                </div>
              </div>
            )}

            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "19px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Allocate Sponsor Project</span>
                </h2>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Assigning <strong>{selectedAssignProject.title}</strong> by <strong>{selectedAssignProject.company}</strong>
                </span>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignProject} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Target Campus Selector */}
              <div>
                <label style={modalLabelStyle}>Target Institution Campus *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}>
                  {(spokesList.length > 0 ? spokesList : Object.entries(dynamicSpokes).map(([id, s]) => ({ id, ...s }))).map(campus => (
                    <label key={campus.id} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13.5px", color: "var(--text-main)", userSelect: "none" }}>
                      <input
                        type="checkbox"
                        checked={assignTargetCampus.includes(campus.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignTargetCampus([...assignTargetCampus, campus.id]);
                          } else {
                            setAssignTargetCampus(assignTargetCampus.filter(id => id !== campus.id));
                          }
                        }}
                        style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--primary)" }}
                      />
                      {campus.name}
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "8px", lineHeight: "1.4" }}>
                  All Spoke campuses are 100% active and connected directly to their backing Agile boards in your Atlassian Jira Cloud instance.
                </p>
              </div>

              {/* Target Due Date Picker */}
              <div>
                <label style={modalLabelStyle}>Project Target Due Date *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", height: "42px", fontSize: "14px", colorScheme: theme === "dark" ? "dark" : "light" }}
                />
                <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "6px", lineHeight: "1.4" }}>
                  This date represents the final FIP delivery deadline. The system will automatically compute and provision intermediate milestones for Phase 1 (30% of duration), Phase 2 (60%), and Phase 3 (100%).
                </p>
              </div>

              {/* FIP Workstreams Editor */}
              <div className="glass-panel" style={{ padding: "16px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                <h4 style={{ fontSize: "11.5px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                  Customize Project Phases / Workstreams
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {allocationPhases.map((phase, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "12px", minWidth: "18px" }}>{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder={`Phase ${idx + 1} Name`}
                        value={phase.name}
                        onChange={(e) => {
                          const updated = [...allocationPhases];
                          updated[idx].name = e.target.value;
                          setAllocationPhases(updated);
                        }}
                        style={{
                          flex: 1,
                          padding: "8px 10px",
                          borderRadius: "6px",
                          background: "var(--bg-input)",
                          border: "1px solid var(--border-glass)",
                          color: "var(--text-main)",
                          outline: "none",
                          fontSize: "12px"
                        }}
                        required
                      />
                      {allocationPhases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setAllocationPhases(allocationPhases.filter((_, i) => i !== idx));
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                          title="Remove Phase"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAllocationPhases([...allocationPhases, { name: "", description: "" }])}
                    style={{
                      alignSelf: "flex-start",
                      padding: "4px 8px",
                      background: "rgba(99, 102, 241, 0.08)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      borderRadius: "6px",
                      color: "var(--primary)",
                      fontSize: "10.5px",
                      fontWeight: "750",
                      cursor: "pointer",
                      marginTop: "4px"
                    }}
                  >
                    + Add Additional Phase
                  </button>
                </div>
              </div>

              {/* Dialog Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px", borderTop: "1px solid var(--border-glass)", paddingTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: "8px 18px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: "8px 20px",
                    background: "var(--accent)",
                    borderColor: "transparent",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
                  }}
                >
                  Automate Provisioning
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* INGEST PROJECT PROPOSAL MODAL */}
      {isIngestOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.25s ease"
        }}>
          <div className="glass-panel" style={{
            width: "500px",
            padding: "32px",
            position: "relative",
            background: "var(--bg-card)",
            border: "1px solid var(--border-glass)",
            borderRadius: "12px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>
              Ingest New Proposal
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "24px" }}>
              Manually ingest a new program proposal into the Central Project Intake pool.
            </p>

            <form onSubmit={handleIngestProjectSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Company / Partner Sponsor</label>
                <select
                  className="form-select"
                  value={ingestCompany}
                  onChange={(e) => setIngestCompany(e.target.value)}
                  style={{ width: "100%", height: "38px" }}
                >
                  <option value="Company 1">Company 1</option>
                  <option value="Company 2">Company 2</option>
                  <option value="Company 3">Company 3</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Project Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Edge AI Smart Agriculture System"
                  value={ingestTitle}
                  onChange={(e) => setIngestTitle(e.target.value)}
                  required
                  style={{ padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Project Description</label>
                <textarea
                  className="form-input"
                  placeholder="Detailed scope and deliverables of the company sponsorship program..."
                  value={ingestDescription}
                  onChange={(e) => setIngestDescription(e.target.value)}
                  required
                  rows={3}
                  style={{ padding: "8px 12px", fontSize: "13px", resize: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Duration</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 6 Months"
                  value={ingestDuration}
                  onChange={(e) => setIngestDuration(e.target.value)}
                  required
                  style={{ padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Proposed Target Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={ingestDueDate}
                  onChange={(e) => setIngestDueDate(e.target.value)}
                  required
                  style={{ padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsIngestOpen(false)}
                  className="btn-secondary"
                  style={{ padding: "8px 18px" }}
                  disabled={isIngesting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: "8px 20px",
                    background: "#ef4444",
                    borderColor: "transparent",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
                  }}
                  disabled={isIngesting}
                >
                  {isIngesting ? "Ingesting..." : "Confirm Ingest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROJECT PROPOSAL MODAL */}
      {editingProject && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.25s ease"
        }}>
          <div className="glass-panel" style={{
            width: "500px",
            padding: "32px",
            position: "relative",
            background: "var(--bg-card)",
            border: "1px solid var(--border-glass)",
            borderRadius: "12px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>
              Edit Project
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "24px" }}>
              Update the specifications and schedule parameters of the active project contract.
            </p>

            <form onSubmit={handleUpdateProjectSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Company / Partner Sponsor</label>
                <select
                  className="form-select"
                  value={editCompany}
                  disabled
                  onChange={(e) => setEditCompany(e.target.value)}
                  style={{ width: "100%", height: "38px", opacity: 0.6, cursor: "not-allowed" }}
                >
                  <option value="Company 1">Company 1</option>
                  <option value="Company 2">Company 2</option>
                  <option value="Company 3">Company 3</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Project Title (Immutable)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Edge AI Smart Agriculture System"
                  value={editTitle}
                  disabled
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  style={{ padding: "8px 12px", fontSize: "13px", opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Project Description</label>
                <textarea
                  className="form-input"
                  placeholder="Detailed scope and deliverables of the company sponsorship program..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  rows={3}
                  style={{ padding: "8px 12px", fontSize: "13px", resize: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Duration</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 6 Months"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  required
                  style={{ padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Proposed Target Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  required
                  style={{ padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="btn-secondary"
                  style={{ padding: "8px 18px" }}
                  disabled={isUpdatingProject}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: "8px 20px",
                    background: "#ef4444",
                    borderColor: "transparent",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
                  }}
                  disabled={isUpdatingProject}
                >
                  {isUpdatingProject ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SYSTEM SETTINGS MODAL */}
      {showSettingsModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.25s ease"
        }}>
          <div className="glass-panel" style={{
            width: "500px",
            padding: "32px",
            position: "relative",
            background: "var(--bg-card)",
            border: "1px solid var(--border-glass)",
            borderRadius: "12px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>
              Platform System Settings
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "24px" }}>
              Configure Atlassian Jira credentials, SMTP gateway settings, and manage cache.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxHeight: "450px", overflowY: "auto", paddingRight: "4px" }}>
              {/* Jira section */}
              <div>
                <h4 style={{ fontSize: "12px", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                  Atlassian Jira Credentials
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>JIRA Cloud Domain</label>
                    <input type="text" className="form-input" value="https://manasa-kle-apnileap.atlassian.net" disabled style={{ padding: "8px 12px", fontSize: "12.5px", opacity: 0.7 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Auth Email Address</label>
                    <input type="text" className="form-input" value={currentUser?.email || "admin@apnileap.com"} disabled style={{ padding: "8px 12px", fontSize: "12.5px", opacity: 0.7 }} />
                  </div>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)" }} />

              {/* SMTP section */}
              <div>
                <h4 style={{ fontSize: "12px", fontWeight: "800", color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                  SMTP Relay Gateway
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>SMTP Host</label>
                    <input type="text" className="form-input" placeholder="smtp.ethereal.email" disabled style={{ padding: "8px 12px", fontSize: "12.5px", opacity: 0.7 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "6px" }}>Port</label>
                    <input type="text" className="form-input" placeholder="587" disabled style={{ padding: "8px 12px", fontSize: "12.5px", opacity: 0.7 }} />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                    Ethereal Test SMTP Gateway auto-provisions in sandbox mode when custom fields are empty.
                  </span>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)" }} />

              {/* Performance / Cache Section */}
              <div>
                <h4 style={{ fontSize: "12px", fontWeight: "800", color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                  Performance & Cache Control
                </h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-subtle)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--text-main)" }}>Server Memory Cache</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Expires task updates in 30 seconds automatically</div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("http://localhost:5001/cache/clear", { method: "POST" });
                        const data = await res.json();
                        if (data.success) {
                          triggerToast("Server cache successfully purged!");
                        }
                      } catch {
                        triggerToast("Cache cleared locally!");
                      }
                    }}
                    className="btn-primary"
                    style={{
                      background: "#dc2626",
                      border: "none",
                      padding: "8px 14px",
                      fontSize: "12px",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.15)",
                      cursor: "pointer"
                    }}
                  >
                    Purge Cache
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "28px" }}>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="btn-secondary"
                style={{ padding: "10px 22px", borderRadius: "8px", cursor: "pointer" }}
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COHORT TEAM CHAT DRAWER */}
      {showChatDrawer && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "380px",
          height: "100vh",
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border-glass)",
          boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 999,
          animation: "slideInLeft 0.3s ease"
        }}>
          {/* Drawer Header */}
          <div style={{
            padding: "24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                FIP Cohort Live Chat
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Inter-campus student & mentor collaboration
              </span>
            </div>
            <button
              onClick={() => setShowChatDrawer(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                color: "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              ×
            </button>
          </div>

          {/* Chat Messages List */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            {chatMessages.map(msg => {
              const myName = sessionUser ? `${sessionUser.displayName} (${sessionUser.campusName || "Hub"})` : "Moderator";
              const isMe = msg.sender === "You" || msg.sender === myName;
              return (
                <div key={msg.id} style={{
                  alignSelf: isMe ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start"
                }}>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-dim)", marginBottom: "4px" }}>
                    {msg.sender}
                  </span>
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: isMe ? "12px 12px 0 12px" : "12px 12px 12px 0",
                    background: isMe ? "var(--primary)" : "var(--bg-subtle)",
                    border: isMe ? "none" : "1px solid var(--border-subtle)",
                    color: isMe ? "#ffffff" : "var(--text-main)",
                    fontSize: "12.5px",
                    lineHeight: "1.4",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.01)"
                  }}>
                    {msg.message}
                  </div>
                  <span style={{ fontSize: "9px", color: "var(--text-dim)", marginTop: "4px" }}>
                    {msg.time}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chat Input Footer */}
          <div style={{
            padding: "20px 24px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            background: "var(--bg-subtle)"
          }}>
            <input
              type="text"
              className="form-input"
              value={newChatMessage}
              onChange={(e) => setNewChatMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: "8px 12px", fontSize: "12.5px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newChatMessage.trim()) {
                  handleSendChatMessage();
                }
              }}
            />
            <button
              onClick={handleSendChatMessage}
              className="btn-primary"
              style={{ padding: "8px 14px", fontSize: "12px", border: "none", cursor: "pointer", borderRadius: "6px" }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ACADEMIC COHORTS/GRADUATION MODAL */}
      {showCohortModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.25s ease"
        }}>
          <div className="glass-panel" style={{
            width: "600px",
            padding: "32px",
            position: "relative",
            background: "var(--bg-card)",
            border: "1px solid var(--border-glass)",
            borderRadius: "12px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>
              FIP Campus Cohort Academic Progress
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "24px" }}>
              Overview of student cohorts, faculty mentors, and academic progress across all active campuses.
            </p>

            {/* Real-time Cohort Table */}
            <CohortStatsTable />


            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "28px" }}>
              <button
                onClick={() => setShowCohortModal(false)}
                className="btn-secondary"
                style={{ padding: "10px 22px", borderRadius: "8px", cursor: "pointer" }}
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIGN OUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div style={modalBackdropStyle}>
          <div className="glass-panel pulse-glow" style={{
            width: "400px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-glass)",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            color: "var(--text-main)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                padding: "12px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FaSignOutAlt size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "var(--text-main)" }}>Sign Out Confirmation</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                  Are you sure you want to end your active session and sign out of ApniLeap?
                </p>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "10px" }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="btn-secondary"
                style={{ padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
                className="btn-primary"
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "700",
                  background: "#ef4444",
                  borderColor: "#ef4444",
                  color: "#ffffff"
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      {isAuthenticated && viewMode === "dashboard" && (
        <RovoAgentWidget 
          sessionUser={sessionUser} 
          currentBoardId={currentBoardId} 
          activeWorkspace={activeWorkspace} 
        />
      )}
    </div>
  );
}

// 📌 CUSTOM HIGH-FIDELITY LIGHT-THEME TOOLTIP
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const name = data.name || "";
    const value = payload[0].value;
    const dataKey = payload[0].name || payload[0].dataKey;
    
    let displayValue = `${value}`;
    if (dataKey === "completionRate" || dataKey === "Completion Rate") {
      displayValue = `${value}%`;
    }
    
    return (
      <div style={{
        background: "#ffffff",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.06)",
        pointerEvents: "none"
      }}>
        <p style={{ margin: 0, fontWeight: "700", color: "var(--text-main)", fontSize: "13px" }}>
          {name}
        </p>
        <p style={{ margin: "4px 0 0", color: "var(--primary)", fontWeight: "850", fontSize: "14px" }}>
          {payload[0].name || "Value"}: {displayValue}
        </p>
        {data.total !== undefined && (
          <p style={{ margin: "2px 0 0", color: "var(--text-dim)", fontSize: "11px", fontWeight: "500" }}>
            Tasks Done: {data.done} / {data.total}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// 📌 SIDEBAR NAV ITEM HELPER
function SidebarNavItem({ active, icon, label, collapsed, onClick, variant = "primary" }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 18px",
        borderRadius: active ? "6px 0 0 6px" : "6px",
        cursor: "pointer",
        background: active ? (variant === "accent" ? "#ef4444" : "var(--sidebar-active-bg)") : "transparent",
        color: active ? (variant === "accent" ? "#ffffff" : "var(--sidebar-text-active)") : "var(--sidebar-text)",
        border: "none",
        transition: "var(--transition-smooth)",
        justifyContent: collapsed ? "center" : "flex-start",
        marginRight: active ? "0px" : "16px",
        fontWeight: active ? "700" : "500",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "var(--sidebar-hover-bg)";
          e.currentTarget.style.color = "var(--sidebar-text-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--sidebar-text)";
        }
      }}
    >
      <span style={{ display: "flex", alignItems: "center", color: "inherit", fontSize: "16px" }}>
        {icon}
      </span>
      {!collapsed && (
        <span style={{ fontSize: "13.5px", letterSpacing: "0.2px" }}>
          {label}
        </span>
      )}
    </div>
  );
}

// 📌 DASHBOARD METRIC CARD
function DashboardCard({ title, value, subtitle, themeColor, pulse, glow, progress, alert }) {
  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        position: "relative",
        overflow: "hidden",
        borderRadius: "8px",
        background: "var(--bg-card)",
        border: alert ? "1px solid rgba(255, 140, 0, 0.2)" : "1px solid rgba(0, 0, 0, 0.04)",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.01)",
        transition: "var(--transition-smooth)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 20px 40px -15px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.01)";
      }}
    >
      {/* Absolute Glow Background */}
      {glow && (
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "var(--primary)",
          filter: "blur(40px)",
          opacity: 0.1,
          pointerEvents: "none"
        }}></div>
      )}

      {alert && (
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "var(--accent)",
          filter: "blur(40px)",
          opacity: 0.1,
          pointerEvents: "none"
        }}></div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </span>
        {pulse && (
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: alert ? "var(--accent)" : "var(--primary)",
            display: "inline-block"
          }} className="pulse-glow"></span>
        )}
      </div>

      <span style={{
        fontSize: "30px",
        fontWeight: "800",
        color: themeColor || "var(--text-main)",
        letterSpacing: "-0.5px",
        lineHeight: "1.1"
      }}>
        {value}
      </span>

      {progress !== undefined ? (
        <div style={{ width: "100%", marginTop: "4px" }}>
          <div style={{ height: "6px", width: "100%", background: "rgba(0, 0, 0, 0.06)", borderRadius: "3px" }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--primary)",
              borderRadius: "3px",
              transition: "width 0.5s ease-out"
            }}></div>
          </div>
        </div>
      ) : (
        <span style={{ color: "var(--text-dim)", fontSize: "11px", fontWeight: "500" }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

// 📌 COLUMNS HEADER FOR KANBAN
function ColumnHeader({ title, count, color, bgColor, pulse }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: "10px",
      borderBottom: "1px solid rgba(255,255,255,0.06)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {pulse && (
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "var(--primary)",
            display: "inline-block"
          }} className="pulse-glow"></span>
        )}
        <span style={{ fontWeight: "700", fontSize: "15px", letterSpacing: "0.2px" }}>
          {title === "To Do" ? <FaInbox style={{ marginRight: "6px", verticalAlign: "middle" }} /> : title === "In Progress" ? <FaHourglassHalf style={{ marginRight: "6px", verticalAlign: "middle" }} /> : title === "Done" ? <FaCheckCircle style={{ marginRight: "6px", verticalAlign: "middle" }} /> : ""}
          {title}
        </span>
      </div>

      <span style={{
        background: bgColor || "rgba(255,255,255,0.04)",
        color: color || "var(--text-muted)",
        fontSize: "12px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "20px"
      }}>
        {count}
      </span>
    </div>
  );
}

function DraggableCard({ task, index, onClick }) {
  const deadline = getDeadlineInfo(task.fields.dueDate, task.fields.status?.name);
  const sponsor = getSponsorCompany(task);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`${snapshot.isDragging ? "kanban-card-dragging" : ""} ${task.fields.flagged ? "kanban-card-blocked" : ""}`}
          style={{
            padding: "16px",
            cursor: "grab",
            borderRadius: "6px",
            background: snapshot.isDragging ? "rgba(59, 82, 154, 0.05)" : "var(--bg-card)",
            border: snapshot.isDragging ? "1.5px solid var(--primary)" : "1px solid var(--border-subtle)",
            boxShadow: snapshot.isDragging ? "0 10px 25px rgba(15, 23, 42, 0.08)" : "0 4px 10px rgba(0, 0, 0, 0.015)",
            transition: "var(--transition-smooth)",
            ...provided.draggableProps.style
          }}
        >
          {/* Card Header: Key and Deadline Badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "var(--primary)",
                background: "rgba(59, 82, 154, 0.08)",
                padding: "2px 6px",
                borderRadius: "4px"
              }}>
                {task.key}
              </span>
              {sponsor && (
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  title={`${sponsor.name} Sponsor`}
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    objectFit: "contain",
                    background: "white",
                    padding: "1px",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                />
              )}
              {task.fields.issueType && (
                <span style={{
                  fontSize: "10px",
                  fontWeight: "750",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  backgroundColor:
                    task.fields.issueType === "Epic" ? "rgba(139, 92, 246, 0.12)" :
                    task.fields.issueType === "Bug" ? "rgba(239, 68, 68, 0.12)" :
                    task.fields.issueType === "Story" ? "rgba(16, 185, 129, 0.12)" : "rgba(59, 130, 246, 0.12)",
                  color:
                    task.fields.issueType === "Epic" ? "#7c3aed" :
                    task.fields.issueType === "Bug" ? "#dc2626" :
                    task.fields.issueType === "Story" ? "#059669" : "#2563eb",
                  border: "1px solid",
                  borderColor:
                    task.fields.issueType === "Epic" ? "rgba(139, 92, 246, 0.25)" :
                    task.fields.issueType === "Bug" ? "rgba(239, 68, 68, 0.25)" :
                    task.fields.issueType === "Story" ? "rgba(16, 185, 129, 0.25)" : "rgba(59, 130, 246, 0.25)"
                }}>
                  {task.fields.issueType === "Epic" ? "Epic" :
                   task.fields.issueType === "Bug" ? "Bug" :
                   task.fields.issueType === "Story" ? "Story" : "Task"}
                </span>
              )}
              {task.fields.flagged && (
                <span className="pulse-glow" style={{
                  fontSize: "9px",
                  fontWeight: "800",
                  color: "var(--accent)",
                  background: "rgba(251, 146, 60, 0.15)",
                  border: "1px solid var(--accent)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  letterSpacing: "0.2px"
                }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><FaExclamationTriangle style={{ color: "#ef4444" }} /> Blocked</span>
                </span>
              )}
            </div>

            {deadline && (
              <span className={deadline.type === "overdue" ? "overdue-badge-blink" : ""} style={{
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 6px",
                borderRadius: "4px",
                backgroundColor:
                  deadline.type === "overdue" ? "var(--priority-high-bg)" :
                  deadline.type === "soon" ? "var(--priority-medium-bg)" : "rgba(0, 0, 0, 0.04)",
                color:
                  deadline.type === "overdue" ? "var(--priority-high-text)" :
                  deadline.type === "soon" ? "var(--priority-medium-text)" : "var(--text-muted)",
                border: "1px solid",
                borderColor:
                  deadline.type === "overdue" ? "var(--priority-high-border)" :
                  deadline.type === "soon" ? "var(--priority-medium-border)" : "rgba(0, 0, 0, 0.05)",
              }}>
                {deadline.text}
              </span>
            )}
          </div>

          {/* Parent Project Summary Folder Badge */}
          {task.fields.parent && (
            <div style={{
              fontSize: "11px",
              fontWeight: "750",
              color: sponsor ? (sponsor.name === "NVIDIA" ? "#76b900" : sponsor.name === "Intel" ? "#0068b5" : "#4285f4") : "var(--primary)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <span><FaFolderOpen /></span>
              <span>{task.fields.parent.summary}</span>
            </div>
          )}

          {/* Card Title/Summary */}
          <p style={{
            fontSize: "13.5px",
            fontWeight: "600",
            lineHeight: "1.4",
            color: "var(--text-main)",
            marginBottom: "12px",
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {task.fields.summary}
          </p>

          {/* Time Tracking Estimation progress meter */}
          {task.fields.timetracking && task.fields.timetracking.originalEstimateSeconds > 0 && (
            <div style={{ marginBottom: "12px", background: "var(--bg-subtle)", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", fontSize: "10px", color: "var(--text-muted)" }}>
                <span>Spent: {task.fields.timetracking.timeSpent || "0h"}</span>
                <span>Est: {task.fields.timetracking.originalEstimate}</span>
              </div>
              <div style={{ height: "4px", width: "100%", background: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(100, Math.round((task.fields.timetracking.timeSpentSeconds / task.fields.timetracking.originalEstimateSeconds) * 100))}%`,
                  background: "var(--primary)",
                  borderRadius: "2px"
                }}></div>
              </div>
            </div>
          )}

          {/* Card Footer: Assignee & Checklist trackers */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "12px",
            borderTop: "1px solid var(--border-subtle)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Badge priority={task.fields.priority?.name} />
              
              {task.fields.subtasks && task.fields.subtasks.length > 0 && (
                <span style={{
                  fontSize: "10.5px",
                  fontWeight: "700",
                  color: "var(--text-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }} title="Subtask checklist completion">
                  <span><FaCheckSquare style={{ marginRight: "4px", verticalAlign: "middle" }} /> {task.fields.subtasks.filter(s => s.statusName === "Done").length}/{task.fields.subtasks.length}</span>
                </span>
              )}
            </div>

            {task.fields.assignee ? (
              <img
                src={task.fields.assignee.avatarUrl}
                alt={task.fields.assignee.displayName}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  border: "1.5px solid rgba(255,255,255,0.1)"
                }}
                title={`Assigned to ${task.fields.assignee.displayName}`}
              />
            ) : (
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  border: "1px dashed var(--text-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-dim)",
                  fontSize: "10px"
                }}
                title="Unassigned"
              >
                ?
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

// 📌 STATUS AND PRIORITY BADGES
function Badge({ status, priority }) {
  if (status) {
    const isDone = status === "Done";
    const isProgress = status === "In Progress";
    
    return (
      <span style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "20px",
        backgroundColor:
          isDone ? "var(--status-done-bg)" :
          isProgress ? "var(--status-progress-bg)" : "var(--status-backlog-bg)",
        color:
          isDone ? "var(--status-done-text)" :
          isProgress ? "var(--status-progress-text)" : "var(--status-backlog-text)",
        border: "1px solid",
        borderColor:
          isDone ? "var(--status-done-border)" :
          isProgress ? "var(--status-progress-border)" : "var(--status-backlog-border)",
      }}>
        {status}
      </span>
    );
  }

  if (priority) {
    const isHigh = priority === "High";
    const isMedium = priority === "Medium";
    
    return (
      <span style={{
        fontSize: "10px",
        fontWeight: "700",
        padding: "2px 6px",
        borderRadius: "4px",
        backgroundColor:
          isHigh ? "var(--priority-high-bg)" :
          isMedium ? "var(--priority-medium-bg)" : "var(--priority-low-bg)",
        color:
          isHigh ? "var(--priority-high-text)" :
          isMedium ? "var(--priority-medium-text)" : "var(--priority-low-text)",
        border: "1px solid",
        borderColor:
          isHigh ? "var(--priority-high-border)" :
          isMedium ? "var(--priority-medium-border)" : "var(--priority-low-border)",
      }}>
        {priority}
      </span>
    );
  }

  return null;
}

// 📌 EMPTY STATE VIEW
function EmptyStateMessage({ text, showIcon }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px",
      textAlign: "center",
      height: "100%",
      gap: "12px"
    }}>
      {showIcon && <FaRegLightbulb size={36} color="var(--text-dim)" />}
      <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "320px", lineHeight: "1.5" }}>
        {text}
      </p>
    </div>
  );
}

// Inline constant styles
const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(3, 7, 18, 0.7)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modalLabelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "var(--text-muted)",
  marginBottom: "8px"
};

// ==========================================
// APNILEAP EXECUTIVE HUB COMPONENTS
// ==========================================
function HubDashboardView({ metrics, loading, onRefresh, onIngestClick, triggerToast, currentPersona }) {
  const [activeTab, setActiveTab] = useState("campus"); // "campus" or "b2b"
  const [selectedProject, setSelectedProject] = useState(null);

  if (loading || !metrics) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", gap: "16px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(45, 212, 191, 0.1)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
        }} className="pulse-glow"></div>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Aggregating cross-college portfolio metrics...</p>
      </div>
    );
  }

  const totalIssues = metrics.spokes.reduce((sum, s) => sum + s.total, 0);
  const totalDone = metrics.spokes.reduce((sum, s) => sum + s.done, 0);
  const globalCompletionRate = totalIssues > 0 ? Math.round((totalDone / totalIssues) * 100) : 0;
  const totalBlockers = metrics.blockers.length;

  // Stats calculations
  const b2bList = metrics.b2bProjects || [];
  const activeB2BPlacements = b2bList.reduce((sum, p) => {
    return sum + (p.allocations ? p.allocations.filter(a => a.status === "Active").length : 0);
  }, 0);
  const proposedB2BPlacements = b2bList.reduce((sum, p) => {
    return sum + (p.allocations ? p.allocations.filter(a => a.status === "Proposed").length : 0);
  }, 0);

  // Calculate average progress percent across active placements
  let totalAllocPct = 0;
  let totalAllocCount = 0;
  b2bList.forEach(p => {
    if (p.allocations) {
      p.allocations.forEach(a => {
        if (a.status === "Active") {
          totalAllocPct += a.progressPercent || 0;
          totalAllocCount++;
        }
      });
    }
  });
  const avgB2BProgress = totalAllocCount > 0 ? Math.round(totalAllocPct / totalAllocCount) : 0;

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      
      {/* Title & Header Block */}
      <div className="glass-panel" style={{
        padding: "24px",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(45, 212, 191, 0.02))",
        border: "1px solid var(--border-glass)",
        borderRadius: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
            Global Executive Portfolio & Agile Hub
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Oversee multi-tenant academic deliverables, critical spoke escalations, and sponsorship allocations.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={async () => {
              try {
                if (triggerToast) triggerToast("☀️ Triggering Morning Campus Portfolio Digest...");
                const res = await axios.post("http://localhost:5001/api/automation/trigger-digest");
                if (res && res.data && res.data.success && triggerToast) {
                  triggerToast(`📧 Morning Digest dispatched via SMTP/SMS! (${res.data.stats.activeProjects} active projects)`);
                }
              } catch (err) {
                if (triggerToast) triggerToast("Failed to trigger Morning Digest.", "error");
              }
            }}
            style={{
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "750",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
            }}
          >
            <span>☀️ Dispatch Morning Digest</span>
          </button>
          <button
            onClick={() => {
              onRefresh();
              if (triggerToast) triggerToast("Switched Workspace: Live Syncing Portfolio Data...");
            }}
            className="btn-secondary"
            style={{ padding: "8px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            Sync Hub
          </button>
          <span style={{
            fontSize: "11px",
            fontWeight: "800",
            background: "var(--primary-glow)",
            color: "var(--primary)",
            padding: "4px 12px",
            borderRadius: "20px",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            textTransform: "uppercase"
          }}>
            Central Administrator View
          </span>
        </div>
      </div>

      {/* Tab Switcher Navigation */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "16px" }}>
        <button
          onClick={() => setActiveTab("campus")}
          style={{
            background: activeTab === "campus" ? "var(--primary-glow)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${activeTab === "campus" ? "var(--primary)" : "var(--border-glass)"}`,
            color: activeTab === "campus" ? "var(--primary)" : "var(--text-muted)",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "800",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span><span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><FaUniversity /> Spoke Institutions Hub</span></span>
        </button>
        <button
          onClick={() => setActiveTab("b2b")}
          style={{
            background: activeTab === "b2b" ? "var(--primary-glow)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${activeTab === "b2b" ? "var(--primary)" : "var(--border-glass)"}`,
            color: activeTab === "b2b" ? "var(--primary)" : "var(--text-muted)",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "800",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span><span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><FaBriefcase /> Sponsorships Portfolio</span></span>
        </button>
      </div>

      {activeTab === "campus" ? (
        <>
          {/* Portfolio Summary KPI Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px"
          }}>
            <DashboardCard
              title="Global Scoped Tasks"
              value={totalIssues}
              subtitle="Across all active spokes"
              glow={true}
            />
            <DashboardCard
              title="Consolidated Completion"
              value={`${globalCompletionRate}%`}
              subtitle="Portfolio progress rate"
              progress={globalCompletionRate}
            />
            <DashboardCard
              title="Active Escalations"
              value={totalBlockers}
              subtitle="Critical cross-college blockers"
              themeColor="var(--priority-high-text)"
              pulse={totalBlockers > 0}
              alert={totalBlockers > 0}
            />
            <DashboardCard
              title="Active Spokes"
              value="4 / 4"
              subtitle="KLE, COEP, MMCOEP, RIT"
              themeColor="var(--primary)"
            />
          </div>

          {/* College Comparison & Active Blockers Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "24px"
          }}>
            {/* Spokes Progress Bar Chart */}
            <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", height: "360px", border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", marginBottom: "16px" }}>
                College Spoke Progress
              </h3>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.spokes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.02)" }} />
                    <Bar dataKey="completionRate" name="Completion Rate" radius={[6, 6, 0, 0]}>
                      {metrics.spokes.map((entry, index) => {
                        const colors = ["#3b529a", "#0ea5e9", "#10b981", "#8b5cf6"];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Blocker Feed Panel */}
            <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", height: "360px", border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--priority-high-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaExclamationTriangle className="pulse-glow" style={{ borderRadius: "50%" }} />
                <span><FaExclamationTriangle style={{ color: "var(--accent)", marginRight: "6px" }} /> Critical Blockers & Escalations</span>
              </h3>
              
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px" }}>
                {metrics.blockers && metrics.blockers.length > 0 ? (
                  metrics.blockers.map(blocker => (
                    <div
                      key={blocker.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: "rgba(239, 68, 68, 0.03)",
                        border: "1px solid rgba(239, 68, 68, 0.15)",
                        borderRadius: "6px",
                        fontSize: "13px",
                        gap: "10px"
                      }}
                      className="pulse-glow"
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "11px", fontWeight: "800", color: "#f87171", background: "rgba(239, 68, 68, 0.1)", padding: "1px 6px", borderRadius: "4px" }}>
                            {blocker.key}
                          </span>
                          <span style={{ fontSize: "10px", color: "var(--text-dim)", fontWeight: "700", textTransform: "uppercase" }}>
                            {blocker.spokeName}
                          </span>
                        </div>
                        <span style={{ color: "var(--text-main)", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {blocker.summary}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", shrink: 0 }}>
                        {blocker.assignee ? (
                          <img
                            src={blocker.assignee.avatarUrl}
                            alt={blocker.assignee.displayName}
                            style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1.5px solid var(--border-glass)" }}
                            title={`Assigned to ${blocker.assignee.displayName}`}
                          />
                        ) : (
                          <span style={{ fontSize: "11px", color: "var(--text-dim)", fontStyle: "italic" }}>Unassigned</span>
                        )}
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                          {blocker.priority}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontStyle: "italic", fontSize: "13px" }}>
                    <span>No cross-college blockers active. Excellent execution!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 15 Standard Workstreams Progress Matrix */}
          <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
              15 Standard Workstreams Matrix
            </h3>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--border-glass)" }}>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", width: "40%" }}>Workstream / Standard Epic</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>KLE Spoke (Live)</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>COEP Spoke</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>MMCOEP Spoke</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>RIT Spoke</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.workstreams.map((ws, idx) => (
                    <tr
                      key={ws.name}
                      style={{
                        borderBottom: "1px solid var(--border-glass)",
                        background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                        transition: "var(--transition-smooth)"
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: "14px 16px", fontWeight: "600", color: "var(--text-main)" }}>
                        <span style={{ marginRight: "10px", color: "var(--primary)" }}>{idx + 1}.</span>
                        {ws.name}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <ProgressBadge pct={ws.KLE} />
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <ProgressBadge pct={ws.COEP} />
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <ProgressBadge pct={ws.MMCOEP} />
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <ProgressBadge pct={ws.RIT} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Specific KPI Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px"
          }}>
            <DashboardCard
              title="Proposals"
              value={b2bList.length}
              subtitle="Ingested sponsor scopes"
              glow={true}
            />
            <DashboardCard
              title="Active Placements"
              value={activeB2BPlacements}
              subtitle={`${proposedB2BPlacements} proposed pending`}
              themeColor="var(--status-progress-text)"
            />
            <DashboardCard
              title="Avg Milestone Progress"
              value={`${avgB2BProgress}%`}
              subtitle="Completion across Spokes"
              progress={avgB2BProgress}
              themeColor="var(--primary)"
            />
          </div>

          {/* 💼 Active Partnerships Tracker */}
          <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px", display: "inline-flex", alignItems: "center" }}><FaBriefcase /></span>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "850", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                  Partnerships & Campus Deployments Ledger
                </h3>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "750", background: "var(--primary-glow)", color: "var(--primary)", border: "1px solid var(--border-glow)", padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase" }}>
                  Multi-Tenant Portfolio Tracking
                </span>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "24px"
            }}>
              {b2bList.map(proj => {
                const activeAllocations = proj.allocations ? proj.allocations.filter(a => a.status === "Active" || a.status === "Proposed") : [];
                return (
                  <div 
                    key={proj.id} 
                    className="table-row-hover" 
                    onClick={() => setSelectedProject(proj)}
                    style={{
                      background: "rgba(255, 255, 255, 0.01)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "8px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)"
                    }}
                  >
                    {/* Card Header: Brand, Title, Duration */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <CompanyLogo company={proj.company} size={38} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {proj.title}
                        </h4>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px", fontSize: "11px", color: "var(--text-dim)" }}>
                          <span>Sponsor: <strong style={{ color: "var(--text-muted)" }}>{proj.company}</strong></span>
                          <span>•</span>
                          <span>Duration: <strong style={{ color: "var(--text-muted)" }}>{proj.duration}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {b2bList.length === 0 && (
                <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "120px", color: "var(--text-muted)", fontStyle: "italic", fontSize: "13px" }}>
                  <span>No sponsorships active in the portfolio yet.</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {/* Project Details Modal */}
      {selectedProject && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div className="fade-in" style={{
            background: "var(--bg-main)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            width: "1000px",
            maxWidth: "95%",
            maxHeight: "90vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
          }}>
            <div style={{ padding: "20px", borderBottom: "1px solid var(--border-glass)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CompanyLogo company={selectedProject.company} size={32} />
                <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-main)" }}>{selectedProject.title}</h3>
              </div>
              <button onClick={() => setSelectedProject(null)} style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", color: "var(--text-muted)", cursor: "pointer", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaTimes size={14} />
              </button>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <strong style={{ color: "var(--text-main)", fontSize: "13px", textTransform: "uppercase" }}>Global Executive Overview</strong>
                <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.5" }}>
                  {selectedProject.description}
                </p>
              </div>

              <div>
                <strong style={{ color: "var(--text-main)", fontSize: "13px", textTransform: "uppercase" }}>Campus Allocations & Working Teams</strong>
                {selectedProject.allocations && selectedProject.allocations.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px", marginTop: "10px" }}>
                    {selectedProject.allocations.map((a, i) => {
                      const alloc = a;
                      const today = new Date("2026-05-26");
                      const due = new Date(alloc.proposedDueDate);
                      const diffTime = due.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      let daysText;
                      let daysClassColor;
                      let daysBgColor;

                      if (diffDays < 0) {
                        daysText = `${Math.abs(diffDays)}d overdue`;
                        daysClassColor = "#ef4444";
                        daysBgColor = "rgba(239, 68, 68, 0.1)";
                      } else if (diffDays === 0) {
                        daysText = "Due Today!";
                        daysClassColor = "var(--accent)";
                        daysBgColor = "rgba(251, 146, 60, 0.15)";
                      } else if (diffDays <= 7) {
                        daysText = `${diffDays}d left`;
                        daysClassColor = "var(--accent)";
                        daysBgColor = "rgba(251, 146, 60, 0.12)";
                      } else {
                        daysText = `${diffDays} days left`;
                        daysClassColor = "var(--primary)";
                        daysBgColor = "var(--primary-glow)";
                      }

                      const isProposed = alloc.status === "Proposed";

                      return (
                        <div key={i} style={{ border: "1px solid var(--border-glass)", borderRadius: "8px", padding: "12px", background: "rgba(255,255,255,0.01)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <strong style={{ color: "var(--primary)", fontSize: "14px" }}>
                              <FaBuilding style={{ marginRight: "6px" }} /> {alloc.assignedTo}
                            </strong>
                            <span style={{
                              fontSize: "10px",
                              padding: "4px 8px",
                              background: isProposed ? "rgba(251, 146, 60, 0.08)" : "rgba(45, 212, 191, 0.08)",
                              color: isProposed ? "var(--accent)" : "#2dd4bf",
                              border: isProposed ? "1px solid rgba(251, 146, 60, 0.2)" : "1px solid rgba(45, 212, 191, 0.2)",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              fontWeight: "800"
                            }}>{alloc.status}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-dim)", display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span><strong>Jira Epic:</strong> <span style={{ fontFamily: "var(--mono)", color: "var(--text-main)" }}>{alloc.assignedKey || "Pending Creation"}</span></span>
                              {!isProposed && (
                                <span style={{
                                  fontWeight: "800",
                                  color: daysClassColor,
                                  background: daysBgColor,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontSize: "10px"
                                }}>{daysText}</span>
                              )}
                            </div>
                            <span><strong>Deadline:</strong> {new Date(alloc.proposedDueDate).toLocaleDateString()}</span>
                            
                            {!isProposed && (
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                                <div style={{ flex: 1, height: "6px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "3px", overflow: "hidden", border: "1px solid var(--border-glass)" }}>
                                  <div style={{
                                    width: `${alloc.progressPercent || 0}%`,
                                    height: "100%",
                                    background: "var(--primary)",
                                    borderRadius: "3px",
                                    boxShadow: "0 0 8px var(--primary)",
                                    transition: "width 0.5s cubic-bezier(0.1, 0.8, 0.1, 1)"
                                  }}></div>
                                </div>
                                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)", fontFamily: "var(--mono)", minWidth: "32px", textAlign: "right" }}>
                                  {alloc.progressPercent || 0}%
                                </span>
                              </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed rgba(255,255,255,0.05)" }}>
                              <div>
                                <span style={{ color: "var(--text-main)", fontSize: "10px", textTransform: "uppercase" }}>Faculty Mentor</span>
                                <div style={{ color: "var(--primary)", fontSize: "11px", fontWeight: "600", marginTop: "2px" }}>
                                  {alloc.facultyMentor?.displayName || alloc.facultyMentor?.name || "Not assigned"}
                                </div>
                              </div>
                              <div>
                                <span style={{ color: "var(--text-main)", fontSize: "10px", textTransform: "uppercase" }}>Sponsor Lead</span>
                                <div style={{ color: "var(--accent)", fontSize: "11px", fontWeight: "600", marginTop: "2px" }}>
                                  {alloc.projectMentor?.displayName || alloc.projectMentor?.name || "Not assigned"}
                                </div>
                              </div>
                            </div>

                            {alloc.teamMembers && alloc.teamMembers.length > 0 && (
                              <div style={{ marginTop: "4px", paddingTop: "8px", borderTop: "1px dashed rgba(255,255,255,0.05)" }}>
                                <strong style={{ color: "var(--text-main)", fontSize: "11px" }}>Team Members:</strong>
                                <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "11px" }}>
                                  {alloc.teamMembers.map(m => m.name || m.displayName).join(", ")}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: "13px", fontStyle: "italic" }}>No campus teams assigned yet.</p>
                )}
              </div>

              {selectedProject.requirements && (
                <div>
                  <strong style={{ color: "var(--text-main)", fontSize: "13px", textTransform: "uppercase" }}>Core Requirements & Scopes</strong>
                  <div style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: "13px", whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px" }}>
                    {selectedProject.requirements}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ProgressBadge({ pct }) {
  let bg = "rgba(45, 212, 191, 0.08)";
  let border = "rgba(45, 212, 191, 0.2)";
  let text = "#2dd4bf";

  if (pct < 40) {
    bg = "rgba(239, 68, 68, 0.08)";
    border = "rgba(239, 68, 68, 0.2)";
    text = "#ef4444";
  } else if (pct < 75) {
    bg = "rgba(251, 146, 60, 0.08)";
    border = "rgba(251, 146, 60, 0.2)";
    text = "#fb923c";
  }

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4px 10px",
      borderRadius: "6px",
      background: bg,
      border: `1px solid ${border}`,
      color: text,
      fontWeight: "700",
      fontSize: "11.5px",
      minWidth: "55px",
      fontFamily: "var(--mono)"
    }}>
      {pct}%
    </div>
  );
}

// ==========================================
// MODERATOR PORTAL COMPONENTS
// ==========================================

function ModeratorDashboardView({
  projects,
  loading,
  onRefresh,
  onAssignClick,
  onIngestClick,
  onEditClick,
  onDeleteClick,
  spokes = [],
  onRefreshSpokes,
  triggerToast,
  activeTab: controlledActiveTab,
  setActiveTab: setControlledActiveTab
}) {
  const [internalActiveTab, setInternalActiveTab] = useState("proposals");
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = setControlledActiveTab || setInternalActiveTab;

  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResults, setAuditResults] = useState(null);

  // Spokes Management State
  const [showAddSpokeModal, setShowAddSpokeModal] = useState(false);
  const [newSpokeName, setNewSpokeName] = useState("");
  const [newSpokeId, setNewSpokeId] = useState("");
  const [newSpokeKey, setNewSpokeKey] = useState("AK");
  const [newSpokeBoardId, setNewSpokeBoardId] = useState("2");
  const [isSubmittingSpoke, setIsSubmittingSpoke] = useState(false);
  const [deletingSpokeId, setDeletingSpokeId] = useState(null);

  const handleAddSpoke = async (e) => {
    e.preventDefault();
    if (!newSpokeName.trim()) {
      if (triggerToast) triggerToast("❌ Campus spoke institution name is required.");
      return;
    }
    setIsSubmittingSpoke(true);
    try {
      const cleanId = newSpokeId.trim() || ("spoke-" + Date.now().toString().slice(-4));
      const res = await axios.post("http://localhost:5001/api/spokes", {
        id: cleanId,
        name: newSpokeName.trim(),
        key: (newSpokeKey || "AK").trim().toUpperCase(),
        boardId: parseInt(newSpokeBoardId) || 2,
        live: true
      });
      if (res.data && res.data.spoke) {
        if (triggerToast) triggerToast("✅ Successfully onboarded partner campus: " + res.data.spoke.name + "!");
        setShowAddSpokeModal(false);
        setNewSpokeName("");
        setNewSpokeId("");
        setNewSpokeKey("AK");
        setNewSpokeBoardId("2");
        if (onRefreshSpokes) onRefreshSpokes();
      }
    } catch (err) {
      if (triggerToast) triggerToast("❌ Failed to onboard spoke: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmittingSpoke(false);
    }
  };

  const handleDeleteSpoke = async (spokeId, spokeName) => {
    if (spokeId === "3") {
      if (triggerToast) triggerToast("⚠️ Anchor campus (KLE Hub) cannot be removed.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete and unlink " + spokeName + " (ID: " + spokeId + ")?")) return;
    setDeletingSpokeId(spokeId);
    try {
      await axios.delete("http://localhost:5001/api/spokes/" + spokeId);
      if (triggerToast) triggerToast("🗑️ Removed partner campus: " + spokeName);
      if (onRefreshSpokes) onRefreshSpokes();
    } catch (err) {
      if (triggerToast) triggerToast("❌ Failed to delete spoke: " + (err.response?.data?.error || err.message));
    } finally {
      setDeletingSpokeId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", gap: "16px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(251, 146, 60, 0.1)",
          borderTopColor: "var(--accent)",
          borderRadius: "50%",
        }} className="pulse-glow"></div>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Synchronizing project ingestion portal...</p>
      </div>
    );
  }

  const totalProjects = projects.length;
  const assignedProjects = projects.filter(p => (p.allocations && p.allocations.length > 0) || p.status === "Proposed" || p.status === "Active" || p.status.includes("BREACHED")).length;
  const pendingProjects = totalProjects - assignedProjects;

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      
      {/* Portfolio Intake KPIs */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px"
      }}>
        <DashboardCard
          title="Total Proposals"
          value={totalProjects}
          subtitle="Direct company submissions"
          glow={true}
        />
        <DashboardCard
          title="Active Allocations"
          value={assignedProjects}
          subtitle="Provisioned to campus workspaces"
          themeColor="var(--status-done-text)"
        />
        <DashboardCard
          title="Pending Moderator Review"
          value={pendingProjects}
          subtitle="Awaiting campus assignment"
          themeColor={pendingProjects > 0 ? "var(--priority-medium-text)" : "var(--text-dim)"}
          pulse={pendingProjects > 0}
        />

      </div>

      {/* Premium Tab Switcher */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "16px" }}>
        <button
          onClick={() => setActiveTab("proposals")}
          style={{
            background: activeTab === "proposals" ? "rgba(99, 102, 241, 0.08)" : "transparent",
            border: "1px solid " + (activeTab === "proposals" ? "var(--primary)" : "var(--border-glass)"),
            color: activeTab === "proposals" ? "var(--text-main)" : "var(--text-muted)",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12.5px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span>Ingested proposals</span>
        </button>
        <button
          onClick={() => setActiveTab("deadlines")}
          style={{
            background: activeTab === "deadlines" ? "rgba(239, 68, 68, 0.08)" : "transparent",
            border: "1px solid " + (activeTab === "deadlines" ? "#ef4444" : "var(--border-glass)"),
            color: activeTab === "deadlines" ? "var(--text-main)" : "var(--text-muted)",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12.5px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span>Deadlines & Alerts</span>
        </button>
        <button
          onClick={() => setActiveTab("spokes")}
          style={{
            background: activeTab === "spokes" ? "rgba(16, 185, 129, 0.08)" : "transparent",
            border: "1px solid " + (activeTab === "spokes" ? "#10b981" : "var(--border-glass)"),
            color: activeTab === "spokes" ? "var(--text-main)" : "var(--text-muted)",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12.5px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FaBuilding size={13} style={{ color: activeTab === "spokes" ? "#10b981" : "inherit" }} />
          <span>Campus Spokes Management ({spokes?.length || 0})</span>
        </button>
      </div>

      {activeTab === "proposals" ? (
        /* Projects Intake Glass Board */
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)" }}>Project Intake Board</h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>Review project scope, and instantly automate provisioning to campus Jira spaces.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={onRefresh} className="btn-secondary" style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaSyncAlt size={12} />
                <span style={{ fontSize: "12px" }}>Refresh Intake</span>
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border-glass)" }}>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", width: "150px" }}>Company / Partner</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700" }}>Project Details</th>

                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", width: "110px", textAlign: "center" }}>Duration</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", width: "150px", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", width: "160px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj, idx) => {
                  const isAssigned = proj.status !== "Pending Assignment";
                  return (
                    <tr
                      key={proj.id}
                      style={{
                        borderBottom: "1px solid var(--border-glass)",
                        background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                        transition: "var(--transition-smooth)"
                      }}
                      className="table-row-hover"
                    >
                      {/* Company Column */}
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <CompanyLogo company={proj.company} size={32} />
                          <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{proj.company}</span>
                        </div>
                      </td>

                      {/* Details Column */}
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontWeight: "700", color: "var(--primary)", fontSize: "14px" }}>{proj.title}</span>
                          <p style={{ color: "var(--text-muted)", fontSize: "12px", lineHeight: "1.5", margin: 0, maxWidth: "450px" }}>{proj.description}</p>
                          {proj.requirements && (
                            <div style={{ marginTop: "6px", fontSize: "11.5px", color: "var(--text-muted)" }}>
                              <strong>Requirements:</strong> <em>{proj.requirements}</em>
                            </div>
                          )}
                          {proj.phases && proj.phases.length > 0 && (
                            <div style={{ marginTop: "6px" }}>
                              <span style={{ fontSize: "10.5px", fontWeight: "750", color: "var(--text-dim)", display: "block", textTransform: "uppercase" }}>Phases:</span>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                                {proj.phases.map((ph, idx) => (
                                  <div key={idx} style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                    <strong>{ph.name}</strong> {ph.description && `- ${ph.description}`}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Duration Column */}
                      <td style={{ padding: "16px", textAlign: "center", color: "var(--text-main)", fontWeight: "500" }}>
                        {proj.duration}
                      </td>

                      {/* Status Column */}
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "700",
                          background: proj.status.includes("BREACHED")
                            ? "rgba(239, 68, 68, 0.08)"
                            : proj.status === "Active"
                            ? "rgba(16, 185, 129, 0.08)"
                            : proj.status === "Proposed"
                            ? "rgba(99, 102, 241, 0.08)"
                            : "rgba(251, 146, 60, 0.08)",
                          border: proj.status.includes("BREACHED")
                            ? "1px solid rgba(239, 68, 68, 0.2)"
                            : proj.status === "Active"
                            ? "1px solid rgba(16, 185, 129, 0.2)"
                            : proj.status === "Proposed"
                            ? "1px solid rgba(99, 102, 241, 0.2)"
                            : "1px solid rgba(251, 146, 60, 0.2)",
                          color: proj.status.includes("BREACHED")
                            ? "#ef4444"
                            : proj.status === "Active"
                            ? "#34d399"
                            : proj.status === "Proposed"
                            ? "#818cf8"
                            : "#fb923c",
                          textTransform: "uppercase"
                        }}>
                          {proj.status.includes("BREACHED")
                            ? "Breached"
                            : proj.status === "Active"
                            ? "Active"
                            : proj.status === "Proposed"
                            ? "Proposed"
                            : "Pending Review"}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          {isAssigned ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                              <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>{proj.assignedTo}</span>
                              <span style={{
                                fontFamily: "var(--mono)",
                                fontSize: "11px",
                                fontWeight: "800",
                                color: proj.assignedKey ? "var(--primary)" : "#818cf8",
                                background: proj.assignedKey ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
                                padding: "2px 6px",
                                borderRadius: "4px"
                              }}>
                                {proj.assignedKey || "Awaiting Acceptance"}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => onAssignClick(proj)}
                              className="btn-primary"
                              style={{
                                padding: "6px 12px",
                                fontSize: "12px",
                                borderRadius: "8px",
                                background: "var(--accent)",
                                borderColor: "transparent",
                                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
                                cursor: "pointer"
                              }}
                            >
                              Assign Project
                            </button>
                          )}
                          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                            <button
                              onClick={() => onEditClick(proj)}
                              style={{
                                background: "rgba(99, 102, 241, 0.08)",
                                border: "1px solid rgba(99, 102, 241, 0.15)",
                                color: "var(--primary)",
                                borderRadius: "6px",
                                padding: "4px 8px",
                                fontSize: "11px",
                                fontWeight: "750",
                                cursor: "pointer",
                                transition: "var(--transition-smooth)"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--primary)";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)";
                                e.currentTarget.style.color = "var(--primary)";
                              }}
                            >
                              <span>Edit <FaSyncAlt style={{ marginLeft: "4px" }} /></span>
                            </button>
                            <button
                              onClick={() => onDeleteClick(proj)}
                              style={{
                                background: "rgba(239, 68, 68, 0.08)",
                                border: "1px solid rgba(239, 68, 68, 0.15)",
                                color: "#ef4444",
                                borderRadius: "6px",
                                padding: "4px 8px",
                                fontSize: "11px",
                                fontWeight: "750",
                                cursor: "pointer",
                                transition: "var(--transition-smooth)"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#ef4444";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                                e.currentTarget.style.color = "#ef4444";
                              }}
                            >
                              <span>Delete <FaTrashAlt style={{ marginLeft: "4px" }} /></span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "deadlines" ? (
        /* Deadlines & Alerts */
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* Auditor Trigger Control Card */}
          <div className="glass-panel" style={{
            padding: "24px",
            background: "linear-gradient(135deg, rgba(31, 41, 55, 0.4), rgba(17, 24, 39, 0.6))",
            border: "1.5px solid rgba(239, 68, 68, 0.15)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ maxWidth: "550px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ef4444", display: "inline-flex", alignItems: "center" }}><FaExclamationTriangle /></span>
                  <span>Automated Deadline Auditor Scanner</span>
                </h3>
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "6px", lineHeight: "1.5" }}>
                  Run a real-time audit across all active campus spoke spaces. The scanner checks the child deliverables progress, identifies breaches, marks project states, and prepares urgent warning email alerts for campus coordinators.
                </p>
              </div>
              <button
                onClick={async () => {
                  setAuditLoading(true);
                  try {
                    const res = await axios.post("http://localhost:5001/moderator/alerts/check");
                    setAuditResults(res.data);
                    onRefresh(); // reload projects to update their statuses
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setAuditLoading(false);
                  }
                }}
                disabled={auditLoading}
                className="btn-primary"
                style={{
                  background: "#ef4444",
                  borderColor: "transparent",
                  color: "white",
                  padding: "10px 24px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "13px",
                  boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer"
                }}
              >
                <FaSyncAlt size={12} className={auditLoading ? "pulse-glow" : ""} />
                <span>{auditLoading ? "Auditing Ecosystem..." : "Execute Auto-Auditor Scanner"}</span>
              </button>
            </div>

            {/* Audit Output terminal panel */}
            {auditResults && (
              <div className="fade-in" style={{ marginTop: "20px" }}>
                <div style={{
                  background: "#07090e",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  fontFamily: "var(--mono)",
                  fontSize: "12px",
                  color: "#34d399",
                  maxHeight: "220px",
                  overflowY: "auto",
                  lineHeight: "1.6"
                }}>
                  <div style={{ color: "#9ca3af", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "6px", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                    <span>AUDITOR CLI TERMINAL</span>
                    <span>SUCCESS</span>
                  </div>
                  <div>[baseline local time: 2026-05-27] Initiating full FIP portfolio audit...</div>
                  <div>Scanning campus spaces KLE (live), COEP (mock), MMCOEP (mock), RIT (mock)...</div>
                  <div style={{ color: "white" }}>&gt;&gt; {auditResults.message}</div>
                  {auditResults.alerts && auditResults.alerts.length > 0 ? (
                    auditResults.alerts.map((al, idx) => (
                      <div key={idx} style={{ marginTop: "8px" }}>
                        <span style={{ color: "#ef4444", fontWeight: "bold" }}>[BREACH DETECTED]</span> Project "{al.title}" assigned to {al.assignedTo} has breached deadline {al.dueDate} by {al.daysOverdue} days!
                        <div style={{ color: "#e0a82e", paddingLeft: "15px" }}>- Deliverables Completion: {al.completionRate}%</div>
                        <div style={{ color: "#8ab4f8", paddingLeft: "15px" }}>- Auto-dispatched prep SMTP warning alert to: coordinator@{al.assignedTo.split(" ")[0].toLowerCase()}.edu</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "#10b981", fontWeight: "bold", marginTop: "8px" }}>[OK] No overdue FIP deadline breaches detected. All campus workspaces on track!</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Allocations Matrix */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", marginBottom: "16px" }}>
              Active Project Allocations Matrix
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--border-glass)" }}>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700" }}>Project Details</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "left" }}>Campus Deployments, Keys, Deadlines & Progress Metrics</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.filter(p => (p.allocations && p.allocations.length > 0) || p.status === "Proposed" || p.status === "Active" || p.status.includes("BREACHED")).map((proj, idx) => {
                    const activeAllocations = proj.allocations || [];
                    return (
                      <tr
                        key={proj.id}
                        style={{
                          borderBottom: "1px solid var(--border-glass)",
                          background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"
                        }}
                      >
                        {/* Project Details */}
                        <td style={{ padding: "16px", verticalAlign: "top" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <CompanyLogo company={proj.company} size={24} />
                            <div>
                              <div style={{ fontWeight: "750", color: "var(--text-main)", fontSize: "13.5px" }}>{proj.title}</div>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Sponsor: <strong>{proj.company}</strong></span>
                            </div>
                          </div>
                        </td>

                        {/* Multi-spoke Institution Allocations */}
                        <td colSpan={4} style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {activeAllocations.length > 0 ? (
                              activeAllocations.map(alloc => {
                                const isProposed = alloc.status === "Proposed";
                                // Calculate days left relative to May 26, 2026
                                const today = new Date("2026-05-26");
                                const due = new Date(alloc.proposedDueDate);
                                const diffTime = due.getTime() - today.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                const isBreached = diffDays < 0;

                                return (
                                  <div key={alloc.targetCampusId} style={{
                                    display: "grid",
                                    gridTemplateColumns: "1.5fr 1fr 1.2fr 1fr 1fr",
                                    alignItems: "center",
                                    gap: "12px",
                                    background: "rgba(255, 255, 255, 0.005)",
                                    border: "1px solid var(--border-glass)",
                                    borderRadius: "8px",
                                    padding: "6px 12px"
                                  }}>
                                    {/* College space name */}
                                    <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "12px" }}>
                                      <span><FaBuilding style={{ marginRight: "6px", color: "var(--primary)" }} /> {alloc.assignedTo}</span>
                                    </div>

                                    {/* JIRA Epic Key */}
                                    <div style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: isProposed ? "var(--text-dim)" : "var(--primary)", fontWeight: "bold" }}>
                                      {alloc.assignedKey || "Awaiting Decision"}
                                    </div>

                                    {/* Target deadline */}
                                    <div style={{ fontSize: "11.5px", color: isBreached ? "#f87171" : "var(--text-muted)", fontWeight: "700" }}>
                                      <span><FaClock style={{ marginRight: "4px", verticalAlign: "middle" }} /> {alloc.proposedDueDate}</span>
                                    </div>

                                    {/* Risk/Alloc Status */}
                                    <div>
                                      <span style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "9.5px",
                                        fontWeight: "800",
                                        background: isBreached 
                                          ? "rgba(239, 68, 68, 0.08)" 
                                          : (isProposed ? "rgba(251, 146, 60, 0.08)" : "rgba(45, 212, 191, 0.08)"),
                                        border: isBreached 
                                          ? "1px solid rgba(239, 68, 68, 0.2)" 
                                          : (isProposed ? "1px solid rgba(251, 146, 60, 0.2)" : "1px solid rgba(45, 212, 191, 0.2)"),
                                        color: isBreached 
                                          ? "#ef4444" 
                                          : (isProposed ? "var(--accent)" : "#2dd4bf"),
                                        textTransform: "uppercase"
                                      }}>
                                        {isBreached ? "BREACHED" : (isProposed ? "PROPOSED" : "ACTIVE")}
                                      </span>
                                    </div>

                                    {/* Actions & Alerts */}
                                    <div style={{ textAlign: "right" }}>
                                      <button
                                        onClick={async () => {
                                          try {
                                            await axios.post("http://localhost:5001/moderator/alerts/check");
                                            alert(`Deadline warning notification dispatched successfully to ${alloc.assignedTo} Coordinator!`);
                                          } catch (err) {
                                            console.error(err);
                                          }
                                        }}
                                        className="btn-secondary"
                                        style={{
                                          padding: "4px 8px",
                                          fontSize: "10.5px",
                                          borderRadius: "5px",
                                          color: isBreached ? "#f87171" : "var(--text-muted)",
                                          borderColor: isBreached ? "rgba(239, 68, 68, 0.3)" : "var(--border-glass)",
                                          cursor: "pointer"
                                        }}
                                      >
                                        Alert Spoke
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <span style={{ fontSize: "12px", color: "var(--text-dim)", fontStyle: "italic", padding: "4px 0" }}>
                                No campus space deployments assigned. Click '+ Allocate Spoke' to begin.
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Assign actions column */}
                        <td style={{ padding: "16px", verticalAlign: "middle", textAlign: "center" }}>
                          <button
                            onClick={() => onAssignClick(proj)}
                            className="btn-primary"
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              borderRadius: "8px",
                              background: "var(--accent)",
                              borderColor: "transparent",
                              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
                              cursor: "pointer"
                            }}
                          >
                            + Allocate Spoke
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {projects.filter(p => (p.allocations && p.allocations.length > 0) || p.status === "Proposed" || p.status === "Active" || p.status.includes("BREACHED")).length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "var(--text-dim)" }}>
                        No active campus allocations found. Go to Ingested Proposals to allocate projects.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Campus Spokes Management Panel */
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "14px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "rgba(16, 185, 129, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#10b981"
                }}>
                  <FaBuilding size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                    Connected Partner Campus Spokes
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
                    Dynamic academic institutions persisted in PostgreSQL database. Manage partner spokes, Jira board IDs, and project keys.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={onRefreshSpokes}
                className="btn-secondary"
                style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px" }}
              >
                <FaSyncAlt size={12} />
                <span>Refresh Spokes</span>
              </button>
              <button
                onClick={() => setShowAddSpokeModal(true)}
                className="btn-primary"
                style={{
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12.5px",
                  background: "#10b981",
                  borderColor: "#10b981",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
                  cursor: "pointer"
                }}
              >
                <Plus size={14} />
                <span>Onboard Campus Spoke</span>
              </button>
            </div>
          </div>

          {/* Spokes Grid / Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--border-glass)" }}>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700" }}>Campus / University</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>Spoke ID</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>Jira Key</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>Board ID</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>Integration Status</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>Network Tier</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: "700", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {spokes && spokes.length > 0 ? (
                  spokes.map((spoke, idx) => {
                    const isHub = spoke.id === "3";
                    return (
                      <tr
                        key={spoke.id}
                        style={{
                          borderBottom: "1px solid var(--border-glass)",
                          background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                          transition: "var(--transition-smooth)"
                        }}
                        className="table-row-hover"
                      >
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              background: isHub ? "rgba(99, 102, 241, 0.15)" : "rgba(16, 185, 129, 0.1)",
                              color: isHub ? "var(--primary)" : "#10b981",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "800",
                              fontSize: "14px",
                              flexShrink: 0
                            }}>
                              <FaGraduationCap size={18} />
                            </div>
                            <div>
                              <div style={{ fontWeight: "750", color: "var(--text-main)", fontSize: "13.5px" }}>
                                {spoke.name}
                              </div>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                {isHub ? "Core Foundation Hub Spoke" : "Satellite Academic Partner"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <span style={{
                            fontFamily: "var(--mono)",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid var(--border-glass)",
                            fontSize: "12px",
                            fontWeight: "700"
                          }}>
                            {spoke.id}
                          </span>
                        </td>

                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <span style={{
                            fontFamily: "var(--mono)",
                            color: "var(--primary)",
                            fontWeight: "800",
                            fontSize: "12px"
                          }}>
                            {spoke.key || "AK"}
                          </span>
                        </td>

                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <span style={{
                            fontFamily: "var(--mono)",
                            color: "var(--text-muted)",
                            fontSize: "12px"
                          }}>
                            #{spoke.boardId || 2}
                          </span>
                        </td>

                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: spoke.live !== false ? "rgba(16, 185, 129, 0.1)" : "rgba(251, 146, 60, 0.1)",
                            color: spoke.live !== false ? "#10b981" : "var(--accent)",
                            border: ("1px solid " + (spoke.live !== false ? "rgba(16, 185, 129, 0.25)" : "rgba(251, 146, 60, 0.25)"))
                          }}>
                            <span style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: spoke.live !== false ? "#10b981" : "var(--accent)"
                            }} className={spoke.live !== false ? "pulse-glow" : ""}></span>
                            {spoke.live !== false ? "Live Jira Synced" : "Mock Space"}
                          </span>
                        </td>

                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <span style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: isHub ? "rgba(99, 102, 241, 0.1)" : "rgba(255,255,255,0.03)",
                            color: isHub ? "var(--primary)" : "var(--text-muted)",
                            border: "1px solid var(--border-glass)"
                          }}>
                            {isHub ? "Anchor Hub" : "Partner Spoke"}
                          </span>
                        </td>

                        <td style={{ padding: "16px", textAlign: "center" }}>
                          {isHub ? (
                            <span style={{ fontSize: "11.5px", color: "var(--text-dim)", fontStyle: "italic" }}>
                              Protected Hub
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDeleteSpoke(spoke.id, spoke.name)}
                              disabled={deletingSpokeId === spoke.id}
                              style={{
                                background: "rgba(239, 68, 68, 0.08)",
                                border: "1px solid rgba(239, 68, 68, 0.25)",
                                color: "#ef4444",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "11.5px",
                                fontWeight: "700",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                              title="Delete this spoke institution and remove from PostgreSQL"
                            >
                              <Trash2 size={12} />
                              <span>{deletingSpokeId === spoke.id ? "Removing..." : "Remove"}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: "30px", textAlign: "center", color: "var(--text-dim)" }}>
                      No partner campus spokes loaded. Click 'Onboard Campus Spoke' to connect a new institution.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onboard Campus Spoke Modal */}
      {showAddSpokeModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          padding: "20px"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "520px",
            width: "100%",
            padding: "28px",
            borderRadius: "16px",
            border: "1px solid var(--border-glass)",
            background: "var(--bg-surface)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <FaBuilding size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                    Onboard Partner Campus Spoke
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                    Connect a new university into the PostgreSQL database
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSpokeModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px"
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSpoke} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
                  University / Spoke Institution Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RV College of Engineering"
                  value={newSpokeName}
                  onChange={(e) => setNewSpokeName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-main)",
                    fontSize: "13.5px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
                    Campus Spoke ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 104 or rvce"
                    value={newSpokeId}
                    onChange={(e) => setNewSpokeId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-main)",
                      fontSize: "13.5px",
                      outline: "none"
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px", display: "block" }}>
                    Unique identifier (e.g. 104)
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
                    Jira Project Key
                  </label>
                  <input
                    type="text"
                    placeholder="AK"
                    value={newSpokeKey}
                    onChange={(e) => setNewSpokeKey(e.target.value.toUpperCase())}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-glass)",
                      color: "var(--text-main)",
                      fontSize: "13.5px",
                      outline: "none",
                      fontFamily: "var(--mono)"
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px", display: "block" }}>
                    Default shared key: AK
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
                  Jira Board ID
                </label>
                <input
                  type="number"
                  placeholder="2"
                  value={newSpokeBoardId}
                  onChange={(e) => setNewSpokeBoardId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-main)",
                    fontSize: "13.5px",
                    outline: "none",
                    fontFamily: "var(--mono)"
                  }}
                />
                <span style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px", display: "block" }}>
                  Target Jira Kanban Board (Default: 2)
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddSpokeModal(false)}
                  className="btn-secondary"
                  style={{ padding: "9px 16px", fontSize: "13px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSpoke}
                  className="btn-primary"
                  style={{
                    padding: "9px 20px",
                    fontSize: "13px",
                    background: "#10b981",
                    borderColor: "#10b981",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                    cursor: "pointer"
                  }}
                >
                  {isSubmittingSpoke ? "Onboarding Spoke..." : "Save to PostgreSQL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// CORPORATE PARTNER SPONSORSHIP PORTAL VIEW
// ==========================================

function CorporateSponsorDashboardView({ projects, loading, onRefresh, onSubmitProposal, triggerToast, sessionUser, spokes, tasks, meetings = [] }) {
  const [activeTab, setActiveTab] = useState("portfolio"); // "portfolio", "submit", "cohorts"
  
  // Form states
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("2026-09-15");
  const [requirements, setRequirements] = useState("");
  const [phases, setPhases] = useState([{ name: "", description: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [companyMentors, setCompanyMentors] = useState([]);
  const companyName = sessionUser?.displayName?.replace(" Sponsor", "")?.replace(" Mentor", "") || "Company 1";
  const [teams, setTeams] = useState([]);
  const [evalRating, setEvalRating] = useState({}); // teamId -> rating (number)
  const [evalFeedback, setEvalFeedback] = useState({}); // teamId -> comments (string)
  const [evalGrade, setEvalGrade] = useState({}); // teamId -> grade (string)

  const fetchTeams = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/teams");
      setTeams(response.data || []);
    } catch (err) {
      console.error("Failed to fetch teams", err);
    }
  };

  const handleAssignCompanyMentor = async (projectId, spokeId, mentorId) => {
    if (!mentorId) return;
    try {
      const res = await axios.post(`http://localhost:5001/api/project/${projectId}/spoke/${spokeId}/project-mentor`, { mentorId });
      if (res.data && res.data.success) {
        triggerToast("Company Project Mentor assigned successfully!");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to assign Company Project Mentor.", "error");
    }
  };

  useEffect(() => {
    const fetchCompanyMentors = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/companies/${companyName}/mentors`);
        setCompanyMentors(response.data);
      } catch (err) {
        console.error("Failed to fetch company mentors", err);
      }
    };
    if (companyName) {
      fetchCompanyMentors();
    }
    fetchTeams();
  }, [companyName]);

  const handleEvaluate = async (teamId) => {
    const r = evalRating[teamId] || 5;
    const f = evalFeedback[teamId] || "";
    const g = evalGrade[teamId] || "A";
    try {
      const res = await axios.put(`http://localhost:5001/api/teams/${teamId}/evaluate`, {
        rating: Number(r),
        companyFeedback: f,
        companyGrade: g,
        evaluatedBy: sessionUser?.displayName || "Company Mentor"
      });
      if (res.data && res.data.success) {
        triggerToast("Team evaluation submitted successfully!");
        fetchTeams();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to submit team evaluation.", "error");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", gap: "16px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(45, 212, 191, 0.1)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
        }} className="pulse-glow"></div>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Synchronizing corporate partner sponsorship portal...</p>
      </div>
    );
  }

  // Filter projects submitted by this specific sponsor's company
  const sponsorProjects = projects.filter(p => 
    p.company && p.company.toLowerCase().trim() === companyName.toLowerCase().trim()
  );

  // Campus placements (Spokes where their projects are active/assigned)
  const campusPlacements = sponsorProjects.filter(p => 
    p.allocations && p.allocations.length > 0
  ).length;

  // Fully Completed projects
  // We can calculate completion using live tasks!
  const completedProjects = sponsorProjects.filter(p => {
    const expectedSummary = `[${p.company}] ${p.title}`;
    const epicKey = p.assignedKey;
    const projTasks = tasks.filter(t => {
      const parentKey = t.fields?.parent?.key || t.parent?.key;
      const parentSummary = t.fields?.parent?.fields?.summary || t.fields?.parent?.summary || t.parent?.fields?.summary || t.parent?.summary;
      return (epicKey && parentKey === epicKey) || (parentSummary && parentSummary === expectedSummary);
    });
    if (projTasks.length === 0) return false;
    const doneT = projTasks.filter(t => (t.fields?.status?.name || t.fields?.status || "") === "Done").length;
    return doneT === projTasks.length;
  }).length;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    
    setIsSubmitting(true);
    triggerToast("Parsing document...", "info");
    
    try {
      const response = await axios.post("http://localhost:5001/api/proposals/parse-template", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      
      const { title: pTitle, budget: pBudget, duration: pDuration, description: pDesc, requirements: pReq } = response.data;
      if (pTitle) setTitle(pTitle);
      if (pBudget) setBudget(pBudget);
      if (pDuration) setDuration(pDuration);
      if (pDesc) setDescription(pDesc);
      if (pReq) setRequirements(pReq);
      
      triggerToast("Template parsed and auto-filled!", "success");
    } catch (err) {
      console.error("File upload failed", err);
      triggerToast("Failed to parse document. Is the backend running?", "error");
    } finally {
      setIsSubmitting(false);
      e.target.value = ""; // reset input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !duration.trim()) {
      triggerToast("Please fill in all required fields.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitProposal({
        title,
        description,
        budget: "Not Applicable",
        duration: duration.includes("Month") ? duration : `${duration} Months`,
        proposedDueDate: dueDate,
        requirements,
        phases: phases.filter(p => p.name.trim() !== "")
      });
      setTitle("");
      setBudget("");
      setDuration("");
      setDescription("");
      setRequirements("");
      setPhases([{ name: "", description: "" }]);
      setActiveTab("portfolio");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      
      {/* Title & Header block */}
      <div className="glass-panel" style={{
        padding: "24px",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.02))",
        border: "1px solid var(--border-glass)",
        borderRadius: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
            Corporate Partner Sponsorship Portal
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Propose new projects, monitor active campus sponsorships, and track student engineering deliverables.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              setActiveTab("submit");
              if (triggerToast) triggerToast("Switched Tab: Submit a new Proposal");
            }}
            className="btn-primary"
            style={{
              padding: "8px 16px",
              fontSize: "12.5px",
              borderRadius: "8px",
              background: "#ef4444",
              borderColor: "transparent",
              color: "white",
              cursor: "pointer",
              fontWeight: "800",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
            }}
          >
            Propose Project
          </button>
          <span style={{
            fontSize: "11px",
            fontWeight: "800",
            background: "var(--primary-glow)",
            color: "var(--primary)",
            padding: "6px 12px",
            borderRadius: "20px",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            textTransform: "uppercase"
          }}>
            <span><FaBriefcase style={{ marginRight: '6px' }} /> {companyName} Sponsor active session</span>
          </span>
        </div>
      </div>

      {/* Upcoming Delegated Campus Syncs */}
      {(() => {
        const sponsorCampusIds = [...new Set(sponsorProjects.flatMap(p => p.allocations ? p.allocations.map(a => a.targetCampusId) : []))];
        const sponsorMeetings = meetings.filter(m => sponsorCampusIds.includes(m.campusId));
        if (sponsorMeetings.length === 0) return null;
        return (
          <div className="glass-panel" style={{ padding: "16px 24px", borderLeft: "4px solid #f59e0b" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaCalendarAlt style={{ color: "#f59e0b" }} /> Upcoming Delegated Campus Syncs
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
              {sponsorMeetings.map(meet => {
                const spokeName = spokes.find(s => s.id === meet.campusId)?.name || "Unknown Campus";
                return (
                  <div key={meet.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}>
                    <div>
                      <div style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                        {meet.cadenceType || "General Sync"} • {spokeName}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>
                        {meet.title}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--primary)" }}>{meet.time}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{meet.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* KPI Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px"
      }}>
        <DashboardCard
          title="Total Submissions"
          value={sponsorProjects.length}
          subtitle={`Submitted proposals by ${companyName}`}
          glow={true}
        />
        <DashboardCard
          title="Campus Placements"
          value={campusPlacements}
          subtitle="Assigned to Spoke institutions"
          themeColor="var(--status-progress-text)"
        />
        <DashboardCard
          title="Fully Completed"
          value={completedProjects}
          subtitle="Delivered by student cohorts"
          themeColor="var(--status-done-text)"
        />

      </div>

      {/* Navigation Buttons Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setActiveTab("portfolio")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: "750",
              cursor: "pointer",
              background: activeTab === "portfolio" ? "var(--primary-glow)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${activeTab === "portfolio" ? "var(--primary)" : "var(--border-glass)"}`,
              color: activeTab === "portfolio" ? "var(--primary)" : "var(--text-muted)",
              transition: "all 0.3s ease"
            }}
          >
            Active Sponsorships Tracker
          </button>
          <button
            onClick={() => setActiveTab("submit")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: "750",
              cursor: "pointer",
              background: activeTab === "submit" ? "var(--primary-glow)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${activeTab === "submit" ? "var(--primary)" : "var(--border-glass)"}`,
              color: activeTab === "submit" ? "var(--primary)" : "var(--text-muted)",
              transition: "all 0.3s ease"
            }}
          >
            Submit Project Proposal
          </button>
          <button
            onClick={() => setActiveTab("cohorts")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: "750",
              cursor: "pointer",
              background: activeTab === "cohorts" ? "var(--primary-glow)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${activeTab === "cohorts" ? "var(--primary)" : "var(--border-glass)"}`,
              color: activeTab === "cohorts" ? "var(--primary)" : "var(--text-muted)",
              transition: "all 0.3s ease"
            }}
          >
            FIP Cohort Progress
          </button>
          <button
            onClick={() => setActiveTab("evaluations")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: "750",
              cursor: "pointer",
              background: activeTab === "evaluations" ? "var(--primary-glow)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${activeTab === "evaluations" ? "var(--primary)" : "var(--border-glass)"}`,
              color: activeTab === "evaluations" ? "var(--primary)" : "var(--text-muted)",
              transition: "all 0.3s ease"
            }}
          >
            Final Work Evaluations
          </button>
        </div>

        <button
          onClick={onRefresh}
          className="btn-secondary"
          style={{ padding: "8px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px" }}
        >
          Synchronize Tracker
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "portfolio" && (
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "var(--text-main)" }}>
            Sponsorship Portfolio
          </h3>
          <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "var(--text-dim)" }}>
            Live real-time monitoring of campus deliveries, allocated scopes, and student milestones progress.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", color: "var(--text-main)", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-dim)" }}>
                  <th style={{ padding: "12px 8px", fontWeight: "750", width: "40%" }}>Project Details</th>
                  <th style={{ padding: "12px 8px", fontWeight: "750", width: "35%" }}>Campus Allocations, Faculty Mentors & Sprint Deadlines</th>
                  <th style={{ padding: "12px 8px", fontWeight: "750", textAlign: "right", width: "25%" }}>Live Project Completion Progress</th>
                </tr>
              </thead>
              <tbody>
                {sponsorProjects.map((proj) => {
                  const expectedSummary = `[${proj.company}] ${proj.title}`;
                  const epicKey = proj.assignedKey;
                  
                  // Filter student child tasks matching this Epic
                  const projTasks = tasks.filter(t => {
                    const parentKey = t.fields?.parent?.key || t.parent?.key;
                    const parentSummary = t.fields?.parent?.fields?.summary || t.fields?.parent?.summary || t.parent?.fields?.summary || t.parent?.summary;
                    return (epicKey && parentKey === epicKey) || (parentSummary && parentSummary === expectedSummary);
                  });

                  const totalT = projTasks.length;
                  const doneT = projTasks.filter(t => (t.fields?.status?.name || t.fields?.status || "") === "Done").length;
                  const progressPct = totalT > 0 ? Math.round((doneT / totalT) * 100) : 0;

                  const isAllocated = proj.allocations && proj.allocations.length > 0;

                  return (
                    <tr key={proj.id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                      {/* Project Details */}
                      <td style={{ padding: "20px 8px" }}>
                        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                          <CompanyLogo company={proj.company} size={40} />
                          <div>
                            <h4 style={{ margin: "0 0 6px 0", fontSize: "14.5px", fontWeight: "800", color: "var(--text-main)" }}>
                              {proj.title}
                            </h4>
                            <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "var(--text-dim)", flexWrap: "wrap" }}>
                              <span>Sponsor: <strong>{proj.company}</strong></span>
                              <span>•</span>
                              <span>Duration: <strong>{proj.duration}</strong></span>
                            </div>
                            <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4", maxWidth: "340px" }}>
                              {proj.description}
                            </p>
                            {proj.requirements && (
                              <div style={{ marginTop: "8px", fontSize: "11.5px", color: "var(--text-muted)" }}>
                                <strong>Requirements:</strong> <em>{proj.requirements}</em>
                              </div>
                            )}
                            {proj.phases && proj.phases.length > 0 && (
                              <div style={{ marginTop: "8px" }}>
                                <span style={{ fontSize: "10.5px", fontWeight: "750", color: "var(--text-dim)", display: "block", textTransform: "uppercase" }}>Project Phases:</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                                  {proj.phases.map((ph, idx) => (
                                    <div key={idx} style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                      <strong>{ph.name}</strong> {ph.description && `- ${ph.description}`}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Campus Allocations */}
                      <td style={{ padding: "20px 8px", verticalAlign: "middle" }}>
                        {isAllocated ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {proj.allocations.map((alloc) => {
                              const targetSpoke = spokes.find(s => s.id === alloc.targetCampusId);
                              const currFacultyMentor = alloc.facultyMentor;
                              const currProjectMentor = alloc.projectMentor;
                              
                              return (
                                <div key={alloc.targetCampusId} style={{
                                  padding: "12px 14px",
                                  background: "rgba(255, 255, 255, 0.015)",
                                  border: "1px solid var(--border-glass)",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px"
                                }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "750" }}>
                                    <span style={{ color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "6px" }}><FaBuilding /> {targetSpoke?.name || "Campus Spoke"}</span>
                                    <span style={{ fontFamily: "var(--mono)", color: "var(--text-main)" }}>{alloc.assignedKey || "Key Assigned"}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dim)" }}>
                                    <span>Milestone: <strong>{alloc.status}</strong></span>
                                    <span>Due: <strong>{proj.proposedDueDate}</strong></span>
                                  </div>

                                  {/* Faculty Mentor Details */}
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px", fontSize: "11px" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Faculty Mentor:</span>
                                    {currFacultyMentor ? (
                                      <span style={{ color: "#10b981", fontWeight: "600" }}>{currFacultyMentor.displayName}</span>
                                    ) : (
                                      <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>Awaiting College...</span>
                                    )}
                                  </div>

                                  {/* Project Mentor Details & Dropdown */}
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                                      <span style={{ color: "var(--text-muted)" }}>Project Mentor:</span>
                                      {currProjectMentor ? (
                                        <span style={{ color: "#f97316", fontWeight: "600" }}>{currProjectMentor.displayName}</span>
                                      ) : (
                                        <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>Not Assigned</span>
                                      )}
                                    </div>
                                    {!currProjectMentor && alloc.assignedKey && sessionUser?.role === "Corporate Partner" ? (
                                      <select
                                        value=""
                                        onChange={(e) => handleAssignCompanyMentor(proj._id || proj.id, alloc.targetCampusId, e.target.value)}
                                        style={{
                                          width: "100%",
                                          padding: "4px 8px",
                                          background: "#1f2937",
                                          border: "1px solid var(--border-glass)",
                                          borderRadius: "6px",
                                          color: "white",
                                          fontSize: "11px",
                                          outline: "none",
                                          cursor: "pointer",
                                          marginTop: "2px"
                                        }}
                                      >
                                        <option value="">-- Assign Company Mentor --</option>
                                        {companyMentors.map(m => (
                                          <option key={m.accountId} value={m.accountId}>
                                            {m.displayName} ({m.emailAddress})
                                          </option>
                                        ))}
                                      </select>
                                    ) : !currProjectMentor && !alloc.assignedKey ? (
                                      <span style={{ color: "var(--text-dim)", fontStyle: "italic", fontSize: "11px", marginTop: "4px" }}>
                                        Awaiting Campus Spoke Acceptance...
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-dim)", fontSize: "12.5px" }}>
                            <span><FaClock /></span>
                            <em>Proposed. Awaiting Central Moderator assignment to active campus spokes.</em>
                          </div>
                        )}
                      </td>

                      {/* Live Progress */}
                      <td style={{ padding: "20px 8px", textAlign: "right", verticalAlign: "middle" }}>
                        {isAllocated ? (
                          <div style={{ display: "inline-flex", flexDirection: "column", gap: "6px", width: "100%", maxWidth: "180px", textAlign: "left" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px" }}>
                              <span style={{ fontWeight: "750", color: "var(--text-muted)" }}>Milestone Progress</span>
                              <strong style={{ color: "var(--primary)", fontFamily: "var(--mono)" }}>{progressPct}%</strong>
                            </div>
                            <div style={{ height: "6px", background: "rgba(255,255,255,0.03)", borderRadius: "3px", overflow: "hidden", border: "1px solid var(--border-glass)" }}>
                              <div style={{ width: `${progressPct}%`, height: "100%", background: "var(--primary)", borderRadius: "3px" }} />
                            </div>
                          </div>
                        ) : (
                          <span style={{
                            fontSize: "10px",
                            fontWeight: "900",
                            background: "rgba(251, 146, 60, 0.08)",
                            color: "var(--accent)",
                            border: "1px solid rgba(251, 146, 60, 0.2)",
                            padding: "4px 10px",
                            borderRadius: "4px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                          }}>
                            IN REVIEW
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {sponsorProjects.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: "60px 40px", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", maxWidth: "400px", margin: "0 auto" }}>
                        <span style={{ fontSize: "36px", display: "inline-flex", alignItems: "center" }}><FaBriefcase /></span>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--text-main)" }}>
                          No Active Sponsorships
                        </h4>
                        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                          No project proposals have been submitted by your company yet. Propose your first industry project to begin campus allocations!
                        </p>
                        <button
                          onClick={() => {
                            setActiveTab("submit");
                            if (triggerToast) triggerToast("Opening Project Proposal Form...");
                          }}
                          className="btn-primary"
                          style={{
                            padding: "10px 20px",
                            fontSize: "12.5px",
                            borderRadius: "8px",
                            background: "#ef4444",
                            borderColor: "transparent",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: "800",
                            boxShadow: "0 4px 15px rgba(239, 68, 68, 0.25)"
                          }}
                        >
                          Propose Your First Project
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "submit" && (
        <div className="glass-panel" style={{ padding: "30px", maxWidth: "680px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "850", color: "var(--text-main)" }}>
            Submit Project Proposal
          </h3>
          <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "var(--text-muted)" }}>
            Propose a new industry engineering project. Central Moderators will review the proposal and assign it to student cohorts at KLE, COEP, MMCOEP, or RIT spokes.
          </p>

          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(168, 85, 247, 0.05)", border: "1px dashed rgba(168, 85, 247, 0.4)", borderRadius: "8px" }}>
            <div style={{ flex: 1 }}>
              <strong style={{ display: "block", fontSize: "13px", color: "var(--text-main)" }}>Auto-fill from Template</strong>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Upload a project specification document (PDF/DOCX) to automatically populate the form fields below.</span>
            </div>
            <label style={{ cursor: "pointer", background: "var(--primary)", color: "white", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
              Upload Document
              <input type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={handleFileUpload} />
            </label>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Project Title / Scope Name *
              </label>
              <input
                type="text"
                placeholder="e.g. GPU Cloud Orchestration Engine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-main)",
                  outline: "none",
                  fontSize: "13.5px"
                }}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Milestone Duration (Months) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6 Months"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-main)",
                    outline: "none",
                    fontSize: "13.5px"
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Target Sprint Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-main)",
                    outline: "none",
                    fontSize: "13.5px"
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Detailed Project Description & Deliverables *
              </label>
              <textarea
                placeholder="Describe project objectives, key phases, and student engineering outcomes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  height: "120px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-main)",
                  outline: "none",
                  fontSize: "13.5px",
                  resize: "none",
                  lineHeight: "1.5"
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Project Requirements & Skill Prerequisites (Optional)
              </label>
              <textarea
                placeholder="e.g. Experience with Python, Docker, PyTorch preferred..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                style={{
                  width: "100%",
                  height: "80px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-main)",
                  outline: "none",
                  fontSize: "13.5px",
                  resize: "none",
                  lineHeight: "1.5"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Initial Project Phases (Optional)
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {phases.map((phase, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder={`Phase ${idx + 1} Name (e.g. Research & Setup)`}
                      value={phase.name}
                      onChange={(e) => {
                        const updated = [...phases];
                        updated[idx].name = e.target.value;
                        setPhases(updated);
                      }}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-glass)",
                        color: "var(--text-main)",
                        outline: "none",
                        fontSize: "13px"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Phase Objectives / Deliverables"
                      value={phase.description}
                      onChange={(e) => {
                        const updated = [...phases];
                        updated[idx].description = e.target.value;
                        setPhases(updated);
                      }}
                      style={{
                        flex: 2,
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-glass)",
                        color: "var(--text-main)",
                        outline: "none",
                        fontSize: "13px"
                      }}
                    />
                    {phases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhases(phases.filter((_, i) => i !== idx));
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: "16px"
                        }}
                        title="Remove Phase"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPhases([...phases, { name: "", description: "" }])}
                  style={{
                    alignSelf: "flex-start",
                    padding: "6px 12px",
                    background: "rgba(99, 102, 241, 0.08)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    borderRadius: "6px",
                    color: "var(--primary)",
                    fontSize: "11px",
                    fontWeight: "750",
                    cursor: "pointer",
                    marginTop: "4px"
                  }}
                >
                  + Add Project Phase
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                padding: "12px",
                fontSize: "13px",
                borderRadius: "8px",
                background: "#ef4444",
                border: "none",
                color: "white",
                fontWeight: "800",
                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.25)",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              {isSubmitting ? "Submitting Proposal..." : "Submit Proposal"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "cohorts" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
          {/* Spoke ranks */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>
              College Progress Leaderboard
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {spokes.map((spoke, idx) => {
                const medal = idx === 0 ? "1st" : idx === 1 ? "2nd" : idx === 2 ? "3rd" : "Rank";
                // Sum completions by this spoke
                const spokeTasks = tasks.filter(t => t.fields?.labels?.includes(CAMPUS_LABELS[spoke.id]));
                const done = spokeTasks.filter(t => (t.fields?.status?.name || t.fields?.status || "") === "Done").length;
                const total = spokeTasks.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0; // 0% if no tasks yet
                
                return (
                  <div key={spoke.id} style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "10px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px" }}>{medal}</span>
                        <span style={{ fontSize: "12px", fontWeight: "750", color: "var(--text-main)" }}>
                          {spoke.name}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--text-main)", fontWeight: "700" }}>
                        {done} / {total} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.03)", borderRadius: "2px", overflow: "hidden", border: "1px solid var(--border-glass)" }}>
                      <div style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: idx === 0 
                          ? "#f59e0b" 
                          : (idx === 1 ? "#9ca3af" : "var(--primary)"),
                        borderRadius: "2px"
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campus Deliverables Overview Card */}
          <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>
                Campus Deliverables Overview
              </h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                This card represents the operational progress and milestone completion across the campus spokes working on **{companyName}** problem statements and sprint epics.
              </p>
            </div>
            
            <div style={{
              marginTop: "20px",
              padding: "16px",
              background: "rgba(99, 102, 241, 0.05)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between"
            }}>
              <div>
                <span style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>Active Placements</span>
                <span style={{ fontSize: "16px", fontWeight: "900", color: "var(--primary)" }}>{campusPlacements} Campus Spokes</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase" }}>Completed Projects</span>
                <span style={{ fontSize: "16px", fontWeight: "900", color: "var(--accent)" }}>{completedProjects} Delivered</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "evaluations" && (
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "800", color: "var(--text-main)" }}>
            Final Work Progress Reviews
          </h3>
          <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "var(--text-muted)" }}>
            Evaluate completed sprints and final deliverables submitted by college teams working on your projects.
          </p>

          {(() => {
            const companyTeams = teams.filter(t => sponsorProjects.some(p => p._id === t.projectId || p.id === t.projectId));
            const finalProgressTeams = companyTeams.filter(t => t.finalProgress && t.finalProgress.status !== "Pending");

            if (finalProgressTeams.length === 0) {
              return (
                <div style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  border: "1px dashed var(--border-glass)",
                  borderRadius: "12px",
                  color: "var(--text-dim)",
                  fontSize: "13px"
                }}>
                  No campus teams have submitted their final work progress reports for your projects yet.
                </div>
              );
            }

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {finalProgressTeams.map((team) => {
                  const linkedProj = sponsorProjects.find(p => p._id === team.projectId || p.id === team.projectId);
                  const targetSpoke = spokes.find(s => s.id === team.boardId);

                  return (
                    <div key={team._id || team.id} style={{
                      padding: "20px",
                      background: "rgba(255, 255, 255, 0.015)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "var(--text-main)" }}>{team.name}</h4>
                          <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "650", display: "block", marginTop: "2px" }}>
                            Institution Spoke: {targetSpoke?.name || "Campus Spoke"}
                          </span>
                        </div>
                        <span style={{
                          fontSize: "9px",
                          fontWeight: "900",
                          background: team.finalProgress.status === "Evaluated" ? "rgba(45, 212, 191, 0.08)" : "rgba(251, 146, 60, 0.08)",
                          color: team.finalProgress.status === "Evaluated" ? "#2dd4bf" : "var(--accent)",
                          border: team.finalProgress.status === "Evaluated" ? "1px solid rgba(45, 212, 191, 0.2)" : "1px solid rgba(251, 146, 60, 0.2)",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          textTransform: "uppercase"
                        }}>{team.finalProgress.status}</span>
                      </div>

                      <div style={{ fontSize: "13px", color: "var(--text-muted)", background: "rgba(255, 255, 255, 0.005)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                        <div>
                          Project Scope: <strong>{linkedProj?.title}</strong>
                        </div>
                        {team.githubRepo && (
                          <div style={{ marginTop: "6px" }}>
                            GitHub Space: <a href={team.githubRepo} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: "700" }}>{team.githubRepo}</a>
                          </div>
                        )}
                        <div style={{ marginTop: "6px" }}>
                          Report URL: <a href={team.finalProgress.reportUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: "700" }}>{team.finalProgress.reportUrl}</a>
                        </div>
                        {team.finalProgress.facultyComments && (
                          <div style={{ marginTop: "6px", color: "var(--text-dim)" }}>
                            Faculty Comments: <em>"{team.finalProgress.facultyComments}"</em>
                          </div>
                        )}
                        {team.finalProgress.grade && (
                          <div style={{ marginTop: "6px", color: "var(--text-dim)" }}>
                            Faculty Assigned Grade: <strong style={{ color: "var(--accent)" }}>{team.finalProgress.grade}</strong>
                          </div>
                        )}
                        <span style={{ fontSize: "10px", color: "var(--text-dim)", display: "block", marginTop: "8px" }}>
                          Submitted on: {new Date(team.finalProgress.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      {team.finalProgress.status === "Submitted" ? (
                        <div style={{
                          marginTop: "8px",
                          padding: "16px",
                          background: "rgba(249, 115, 22, 0.02)",
                          border: "1px solid rgba(249, 115, 22, 0.15)",
                          borderRadius: "10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px"
                        }}>
                          <h5 style={{ margin: 0, fontSize: "12px", color: "var(--accent)", textTransform: "uppercase", fontWeight: "800" }}>Grade Performance & Feedback</h5>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "16px", alignItems: "center" }}>
                            <div>
                              <label style={{ display: "block", fontSize: "11px", fontWeight: "750", color: "var(--text-muted)", marginBottom: "4px" }}>Rating Score *</label>
                              <select
                                value={evalRating[team._id || team.id] || "5"}
                                onChange={(e) => setEvalRating({ ...evalRating, [team._id || team.id]: e.target.value })}
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  background: "#1f2937",
                                  border: "1px solid var(--border-glass)",
                                  borderRadius: "6px",
                                  color: "white",
                                  fontSize: "12px",
                                  outline: "none"
                                }}
                              >
                                <option value="5">★★★★★ (5/5)</option>
                                <option value="4">★★★★☆ (4/5)</option>
                                <option value="3">★★★☆☆ (3/5)</option>
                                <option value="2">★★☆☆☆ (2/5)</option>
                                <option value="1">★☆☆☆☆ (1/5)</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "11px", fontWeight: "750", color: "var(--text-muted)", marginBottom: "4px" }}>Assign Grade *</label>
                              <select
                                value={evalGrade[team._id || team.id] || "A"}
                                onChange={(e) => setEvalGrade({ ...evalGrade, [team._id || team.id]: e.target.value })}
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  background: "#1f2937",
                                  border: "1px solid var(--border-glass)",
                                  borderRadius: "6px",
                                  color: "white",
                                  fontSize: "12px",
                                  outline: "none"
                                }}
                              >
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                                <option value="B+">B+</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="F">F</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: "11px", fontWeight: "750", color: "var(--text-muted)", marginBottom: "4px" }}>Written Feedback Comments *</label>
                              <input
                                type="text"
                                placeholder="Provide detailed engineering milestone feedback..."
                                value={evalFeedback[team._id || team.id] || ""}
                                onChange={(e) => setEvalFeedback({ ...evalFeedback, [team._id || team.id]: e.target.value })}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px",
                                  background: "var(--bg-input)",
                                  border: "1px solid var(--border-glass)",
                                  borderRadius: "6px",
                                  color: "white",
                                  fontSize: "12px",
                                  outline: "none"
                                }}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleEvaluate(team._id || team.id)}
                            style={{
                              alignSelf: "flex-end",
                              padding: "8px 16px",
                              background: "var(--accent)",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              fontWeight: "750",
                              fontSize: "12px",
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(249, 115, 22, 0.2)"
                            }}
                          >
                            Submit Evaluation Review
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          background: "rgba(45, 212, 191, 0.03)",
                          borderLeft: "3px solid #2dd4bf",
                          padding: "12px 16px",
                          borderRadius: "0 8px 8px 0",
                          marginTop: "8px",
                          fontSize: "12.5px"
                        }}>
                          <div style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)" }}>
                            Rating Score: {Array.from({ length: team.finalProgress.rating }).map((_, i) => (
                              <span key={i} style={{ color: "#fbbf24", fontSize: "14px" }}>★</span>
                            ))} ({team.finalProgress.rating}/5)
                          </div>
                          {team.finalProgress.companyGrade && (
                            <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                              Assigned Grade: <strong style={{ color: "var(--accent)" }}>{team.finalProgress.companyGrade}</strong>
                            </div>
                          )}
                          {team.finalProgress.companyFeedback && (
                            <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                              Feedback: <strong>{team.finalProgress.companyFeedback}</strong>
                            </div>
                          )}
                          <span style={{ fontSize: "10px", color: "var(--text-dim)", display: "block", marginTop: "6px" }}>
                            Evaluated by {team.finalProgress.evaluatedBy} on {new Date(team.finalProgress.evaluatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}

// ==========================================
// COLLABORATIVE Sync Meetings PORTAL VIEW
// ==========================================

function MeetingsPortalView({ meetings, loading, onRefresh, spokes, triggerToast, moderatorProjects = [], sessionUser, isFacultyMentor = false }) {
  const getSpokeProjectStatus = (spokeName) => {
    const activeProjs = moderatorProjects.filter(p => p.assignedTo === spokeName && (p.status === "Active" || p.status.startsWith("Assigned") || p.status.includes("BREACHED")));
    const proposedProjs = moderatorProjects.filter(p => p.assignedTo === spokeName && p.status === "Proposed");
    
    if (activeProjs.length > 0) {
      return `Active: ${activeProjs.map(p => p.company).join(", ")}`;
    }
    if (proposedProjs.length > 0) {
      return `Proposed: ${proposedProjs.map(p => p.company).join(", ")}`;
    }
    return `Awaiting Projects`;
  };
  const [newTitle, setNewTitle] = useState("");
  const mentorId = sessionUser?._id || sessionUser?.id;
  const mentorSpokeId = String(sessionUser?.spokeId || "3");
  const defaultSpokeId = sessionUser?.spokeId ? String(sessionUser.spokeId) : (spokes[0]?.id ? String(spokes[0].id) : "3");
  const [newCampusIds, setNewCampusIds] = useState([defaultSpokeId]);
  const [selectionMode, setSelectionMode] = useState("manual");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [newDate, setNewDate] = useState("2026-05-27");
  const [newTime, setNewTime] = useState("14:30");
  const [newLink, setNewLink] = useState("");
  const [videoPlatform, setVideoPlatform] = useState("jitsi");
  const [newAgenda, setNewAgenda] = useState("");
  const [newCadenceType, setNewCadenceType] = useState(isFacultyMentor ? "Team Sprint Sync" : "Weekly College PM Update");
  const [isScheduling, setIsScheduling] = useState(false);
  const [remindLoading, setRemindLoading] = useState(null); // id of meeting loading reminder

  // Faculty Mentor team and project states (strictly scoped)
  const [mentorTeams, setMentorTeams] = useState([]);
  const [mentorProjects, setMentorProjects] = useState([]);
  const [facultySelectionMode, setFacultySelectionMode] = useState("team"); // "team" | "project"
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedMentorProjectId, setSelectedMentorProjectId] = useState("");
  const [loadingTeams, setLoadingTeams] = useState(false);

  useEffect(() => {
    if (isFacultyMentor && mentorId) {
      setLoadingTeams(true);
      Promise.all([
        axios.get(`http://localhost:5001/api/teams?mentorId=${mentorId}`),
        axios.get(`http://localhost:5001/api/mentors/${mentorId}/projects`)
      ]).then(([teamsRes, projsRes]) => {
        setMentorTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
        setMentorProjects(Array.isArray(projsRes.data) ? projsRes.data : []);
      }).catch(err => {
        console.error("Failed to load mentor teams/projects:", err);
      }).finally(() => {
        setLoadingTeams(false);
      });
    }
  }, [isFacultyMentor, mentorId]);

  // Combined projects assigned to mentor or linked with their teams
  const combinedMentorProjects = useMemo(() => {
    const map = new Map();
    (mentorProjects || []).forEach(p => {
      if (p && (p._id || p.id)) map.set(String(p._id || p.id), p);
    });
    (mentorTeams || []).forEach(t => {
      if (t.projectId) {
        const pid = String(t.projectId);
        if (!map.has(pid)) {
          const found = (moderatorProjects || []).find(mp => String(mp._id || mp.id) === pid);
          if (found) map.set(pid, found);
        }
      }
    });
    return Array.from(map.values());
  }, [mentorProjects, mentorTeams, moderatorProjects]);

  // Selected date filter (null means show all meetings)
  const [filterDate, setFilterDate] = useState(null);
  
  // Calendar active view month/year (initialized to May 2026 to align with default meetings)
  const [viewMonth, setViewMonth] = useState(4); // 4 = May
  const [viewYear, setViewYear] = useState(2026);
  const [activeJitsiMeeting, setActiveJitsiMeeting] = useState(null);
  const [jitsiLoading, setJitsiLoading] = useState(true);

  // When viewed by Faculty Mentor, strictly filter meetings to only their home campus spoke
  const displayMeetings = isFacultyMentor
    ? meetings.filter(m => String(m.campusId) === mentorSpokeId)
    : meetings;

  const isConflicted = (meet) => {
    return displayMeetings.some(m => m.id !== meet.id && m.campusId === meet.campusId && m.date === meet.date && m.time === meet.time);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      triggerToast("Please enter a meeting title.", "warning");
      return;
    }
    
    // For Faculty Mentor, campus is strictly locked to their home campus spoke - no other campus allowed
    const targetCampusIds = isFacultyMentor ? [mentorSpokeId] : newCampusIds;

    if (targetCampusIds.length === 0) {
      triggerToast("Please select at least one campus.", "warning");
      return;
    }

    if (isFacultyMentor) {
      if (facultySelectionMode === "team" && mentorTeams.length > 0 && !selectedTeamId) {
        triggerToast("Please select a student team under you for this sync.", "warning");
        return;
      }
      if (facultySelectionMode === "project" && combinedMentorProjects.length > 0 && !selectedMentorProjectId) {
        triggerToast("Please select an assigned project for this sync.", "warning");
        return;
      }
    }

    const overlap = displayMeetings.some(m => targetCampusIds.includes(m.campusId) && m.date === newDate && m.time === newTime);
    if (overlap) {
      triggerToast(` Schedule Conflict: There is already a sync scheduled for this campus today at ${newTime}!`, "warning");
    }

    setIsScheduling(true);
    try {
      const generatedLink = videoPlatform === "jitsi"
        ? (newLink.trim() || `https://meet.jit.si/ApniLeap-${encodeURIComponent((newTitle || "Sprint").trim().replace(/[^a-zA-Z0-9]/g, '-'))}-${Date.now()}`)
        : (newLink.trim() || "https://teams.microsoft.com/");

      // Create a meeting for EACH selected campus (strictly only mentor's campus when in faculty dashboard)
      for (const campusId of targetCampusIds) {
        await axios.post("http://localhost:5001/meetings", {
          title: newTitle,
          campusId: campusId,
          date: newDate,
          time: newTime,
          link: generatedLink,
          agenda: newAgenda,
          cadenceType: newCadenceType
        });
      }

      triggerToast(isFacultyMentor ? "Team sync meeting scheduled successfully!" : "Meeting scheduled successfully!");
      setNewTitle("");
      setNewLink("");
      setNewAgenda("");
      setSelectedTeamId("");
      setSelectedMentorProjectId("");
      onRefresh(); // Refresh all syncs
    } catch (error) {
      triggerToast(error.response?.data?.error || "Failed to schedule sync meeting.", "error");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSendReminder = async (meetId) => {
    setRemindLoading(meetId);
    try {
      const res = await axios.post(`http://localhost:5001/meetings/${meetId}/remind`);
      if (res.data && res.data.success) {
        triggerToast(`Reminder dispatched! Notified ${res.data.notifiedEmails.length} coordinators with ${res.data.overdueCount} overdue items and ${res.data.blockerCount} blockers.`);
        if (res.data.previewUrl) {
          console.log("\n");
          console.log("┌────────────────────────────────────────────────────────┐");
          console.log("│ 📧 APNILEAP SANDBOX OUTGOING EMAIL PREVIEW LINK        │");
          console.log("├────────────────────────────────────────────────────────┤");
          console.log(`│ LINK: \x1b[36m${res.data.previewUrl}\x1b[0m`);
          console.log("│ (Copy and paste this URL into your browser to view the  │");
          console.log("│  beautifully styled HTML warning email!)                │");
          console.log("└────────────────────────────────────────────────────────┘");
          console.log("\n");
          triggerToast(`Sandbox email ready! Link logged to browser Developer Console (F12).`, "info");
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to dispatch meeting warning reminder.", "error");
    } finally {
      setRemindLoading(null);
    }
  };

  const handleDeleteMeeting = async (meetId) => {
    if (!window.confirm("Are you sure you want to cancel and delete this scheduled sync meeting?")) {
      return;
    }
    try {
      const res = await axios.delete(`http://localhost:5001/meetings/${meetId}`);
      if (res.data && res.data.success) {
        triggerToast("Sync meeting cancelled and deleted successfully.");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to delete sync meeting.", "error");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", gap: "16px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(99, 102, 241, 0.1)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
        }} className="pulse-glow"></div>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Retrieving scheduled syncs...</p>
      </div>
    );
  }

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Total days in viewMonth/viewYear
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Index of first day (0-6)
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const formatDateString = (day) => {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getMeetingsForDate = (dateStr) => {
    return displayMeetings.filter(m => m.date === dateStr);
  };

  const filteredMeetings = filterDate 
    ? displayMeetings.filter(m => m.date === filterDate)
    : displayMeetings;

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", gap: "16px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(99, 102, 241, 0.1)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
        }} className="pulse-glow"></div>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Retrieving scheduled syncs...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "30px", alignItems: "start" }}>
      
      {/* LEFT COLUMN: Meetings Timeline & Interactive Calendar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Governance Cadence Tracker */}
        <div className="glass-panel" style={{ padding: "16px 20px", background: "var(--bg-card)", borderLeft: "4px solid var(--accent)" }}>
          <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <FaCalendarAlt style={{ color: "var(--accent)" }} /> {isFacultyMentor ? "Team Meeting Cadence Compliance" : "Meeting Schedule Compliance"}
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {(isFacultyMentor ? [
              "Team Sprint Sync",
              "Faculty Mentor Review",
              "Student Project Milestone Review",
              "General Sync"
            ] : [
              "Weekly College PM Update",
              "Weekly ApniLeap Cohort Checkpoint",
              "Bi-weekly Program Director Review",
              "Monthly FIP Steering Review"
            ]).map(cadence => {
              const isScheduled = displayMeetings.some(m => m.cadenceType === cadence);
              return (
                <div key={cadence} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-glass)", fontSize: "11px", fontWeight: "600" }}>
                  <span style={{ color: "var(--text-main)" }}>{cadence}</span>
                  {isScheduled ? (
                    <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>✓ Scheduled</span>
                  ) : (
                    <span style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}>! Missing</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Interactive Calendar Widget */}
        <div className="glass-panel" style={{ padding: "20px", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <span>Interactive Scheduling Calendar</span>
              </h4>
              <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px", marginBottom: 0 }}>Click any day to select scheduling date, or filter meetings.</p>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button 
                type="button" 
                onClick={handlePrevMonth} 
                className="btn-secondary" 
                style={{ padding: "6px 10px", borderRadius: "6px", display: "flex", alignItems: "center", cursor: "pointer" }}
              >
                <FaChevronLeft size={10} />
              </button>
              <span style={{ fontSize: "13.5px", fontWeight: "800", color: "var(--text-main)", minWidth: "110px", textAlign: "center" }}>
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button 
                type="button" 
                onClick={handleNextMonth} 
                className="btn-secondary" 
                style={{ padding: "6px 10px", borderRadius: "6px", display: "flex", alignItems: "center", cursor: "pointer" }}
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center" }}>
            {WEEKDAYS.map(day => (
              <div key={day} style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase", paddingBottom: "8px", letterSpacing: "0.5px" }}>
                {day}
              </div>
            ))}

            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`spacer-${idx}`} style={{ minHeight: "38px" }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = formatDateString(dayNum);
              const dayMeetings = getMeetingsForDate(dateStr);
              const isSelected = newDate === dateStr;
              
              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => {
                    setNewDate(dateStr);
                    setFilterDate(dateStr);
                    triggerToast(`Selected ${dateStr} for scheduling! Filtering syncs list...`, "info");
                  }}
                  style={{
                    position: "relative",
                    minHeight: "38px",
                    borderRadius: "8px",
                    background: isSelected 
                      ? "#ef4444"
                      : "transparent",
                    border: "1px solid transparent",
                    color: isSelected ? "white" : "var(--text-main)",
                    fontWeight: isSelected ? "800" : "600",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2px",
                    transition: "var(--transition-smooth)"
                  }}
                  className={!isSelected ? "calendar-day-btn" : ""}
                >
                  <span>{dayNum}</span>
                  
                  {/* Glowing Indicator Dots for Scheduled Meetings */}
                  {dayMeetings.length > 0 && (
                    <div style={{ display: "flex", gap: "2px", justifyContent: "center" }}>
                      {dayMeetings.map((m) => (
                        <div 
                          key={m.id} 
                          style={{
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: isSelected ? "#ffffff" : "var(--accent)",
                            boxShadow: isSelected ? "none" : "0 0 4px var(--accent)"
                          }}
                          title={m.title}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scheduled Meetings List */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
                {isFacultyMentor ? "Scheduled Team Syncs" : "Scheduled FIP Syncs"}
              </h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px", marginBottom: 0 }}>
                {isFacultyMentor ? "Active sprint team sync schedules and mentor review panels." : "Active sync schedules and prep reminder trigger panels."}
              </p>
            </div>
            <button onClick={onRefresh} className="btn-secondary" style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <FaSyncAlt size={12} />
              <span style={{ fontSize: "12px" }}>Refresh Syncs</span>
            </button>
          </div>

          {filterDate && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "var(--primary-glow)",
              border: "1px solid var(--border-glass)",
              marginBottom: "16px",
              fontSize: "12.5px"
            }}>
              <span style={{ color: "var(--text-main)", fontWeight: "600" }}>
                Showing {filteredMeetings.length} sync(s) scheduled for <strong style={{ color: "var(--secondary)" }}>{filterDate}</strong>
              </span>
              <button 
                type="button" 
                onClick={() => setFilterDate(null)}
                className="btn-secondary"
                style={{ padding: "4px 10px", fontSize: "11px", fontWeight: "750", cursor: "pointer" }}
              >
                Show All Syncs
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {filteredMeetings.map((meet) => {
              const spokeName = spokes.find(s => s.id === meet.campusId)?.name || "Unknown Spoke";
              const isReminderActive = remindLoading === meet.id;
              
              return (
                <div key={meet.id} className="glass-panel table-row-hover" style={{
                  padding: "20px",
                  border: "1px solid var(--border-glass)",
                  background: "var(--bg-card)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "800",
                        background: "rgba(99, 102, 241, 0.1)",
                        color: "var(--primary)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        <span><FaBuilding style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {spokeName}</span>
                      </span>
                      {meet.cadenceType && meet.cadenceType !== "General Sync" && (
                        <span style={{
                          fontSize: "10px",
                          fontWeight: "800",
                          background: "rgba(245, 158, 11, 0.1)",
                          color: "#f59e0b",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginLeft: "8px"
                        }}>
                          <span>{meet.cadenceType}</span>
                        </span>
                      )}
                      <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-main)", marginTop: "8px", marginBottom: "0" }}>
                        {meet.title}
                      </h4>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                        {isConflicted(meet) && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "800",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "#ef4444"
                          }} className="pulse-glow" title="Another meeting is scheduled for this campus at the same time!">
                            <span><FaExclamationTriangle style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Conflict</span>
                          </span>
                        )}
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--primary)" }}><span><FaClock style={{ marginRight: "4px", verticalAlign: "middle" }} /> {meet.time}</span></div>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{meet.date}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    <strong>Agenda:</strong> {meet.agenda}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "14px", marginTop: "4px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <button
                        onClick={() => {
                          setActiveJitsiMeeting(meet);
                          setJitsiLoading(true);
                        }}
                        className="btn-secondary"
                        style={{
                          fontSize: "12px",
                          color: "var(--primary)",
                          borderColor: "rgba(99, 102, 241, 0.3)",
                          background: "var(--primary-glow)",
                          fontWeight: "750",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          transition: "var(--transition-smooth)"
                        }}
                      >
                        <span><FaDesktop style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Join Sync Room (Jitsi Video)</span>
                      </button>
                      <a
                        href={meet.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "11.5px", color: "var(--text-muted)", textDecoration: "none", fontWeight: "600" }}
                      >
                        <span><FaLink style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Alternative Link</span>
                      </a>

                      <button
                        onClick={() => handleDeleteMeeting(meet.id)}
                        style={{
                          fontSize: "11.5px",
                          color: "#ef4444",
                          background: "rgba(239, 68, 68, 0.08)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          fontWeight: "750",
                          cursor: "pointer",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          marginLeft: "12px",
                          transition: "var(--transition-smooth)"
                        }}
                        title="Cancel and delete scheduled sync meeting persistently"
                      >
                        <span><FaTrashAlt style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Cancel Sync</span>
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleSendReminder(meet.id)}
                      disabled={isReminderActive}
                      className="btn-primary"
                      style={{
                        padding: "6px 14px",
                        fontSize: "11.5px",
                        borderRadius: "6px",
                        background: "#ef4444",
                        border: "none",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
                        cursor: "pointer"
                      }}
                    >
                      {isReminderActive ? "Relaying alerts..." : "Dispatch Prep Reminder"}
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredMeetings.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)" }}>
                No meetings scheduled for this date. Click on the calendar or use the form to schedule a campus sync.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Schedule Form */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
          {isFacultyMentor ? "Schedule Team Sprint Sync" : "Schedule FIP Campus Sync"}
        </h3>
        <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "20px" }}>
          {isFacultyMentor 
            ? "Establish live sync channels and virtual reviews for your student teams." 
            : "Establish sync channels for review of sprint deliverables."}
        </p>

        <form onSubmit={handleScheduleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              Meeting Type *
            </label>
            <select
              className="form-select"
              required
              value={newCadenceType}
              onChange={(e) => setNewCadenceType(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px", marginBottom: "16px", background: "rgba(99, 102, 241, 0.05)", border: "1px solid var(--primary)", color: "var(--text-main)", borderRadius: "6px" }}
            >
              <option value="Team Sprint Sync">Team Sprint Sync</option>
              <option value="Faculty Mentor Review">Faculty Mentor Review</option>
              <option value="Student Project Milestone Review">Student Project Milestone Review</option>
              <option value="Weekly College PM Update">Weekly College PM Update</option>
              <option value="Weekly ApniLeap Cohort Checkpoint">Weekly ApniLeap Cohort Checkpoint</option>
              <option value="Bi-weekly Program Director Review">Bi-weekly Program Director Review</option>
              <option value="Monthly FIP Steering Review">Monthly FIP Steering Review</option>
              <option value="General Sync">General Sync</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              Meeting Title *
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={isFacultyMentor ? "e.g. Phase 1 Architecture Review & Demo" : "e.g. KLE Bi-weekly Sprint Sync"}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px" }}
            />
          </div>

          {isFacultyMentor ? (
            /* STRICTLY FOR FACULTY MENTOR: No other campuses allowed, strictly only teams under him */
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Locked Home Institution Spoke Indicator */}
              <div style={{
                padding: "12px 14px",
                background: "rgba(59, 82, 154, 0.08)",
                border: "1px solid var(--border-glass)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                    Institution Campus (Strictly Locked)
                  </span>
                  <div style={{ fontSize: "13.5px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                    <FaBuilding style={{ color: "var(--primary)" }} />
                    <span>{spokes.find(s => String(s.id) === mentorSpokeId)?.name || "KLE Tech Campus"} ({spokes.find(s => String(s.id) === mentorSpokeId)?.key || "APNN"})</span>
                  </div>
                </div>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "750",
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.1)",
                  padding: "4px 8px",
                  borderRadius: "6px"
                }}>
                  Your Campus
                </span>
              </div>

              {/* Meeting Scope Mode Switcher for Faculty Mentor */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "850", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Schedule Meeting For *
                </label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  background: "rgba(0, 0, 0, 0.04)",
                  padding: "4px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-glass)"
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setFacultySelectionMode("team");
                      setSelectedMentorProjectId("");
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: facultySelectionMode === "team" ? "1px solid var(--primary)" : "1px solid transparent",
                      background: facultySelectionMode === "team" ? "var(--primary)" : "transparent",
                      color: facultySelectionMode === "team" ? "#fff" : "var(--text-main)",
                      fontWeight: facultySelectionMode === "team" ? "750" : "500",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "7px",
                      transition: "all 0.15s ease",
                      boxShadow: facultySelectionMode === "team" ? "0 2px 8px rgba(99, 102, 241, 0.25)" : "none"
                    }}
                  >
                    <Users size={14} />
                    <span>Choose based on Team</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFacultySelectionMode("project");
                      setSelectedTeamId("");
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: facultySelectionMode === "project" ? "1px solid var(--primary)" : "1px solid transparent",
                      background: facultySelectionMode === "project" ? "var(--primary)" : "transparent",
                      color: facultySelectionMode === "project" ? "#fff" : "var(--text-main)",
                      fontWeight: facultySelectionMode === "project" ? "750" : "500",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "7px",
                      transition: "all 0.15s ease",
                      boxShadow: facultySelectionMode === "project" ? "0 2px 8px rgba(99, 102, 241, 0.25)" : "none"
                    }}
                  >
                    <Briefcase size={14} />
                    <span>Choose based on Project</span>
                  </button>
                </div>
              </div>

              {/* Mode 1: Choose based on Team */}
              {facultySelectionMode === "team" && (
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                    Target Team Under You *
                  </label>
                  {loadingTeams ? (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "10px" }}>Loading your assigned teams...</div>
                  ) : mentorTeams.length > 0 ? (
                    <>
                      <select
                        className="form-select"
                        required={facultySelectionMode === "team"}
                        value={selectedTeamId}
                        onChange={(e) => {
                          const tid = e.target.value;
                          setSelectedTeamId(tid);
                          const team = mentorTeams.find(t => (t._id || t.id) === tid);
                          if (team) {
                            const proj = mentorProjects.find(p => p._id === team.projectId || p.id === team.projectId) || moderatorProjects.find(p => p._id === team.projectId || p.id === team.projectId);
                            setNewTitle(`Sync: Team ${team.name}${proj ? ` (${proj.company})` : ""}`);
                            setNewAgenda(`Sprint sync with Team ${team.name} to review sprint task deliverables, evaluate milestones, and unblock workstreams.`);
                          }
                        }}
                        style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid var(--primary)", background: "rgba(99, 102, 241, 0.05)", borderRadius: "6px", color: "var(--text-main)" }}
                      >
                        <option value="">-- Choose a Student Team Under You --</option>
                        {mentorTeams.map(t => {
                          const proj = mentorProjects.find(p => p._id === t.projectId || p.id === t.projectId) || moderatorProjects.find(p => p._id === t.projectId || p.id === t.projectId);
                          return (
                            <option key={t._id || t.id} value={t._id || t.id}>
                              Team {t.name} {proj ? `— [${proj.company}: ${proj.title}]` : ""}
                            </option>
                          );
                        })}
                      </select>

                      {selectedTeamId && (() => {
                        const team = mentorTeams.find(t => (t._id || t.id) === selectedTeamId);
                        if (!team) return null;
                        const proj = mentorProjects.find(p => p._id === team.projectId || p.id === team.projectId) || moderatorProjects.find(p => p._id === team.projectId || p.id === team.projectId);
                        return (
                          <div style={{
                            marginTop: "8px",
                            padding: "10px 12px",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid var(--border-glass)",
                            borderRadius: "8px",
                            fontSize: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px"
                          }}>
                            <div style={{ color: "var(--text-main)", fontWeight: "750", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Users size={13} style={{ color: "var(--primary)" }} />
                              Selected Team: Team {team.name}
                            </div>
                            <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                              Leader: <strong>{team.teamLeader?.displayName || "Not assigned"}</strong> &bull; Members: <strong>{(team.members || []).length} students</strong>
                            </div>
                            {proj && (
                              <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                                Project: <strong>{proj.title}</strong> ({proj.company})
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div style={{
                      padding: "12px 14px",
                      background: "rgba(249, 115, 22, 0.08)",
                      border: "1px solid rgba(249, 115, 22, 0.2)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--text-muted)"
                    }}>
                      <p style={{ margin: "0 0 6px 0", color: "var(--accent, #f97316)", fontWeight: "750" }}>
                        No student teams assembled yet
                      </p>
                      <span>Switch to <strong>Choose based on Project</strong> or assemble teams under the <strong>Create & Manage Teams</strong> view.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Choose based on Project */}
              {facultySelectionMode === "project" && (
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                    Target Project Under You *
                  </label>
                  {loadingTeams ? (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "10px" }}>Loading your assigned projects...</div>
                  ) : combinedMentorProjects.length > 0 ? (
                    <>
                      <select
                        className="form-select"
                        required={facultySelectionMode === "project"}
                        value={selectedMentorProjectId}
                        onChange={(e) => {
                          const pid = e.target.value;
                          setSelectedMentorProjectId(pid);
                          const proj = combinedMentorProjects.find(p => String(p._id || p.id) === pid);
                          if (proj) {
                            const matchingTeams = mentorTeams.filter(t => String(t.projectId) === pid);
                            const teamsSuffix = matchingTeams.length > 0 ? ` [${matchingTeams.map(t => 'Team ' + t.name).join(', ')}]` : '';
                            setNewTitle(`Project Review: ${proj.title} (${proj.company || 'Corporate Partner'})${teamsSuffix}`);
                            setNewAgenda(`Project sprint milestone review for "${proj.title}" with assigned student teams. Review blockers, progress demo, and deliverable commitments.`);
                          }
                        }}
                        style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid var(--primary)", background: "rgba(99, 102, 241, 0.05)", borderRadius: "6px", color: "var(--text-main)" }}
                      >
                        <option value="">-- Choose a Project Under You --</option>
                        {combinedMentorProjects.map(p => {
                          const pid = String(p._id || p.id);
                          const matchingTeams = mentorTeams.filter(t => String(t.projectId) === pid);
                          return (
                            <option key={pid} value={pid}>
                              {p.company ? `[${p.company}] ` : ""}{p.title} {matchingTeams.length > 0 ? `(${matchingTeams.length} team${matchingTeams.length > 1 ? 's' : ''})` : ''}
                            </option>
                          );
                        })}
                      </select>

                      {selectedMentorProjectId && (() => {
                        const proj = combinedMentorProjects.find(p => String(p._id || p.id) === selectedMentorProjectId);
                        if (!proj) return null;
                        const matchingTeams = mentorTeams.filter(t => String(t.projectId) === selectedMentorProjectId);
                        return (
                          <div style={{
                            marginTop: "8px",
                            padding: "10px 12px",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid var(--border-glass)",
                            borderRadius: "8px",
                            fontSize: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px"
                          }}>
                            <div style={{ color: "var(--text-main)", fontWeight: "750", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Briefcase size={13} style={{ color: "var(--primary)" }} />
                              {proj.company ? `${proj.company} — ` : ""}{proj.title}
                            </div>
                            <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                              Track / Status: <strong>{proj.track || proj.domain || "Enterprise Track"}</strong> &bull; <span style={{ color: "#10b981", fontWeight: "700" }}>{proj.status || "Active"}</span>
                            </div>
                            <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                              Assigned Teams Under You:{" "}
                              <strong style={{ color: matchingTeams.length > 0 ? "var(--primary)" : "var(--text-muted)" }}>
                                {matchingTeams.length > 0 
                                  ? matchingTeams.map(t => `Team ${t.name}`).join(", ") 
                                  : "No student teams linked to this project yet"}
                              </strong>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div style={{
                      padding: "12px 14px",
                      background: "rgba(249, 115, 22, 0.08)",
                      border: "1px solid rgba(249, 115, 22, 0.2)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--text-muted)"
                    }}>
                      <p style={{ margin: "0 0 6px 0", color: "var(--accent, #f97316)", fontWeight: "750" }}>
                        No projects assigned yet
                      </p>
                      <span>Switch to <strong>Choose based on Team</strong> or contact your Campus Lead / Moderator for project allocations.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Moderator / Admin Multi-Campus Selection */
            <div>
              <div style={{ display: "flex", gap: "12px", marginBottom: "12px", background: "rgba(0,0,0,0.1)", padding: "10px", borderRadius: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", color: selectionMode === "project" ? "var(--primary)" : "var(--text-main)", fontWeight: selectionMode === "project" ? "700" : "500" }}>
                  <input 
                    type="radio" 
                    name="selectionMode" 
                    value="project" 
                    checked={selectionMode === "project"} 
                    onChange={() => {
                      setSelectionMode("project");
                      setNewCampusIds([]);
                    }}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  Group by Active Project
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", color: selectionMode === "manual" ? "var(--primary)" : "var(--text-main)", fontWeight: selectionMode === "manual" ? "700" : "500" }}>
                  <input 
                    type="radio" 
                    name="selectionMode" 
                    value="manual" 
                    checked={selectionMode === "manual"} 
                    onChange={() => {
                      setSelectionMode("manual");
                      setSelectedProjectId("");
                    }}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  Manual Campus Selection
                </label>
              </div>

              {selectionMode === "project" && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                    Select Project To Auto-Assign Campuses *
                  </label>
                  <select
                    className="form-select"
                    value={selectedProjectId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setSelectedProjectId(pid);
                      const proj = moderatorProjects.find(p => p.id === pid || p._id === pid);
                      if (proj) {
                        const ids = proj.allocations ? proj.allocations.map(a => a.targetCampusId) : [proj.targetCampusId].filter(Boolean);
                        setNewCampusIds([...new Set(ids)]);
                        if (!newTitle.trim() || newTitle.startsWith("Sync:")) {
                          setNewTitle(`Sync: ${proj.title}`);
                        }
                      } else {
                        setNewCampusIds([]);
                      }
                    }}
                    style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid var(--primary)", background: "rgba(99, 102, 241, 0.05)", borderRadius: "6px", color: "var(--text-main)" }}
                  >
                    <option value="">-- Choose an Active Project --</option>
                    {moderatorProjects.filter(p => p.allocations && p.allocations.length > 0).map(p => (
                      <option key={p.id || p._id} value={p.id || p._id}>{p.title} ({p.company})</option>
                    ))}
                  </select>
                </div>
              )}

              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                {selectionMode === "project" ? "Assigned Campuses (Review)" : "Target Institution Campuses * (Select multiple)"}
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                {spokes.map(s => {
                  const status = getSpokeProjectStatus(s.name);
                  const isSelected = newCampusIds.includes(s.id);
                  return (
                    <label key={s.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: isSelected ? "var(--text-main)" : "var(--text-muted)", cursor: "pointer", padding: "4px 0" }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewCampusIds([...newCampusIds, s.id]);
                          } else {
                            setNewCampusIds(newCampusIds.filter(id => id !== s.id));
                          }
                        }}
                        style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }}
                      />
                      <span style={{ flex: 1 }}>{s.name} ({s.key})</span>
                      <span style={{ fontSize: "11px", color: status.includes("Active") ? "var(--primary)" : "var(--text-dim)", fontStyle: "italic" }}>
                        [{status}]
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                Date *
              </label>
              <input
                type="date"
                required
                className="form-input"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                Time *
              </label>
              <input
                type="time"
                required
                className="form-input"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", fontSize: "13px" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
              Video Platform Options *
            </label>
            <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", color: videoPlatform === "jitsi" ? "var(--primary)" : "var(--text-main)", fontWeight: videoPlatform === "jitsi" ? "700" : "500" }}>
                <input 
                  type="radio" 
                  name="videoPlatform" 
                  value="jitsi" 
                  checked={videoPlatform === "jitsi"} 
                  onChange={() => {
                    setVideoPlatform("jitsi");
                    setNewLink(""); // clear custom link
                  }}
                  style={{ accentColor: "var(--primary)" }}
                />
                Built-in Jitsi Meeting
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", color: videoPlatform === "teams" ? "var(--primary)" : "var(--text-main)", fontWeight: videoPlatform === "teams" ? "700" : "500" }}>
                <input 
                  type="radio" 
                  name="videoPlatform" 
                  value="teams" 
                  checked={videoPlatform === "teams"} 
                  onChange={() => setVideoPlatform("teams")}
                  style={{ accentColor: "var(--primary)" }}
                />
                Microsoft Teams / External Link
              </label>
            </div>

            {videoPlatform === "jitsi" && (
              <div style={{ padding: "12px", background: "var(--primary-glow)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "8px", fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>
                <FaDesktop style={{ marginRight: "6px", verticalAlign: "middle" }} />
                A secure, embedded Jitsi video room will be automatically generated for this sync. No external link required.
              </div>
            )}

            {videoPlatform === "teams" && (
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                  Paste Teams / External Video Link *
                </label>
                <input
                  type="url"
                  required
                  className="form-input"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://teams.microsoft.com/l/meetup-join/..."
                  style={{ width: "100%", padding: "10px 12px", fontSize: "13px" }}
                />
              </div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              Sync Agenda *
            </label>
            <textarea
              required
              rows={3}
              className="form-input"
              value={newAgenda}
              onChange={(e) => setNewAgenda(e.target.value)}
              placeholder="e.g. Sprint blocker review, VLSI laboratory setup progression, and Phase 1 milestone evaluation."
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px", resize: "none" }}
            />
          </div>

          <button
            type="submit"
            disabled={isScheduling}
            className="btn-primary"
            style={{
              padding: "12px",
              marginTop: "8px",
              fontWeight: "700",
              fontSize: "13px",
              background: "#ef4444",
              color: "white",
              boxShadow: "0 4px 15px rgba(239, 68, 68, 0.2)",
              cursor: "pointer"
            }}
          >
            {isScheduling ? "Creating sync..." : "Schedule Sync Meeting"}
          </button>
        </form>
      </div>

      {/* Dynamic Jitsi Video Room full-screen overlay */}
      {activeJitsiMeeting && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(3, 7, 18, 0.85)",
          backdropFilter: "blur(20px)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          boxSizing: "border-box",
        }} className="fade-in">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border-glass)",
            padding: "12px 20px",
            borderRadius: "12px",
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "white" }}>
                <span><FaDesktop style={{ marginRight: '6px', verticalAlign: 'middle' }} /> ApniLeap Live Sync Room:</span> {activeJitsiMeeting.title}
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                Secure, borderless Jitsi collaboration room for FIP deliverables sync.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  const iframe = document.getElementById("jitsi-iframe");
                  if (iframe) {
                    if (iframe.requestFullscreen) iframe.requestFullscreen();
                    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
                    else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
                  }
                }}
                className="btn-secondary"
                style={{ padding: "8px 16px", cursor: "pointer", fontSize: "12.5px", fontWeight: "700" }}
              >
                <span><FaFilter style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Full Screen</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveJitsiMeeting(null)}
                className="btn-primary"
                style={{
                  padding: "8px 16px",
                  background: "#ef4444",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
                }}
              >
                <span><FaTimes style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Close Sync Room</span>
              </button>
            </div>
          </div>

          <div style={{
            flex: 1,
            background: "#07090e",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
            position: "relative"
          }}>
            {/* High-fidelity glowing loader overlay */}
            {jitsiLoading && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "#07090e",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "18px",
                zIndex: 5
              }} className="fade-in">
                <div style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid rgba(99, 102, 241, 0.1)",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                }} className="pulse-glow"></div>
                <h4 style={{ color: "white", margin: 0, fontSize: "14px", fontWeight: "800", letterSpacing: "0.2px" }} className="pulse-glow">
                  Establishing Secure Sync Channel...
                </h4>
                <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "12px", textAlign: "center", maxWidth: "300px", lineHeight: "1.4" }}>
                  Initializing camera, microphone, and encryption systems.
                </p>
              </div>
            )}

            <iframe
              id="jitsi-iframe"
              src={`https://meet.jit.si/apnileap-sync-${activeJitsiMeeting.id}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true&config.disableDeepLinking=true&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_BRAND_WATERMARK=false&interfaceConfig.SHOW_POWERED_BY=false&interfaceConfig.DEFAULT_BACKGROUND='#07090e'`}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              onLoad={() => setJitsiLoading(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}

function ProjectManagerDashboardView({ projects = [], loading, onRefresh, triggerToast, spokes = [], onDeleteProject }) {
  const [spokeMentorsMap, setSpokeMentorsMap] = useState({});
  const [companyMentorsMap, setCompanyMentorsMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch mentors for all spokes
    const fetchSpokeMentors = async () => {
      const map = {};
      await Promise.all(spokes.map(async (spoke) => {
        try {
          const res = await axios.get(`http://localhost:5001/api/spokes/${spoke.id}/mentors`);
          map[spoke.id] = res.data;
        } catch (err) {
          console.error(`Failed to fetch mentors for spoke ${spoke.id}`, err);
        }
      }));
      setSpokeMentorsMap(map);
    };

    if (spokes.length > 0) {
      fetchSpokeMentors();
    }
  }, [spokes]);

  useEffect(() => {
    // Fetch mentors for all unique companies
    const fetchCompanyMentors = async () => {
      const companies = [...new Set(projects.map(p => p.company))].filter(Boolean);
      const map = {};
      await Promise.all(companies.map(async (company) => {
        try {
          const res = await axios.get(`http://localhost:5001/api/companies/${company}/mentors`);
          map[company] = res.data;
        } catch (err) {
          console.error(`Failed to fetch mentors for company ${company}`, err);
        }
      }));
      setCompanyMentorsMap(map);
    };

    if (projects.length > 0) {
      fetchCompanyMentors();
    }
  }, [projects]);

  const handleAssignFacultyMentor = async (projectId, spokeId, mentorId) => {
    if (!mentorId) return;
    try {
      const res = await axios.post(`http://localhost:5001/api/project/${projectId}/spoke/${spokeId}/faculty-mentor`, { mentorId });
      if (res.data && res.data.success) {
        triggerToast("College Faculty Mentor assigned successfully!");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to assign Faculty Mentor.", "error");
    }
  };

  const handleAssignProjectMentor = async (projectId, spokeId, mentorId) => {
    if (!mentorId) return;
    try {
      const res = await axios.post(`http://localhost:5001/api/project/${projectId}/spoke/${spokeId}/project-mentor`, { mentorId });
      if (res.data && res.data.success) {
        triggerToast("Company Project Mentor assigned successfully!");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to assign Company Project Mentor.", "error");
    }
  };

  // Metrics
  const totalProjects = projects.length;
  const allocatedProjects = projects.filter(p => p.allocations && p.allocations.length > 0).length;
  const activeAllocations = projects.reduce((acc, p) => acc + (p.allocations ? p.allocations.filter(a => a.status === "Active").length : 0), 0);
  const pendingMentors = projects.reduce((acc, p) => {
    if (!p.allocations) return acc;
    const pending = p.allocations.filter(a => a.status === "Active" && (!a.facultyMentor || !a.projectMentor)).length;
    return acc + pending;
  }, 0);

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Title block */}
      <div className="glass-panel" style={{
        padding: "20px 24px",
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.03))",
        border: "1px solid var(--border-glass)",
        borderRadius: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
            Project Manager Hub Dashboard
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            Central control center for company projects, college team assignments, and mentorship tracking.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="btn-secondary"
          style={{ padding: "8px 16px", borderRadius: "8px" }}
        >
          Refresh Dashboard
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <DashboardCard title="Total Projects" value={totalProjects} subtitle="Total company projects created" glow={true} />
        <DashboardCard title="Assigned to Colleges" value={allocatedProjects} subtitle="Projects given to college teams" themeColor="var(--primary)" />
        <DashboardCard title="Active College Teams" value={activeAllocations} subtitle="Active student project teams" themeColor="var(--status-progress-text)" />
        <DashboardCard title="Waiting for Mentors" value={pendingMentors} subtitle="Projects needing a mentor assigned" themeColor={pendingMentors > 0 ? "#ef4444" : "var(--status-done-text)"} glow={pendingMentors > 0} />
      </div>

      {/* Main Table section */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "var(--text-main)" }}>
              Company Projects & College Assignments
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
              Assign college faculty mentors or company project mentors to guide student teams.
            </p>
          </div>
          {/* Search bar */}
          <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: "100%", padding: "8px 12px 8px 36px", fontSize: "13px" }}
            />
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", display: "flex", alignItems: "center" }}>
              <FaSearch size={14} />
            </span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", color: "var(--text-main)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-glass)", color: "var(--text-dim)", textAlign: "left" }}>
                <th style={{ padding: "12px 8px", fontWeight: "750", width: "32%" }}>Company Project & Details</th>
                <th style={{ padding: "12px 8px", fontWeight: "750", width: "56%" }}>College Assignments & Mentors</th>
                <th style={{ padding: "12px 8px", fontWeight: "750", width: "12%", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(proj => {
                const isAllocated = proj.allocations && proj.allocations.length > 0;
                return (
                  <tr key={proj.id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                    <td style={{ padding: "20px 8px", verticalAlign: "top" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <CompanyLogo company={proj.company} size={36} />
                        <div>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "800" }}>{proj.title}</h4>
                          <div style={{ fontSize: "11px", color: "var(--text-dim)", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <span>Company: <strong>{proj.company}</strong></span>
                            <span>•</span>
                            <span>Duration: <strong>{proj.duration}</strong></span>
                          </div>
                          <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4", maxWidth: "300px" }}>
                            {proj.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "20px 8px", verticalAlign: "top" }}>
                      {isAllocated ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {proj.allocations.map(alloc => {
                            const targetSpoke = spokes.find(s => s.id === alloc.targetCampusId);
                            const mentors = spokeMentorsMap[alloc.targetCampusId] || [];
                            const cMentors = companyMentorsMap[proj.company] || [];

                            return (
                              <div key={alloc.targetCampusId} style={{
                                padding: "12px 16px",
                                background: "rgba(255,255,255,0.01)",
                                border: "1px solid var(--border-glass)",
                                borderRadius: "10px",
                                display: "grid",
                                gridTemplateColumns: "1.2fr 1fr 1fr",
                                gap: "16px",
                                alignItems: "center"
                              }}>
                                <div>
                                  <div style={{ fontWeight: "750", color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <FaBuilding size={14} /> {targetSpoke?.name || "College"}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px" }}>
                                    Status: <strong style={{ color: alloc.status === "Active" ? "var(--status-progress-text)" : "var(--text-muted)" }}>{alloc.status}</strong>
                                  </div>
                                  <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                                    Jira Key: <strong style={{ color: "var(--text-main)", fontFamily: "var(--mono)" }}>{alloc.assignedKey || "N/A"}</strong>
                                  </div>
                                </div>

                                {/* College Faculty Mentor Selection */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <label style={{ fontSize: "11px", fontWeight: "750", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <FaGraduationCap size={13} style={{ color: "#10b981" }} /> College Mentor:
                                  </label>
                                  {alloc.facultyMentor ? (
                                    <div style={{ fontSize: "11.5px", fontWeight: "600", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                                      <img src={alloc.facultyMentor.avatarUrl} alt="" style={{ width: "18px", height: "18px", borderRadius: "50%" }} />
                                      {alloc.facultyMentor.displayName}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: "11px", color: "#ef4444", fontStyle: "italic" }}>Not Assigned</div>
                                  )}
                                </div>

                                {/* Company Project Mentor Selection */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <label style={{ fontSize: "11px", fontWeight: "750", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <FaUser size={13} style={{ color: "#f97316" }} /> Company Mentor:
                                  </label>
                                  {alloc.projectMentor ? (
                                    <div style={{ fontSize: "11.5px", fontWeight: "600", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                                      <img src={alloc.projectMentor.avatarUrl} alt="" style={{ width: "18px", height: "18px", borderRadius: "50%" }} />
                                      {alloc.projectMentor.displayName}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: "11px", color: "#f97316", fontStyle: "italic" }}>Not Assigned</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ fontStyle: "italic", color: "var(--text-dim)", fontSize: "12px" }}>
                          This project has not been assigned to any college yet. Use the Moderator Panel to assign it.
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "20px 8px", verticalAlign: "top", textAlign: "right" }}>
                      {onDeleteProject && (
                        <button
                          onClick={() => onDeleteProject(proj)}
                          className="btn-secondary"
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            color: "#ef4444",
                            borderColor: "rgba(239, 68, 68, 0.3)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            borderRadius: "8px",
                            background: "rgba(239, 68, 68, 0.05)",
                            cursor: "pointer"
                          }}
                          title="Delete Project"
                        >
                          <FaTrashAlt size={12} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)", fontStyle: "italic" }}>
                    No company projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FacultyMentorDashboardView({ 
  sessionUser, 
  triggerToast, 
  spokes, 
  handleUpdateSubmissionStatus, 
  handleDeleteSubmission, 
  fetchAllSubmissions,
  meetings = [],
  allSubmissions = [],
  setActiveView,
  handleRunAiVerificationSweep,
  activeSubView = "overview",
  setActiveCustomBoardId,
  setActiveCustomBoardTitle,
  fetchJiraTasks,
  setFilterProject
}) {
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [existingTeams, setExistingTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [spokeMentors, setSpokeMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectDetailsModal, setProjectDetailsModal] = useState(null);
  const [deliverablesModalProject, setDeliverablesModalProject] = useState(null);
  const [expandedDeliverables, setExpandedDeliverables] = useState({});
  const [evalModal, setEvalModal] = useState({
    isOpen: false,
    type: "approve",
    submission: null,
    grade: "A",
    feedback: ""
  });

  // Pending Student Verifications
  const [pendingStudentsList, setPendingStudentsList] = useState([]);
  const [isPendingStudentsLoading, setIsPendingStudentsLoading] = useState(false);

  // Form states
  const [teamName, setTeamName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [subMentorId, setSubMentorId] = useState("");
  const [teamLeaderId, setTeamLeaderId] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  const mentorId = sessionUser?._id;
  const spokeId = sessionUser?.spokeId || "3"; // KLE by default
  const currentView = activeSubView || "overview";

  const handleOpenProjectKanban = (proj, e) => {
    if (e) e.stopPropagation();
    if (!proj) return;
    const alloc = proj.allocations ? proj.allocations.find(a => String(a.targetCampusId) === String(spokeId)) : null;
    if (alloc && alloc.customBoardId) {
      if (setActiveCustomBoardId) setActiveCustomBoardId(alloc.customBoardId);
      if (typeof setActiveCustomBoardTitle === "function") setActiveCustomBoardTitle(proj.title);
      if (fetchJiraTasks) fetchJiraTasks(false, alloc.customBoardId);
      if (setFilterProject) setFilterProject("All");
    } else {
      if (setActiveCustomBoardId) setActiveCustomBoardId(null);
      if (typeof setActiveCustomBoardTitle === "function") setActiveCustomBoardTitle("");
      if (setFilterProject) setFilterProject(`[${proj.company}] ${proj.title}`);
    }
    if (setActiveView) setActiveView("kanban");
    window.scrollTo(0, 0);
  };

  const fetchMentorData = async () => {
    if (!mentorId) return;
    setIsLoading(true);
    try {
      if (fetchAllSubmissions) fetchAllSubmissions();
      const [projectsRes, teamsRes, studentsRes, mentorsRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/mentors/${mentorId}/projects`),
        axios.get(`http://localhost:5001/api/teams?mentorId=${mentorId}`),
        axios.get(`http://localhost:5001/api/spokes/${spokeId}/students`),
        axios.get(`http://localhost:5001/api/spokes/${spokeId}/mentors`)
      ]);
      setAssignedProjects(projectsRes.data);
      setExistingTeams(teamsRes.data);
      const studentOnly = Array.isArray(studentsRes.data)
        ? studentsRes.data.filter(s => s.role && s.role.toLowerCase().includes('student'))
        : [];
      const mentorOnly = Array.isArray(mentorsRes.data)
        ? mentorsRes.data.filter(m => (m.role && m.role.toLowerCase().includes('mentor')) || m.persona === 'faculty-mentor')
        : [];
      setStudents(studentOnly);
      setSpokeMentors(mentorOnly);
    } catch (err) {
      console.error("Failed to load faculty mentor data:", err);
      triggerToast("Failed to retrieve dashboard data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingStudents = useCallback(async () => {
    if (!spokeId) return;
    try {
      setIsPendingStudentsLoading(true);
      const res = await axios.get(`http://localhost:5001/api/spokes/${spokeId}/pending-students`);
      setPendingStudentsList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch pending students:", err);
    } finally {
      setIsPendingStudentsLoading(false);
    }
  }, [spokeId]);

  const handleApproveStudent = async (studentId, studentName) => {
    try {
      const res = await axios.post(`http://localhost:5001/api/users/${studentId}/approve`);
      triggerToast(res.data.message || `Verified & approved ${studentName}!`, "success");
      fetchPendingStudents();
      fetchMentorData();
    } catch (err) {
      triggerToast("Failed to approve student.", "error");
    }
  };

  const handleRejectStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to decline ${studentName}'s registration?`)) return;
    try {
      const res = await axios.post(`http://localhost:5001/api/users/${studentId}/reject`);
      triggerToast(res.data.message || `Declined ${studentName}.`, "info");
      fetchPendingStudents();
    } catch (err) {
      triggerToast("Failed to decline student.", "error");
    }
  };

  useEffect(() => {
    fetchMentorData();
    fetchPendingStudents();
  }, [mentorId, spokeId, fetchPendingStudents]);

  const handleStudentCheckboxChange = (studentId) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        const next = prev.filter(id => id !== studentId);
        // Clear team leader if they were deselected
        if (teamLeaderId === studentId) {
          setTeamLeaderId("");
        }
        return next;
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      triggerToast("Please provide a team name.", "warning");
      return;
    }
    if (!selectedProjectId) {
      triggerToast("Please select a project.", "warning");
      return;
    }
    if (selectedStudentIds.length === 0) {
      triggerToast("Please select at least one student member.", "warning");
      return;
    }
    if (!teamLeaderId) {
      triggerToast("Please designate a team leader.", "warning");
      return;
    }

    if (existingTeams.some(team => team.projectId === selectedProjectId)) {
      triggerToast("A team has already been created for this project. Only one team per project is allowed.", "warning");
      return;
    }

    setIsCreatingTeam(true);

    const selectedStudentsObjects = students
      .filter(s => selectedStudentIds.includes(s.accountId))
      .map(s => ({
        accountId: s.accountId,
        displayName: s.displayName,
        emailAddress: s.emailAddress,
        avatarUrl: s.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.displayName)}&background=6366f1&color=fff`
      }));

    const teamLeaderObj = selectedStudentsObjects.find(s => s.accountId === teamLeaderId);

    const subMentorObj = spokeMentors.find(m => m.accountId === subMentorId);
    let subMentorPayload = null;
    if (subMentorObj) {
      subMentorPayload = {
        accountId: subMentorObj.accountId,
        displayName: subMentorObj.displayName,
        emailAddress: subMentorObj.emailAddress,
        avatarUrl: subMentorObj.avatarUrl
      };
    }

    const payload = {
      name: teamName,
      boardId: spokeId,
      members: selectedStudentsObjects,
      mentor: {
        accountId: mentorId,
        displayName: sessionUser.displayName,
        emailAddress: sessionUser.email,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(sessionUser.displayName)}&background=10b981&color=fff`
      },
      teamLeader: teamLeaderObj || null,
      projectId: selectedProjectId,
      subMentor: subMentorPayload
    };

    try {
      const res = await axios.post("http://localhost:5001/api/teams", payload);
      if (res.data && res.data.success) {
        triggerToast(`Team "${teamName}" created successfully!`);
        // Reset form
        setTeamName("");
        setSelectedProjectId("");
        setSelectedStudentIds([]);
        setSubMentorId("");
        setTeamLeaderId("");
        setIsStudentDropdownOpen(false);
        setStudentSearchQuery("");
        // Reload teams
        fetchMentorData();
      }
    } catch (err) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to create sprints team.", "error");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleDisbandTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to disband this team? This action is permanent.")) return;
    try {
      await axios.delete(`http://localhost:5001/api/teams/${teamId}`);
      triggerToast("Team disbanded successfully!");
      fetchMentorData();
    } catch (err) {
      console.error(err);
      triggerToast("Failed to disband team.", "error");
    }
  };

  const selectedStudentsObjects = students.filter(s => selectedStudentIds.includes(s.accountId));
  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return students;
    const q = studentSearchQuery.toLowerCase();
    return students.filter(s =>
      (s.displayName && s.displayName.toLowerCase().includes(q)) ||
      (s.emailAddress && s.emailAddress.toLowerCase().includes(q))
    );
  }, [students, studentSearchQuery]);
  const subMentorOptions = spokeMentors.filter(m => m.accountId !== mentorId);

  const handleSubmitFinalProgressClick = async (teamId) => {
    const reportUrl = prompt("Please enter the Final Progress Report URL (e.g., GitHub repository, PDF report):");
    if (!reportUrl) return;
    const grade = prompt("Please assign a Final Team Grade (e.g., A, B, C, D, F):", "A");
    if (!grade) return;
    const facultyComments = prompt("Enter summary comments / review for the Company Mentor:");
    if (facultyComments === null) return;

    try {
      const res = await axios.put(`http://localhost:5001/api/teams/${teamId}/final-progress`, {
        reportUrl,
        grade,
        facultyComments
      });
      if (res.data && res.data.success) {
        triggerToast("Final work progress and review submitted to Company Mentor!");
        fetchMentorData();
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to submit final progress.", "error");
    }
  };

  const spokeSubmissions = allSubmissions.filter(sub => {
    const isMember = students.some(s => s.displayName?.toLowerCase() === sub.studentName?.toLowerCase());
    const targetKeyword = spokeId === "3" ? "kle" : spokeId === "101" ? "coep" : spokeId === "102" ? "mmcoep" : "rit";
    const subNameLower = sub.studentName?.toLowerCase() || "";
    return isMember || subNameLower.includes(targetKeyword) || subNameLower.includes("student");
  });

  const getDeliverablesForProject = (proj) => {
    if (!proj) return [];
    const pId = String(proj._id || proj.id);
    const projTitleLower = (proj.title || "").trim().toLowerCase();

    return spokeSubmissions.filter(sub => {
      // 1. Explicit projectId match
      if (sub.projectId) {
        return String(sub.projectId) === pId;
      }
      // 2. Explicit projectName match
      if (sub.projectName) {
        return sub.projectName.trim().toLowerCase() === projTitleLower;
      }
      // 3. Fallback: team membership only if no explicit project on submission
      const assignedTeam = existingTeams.find(t => String(t.projectId) === pId);
      const teamMemberNames = (assignedTeam?.members || []).map(m => (m.displayName || m.emailAddress || "").toLowerCase());
      if (sub.studentName && teamMemberNames.includes(sub.studentName.trim().toLowerCase())) {
        return true;
      }
      // 4. Fallback: filename matching
      const fileNameLower = (sub.fileName || "").toLowerCase();
      const titleWords = projTitleLower.split(" ").slice(0, 3).join(" ");
      if (titleWords && titleWords.length > 5 && fileNameLower.includes(titleWords)) {
        return true;
      }
      return false;
    });
  };

  const getProjectForSubmission = (sub) => {
    if (!sub) return null;
    if (sub.projectId) {
      const found = assignedProjects.find(p => String(p._id || p.id) === String(sub.projectId));
      if (found) return found;
    }
    if (sub.projectName) {
      const subProjLower = sub.projectName.trim().toLowerCase();
      const found = assignedProjects.find(p => (p.title || "").trim().toLowerCase() === subProjLower);
      if (found) return found;
    }
    const subStudentLower = (sub.studentName || "").trim().toLowerCase();
    const studentTeam = existingTeams.find(t => 
      (t.members || []).some(m => (m.displayName || m.emailAddress || "").toLowerCase() === subStudentLower)
    );
    if (studentTeam && studentTeam.projectId) {
      const found = assignedProjects.find(p => String(p._id || p.id) === String(studentTeam.projectId));
      if (found) return found;
    }
    const fileNameLower = (sub.fileName || "").toLowerCase();
    return assignedProjects.find(p => {
      const titleLower = (p.title || "").toLowerCase();
      const titleWords = titleLower.split(" ").slice(0, 3).join(" ");
      return titleWords && titleWords.length > 5 && fileNameLower.includes(titleWords);
    });
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Navigation Pill Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        padding: "6px 8px",
        background: "var(--bg-card, rgba(255, 255, 255, 0.02))",
        border: "1px solid var(--border-glass)",
        borderRadius: "14px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setActiveView && setActiveView("dashboard")}
            style={{
              padding: "9px 18px",
              borderRadius: "10px",
              border: currentView === "overview" ? "1px solid var(--primary, #3b529a)" : "1px solid transparent",
              background: currentView === "overview" ? "var(--primary, #3b529a)" : "transparent",
              color: currentView === "overview" ? "#ffffff" : "var(--text-muted)",
              fontWeight: "750",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              boxShadow: currentView === "overview" ? "0 4px 12px rgba(59, 82, 154, 0.25)" : "none"
            }}
          >
            <FaChartPie size={14} />
            <span>Overview & Assigned Projects ({assignedProjects.length})</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveView && setActiveView("teams")}
            style={{
              padding: "9px 18px",
              borderRadius: "10px",
              border: currentView === "teams" ? "1px solid var(--accent, #f97316)" : "1px solid transparent",
              background: currentView === "teams" ? "var(--accent, #f97316)" : "transparent",
              color: currentView === "teams" ? "#ffffff" : "var(--text-muted)",
              fontWeight: "750",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              boxShadow: currentView === "teams" ? "0 4px 12px rgba(249, 115, 22, 0.25)" : "none"
            }}
          >
            <FaUsers size={15} />
            <span>Create & Manage Teams ({existingTeams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView && setActiveView("meetings")}
            style={{
              padding: "9px 18px",
              borderRadius: "10px",
              border: "1px solid transparent",
              background: "transparent",
              color: "var(--text-muted)",
              fontWeight: "750",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease"
            }}
          >
            <FaCalendarAlt size={14} />
            <span>Team Meetings & Syncs ({meetings.filter(m => String(m.campusId) === String(spokeId)).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView && setActiveView("student-approvals")}
            style={{
              padding: "9px 18px",
              borderRadius: "10px",
              border: currentView === "student-approvals" ? "1px solid #10b981" : "1px solid transparent",
              background: currentView === "student-approvals" ? "#10b981" : "transparent",
              color: currentView === "student-approvals" ? "#ffffff" : "var(--text-muted)",
              fontWeight: "750",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              boxShadow: currentView === "student-approvals" ? "0 4px 12px rgba(16, 185, 129, 0.25)" : "none"
            }}
          >
            <FaUserCheck size={14} />
            <span>Student Verifications</span>
            {pendingStudentsList.length > 0 && (
              <span style={{
                background: currentView === "student-approvals" ? "#ffffff" : "#ef4444",
                color: currentView === "student-approvals" ? "#10b981" : "#ffffff",
                padding: "1px 7px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: "800",
                marginLeft: "2px"
              }}>
                {pendingStudentsList.length}
              </span>
            )}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => {
              fetchMentorData();
              fetchPendingStudents();
            }}
            className="btn-secondary"
            style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FaSyncAlt size={12} className={isLoading || isPendingStudentsLoading ? "pulse-glow" : ""} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW (PROJECTS HANDLED + DELIVERABLES VERIFICATION) */}
      {currentView === "overview" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Overview Header Banner */}
          <div className="glass-panel" style={{
            padding: "22px 28px",
            background: "linear-gradient(135deg, rgba(59, 82, 154, 0.08), rgba(16, 185, 129, 0.05))",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "var(--primary, #3b529a)",
                  background: "rgba(59, 82, 154, 0.1)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  textTransform: "uppercase"
                }}>
                  Faculty Mentorship Portfolio
                </span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "750",
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.1)",
                  padding: "3px 8px",
                  borderRadius: "6px"
                }}>
                  {spokes.find(s => String(s.id) === String(spokeId))?.name || "Campus Spoke"}
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
                Welcome, {sessionUser?.displayName}
              </h2>
              <p style={{ margin: "6px 0 0 0", fontSize: "13.5px", color: "var(--text-muted)" }}>
                Track assigned corporate projects you are handling, review problem statements, and verify student milestone deliverables.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setActiveView && setActiveView("meetings")}
                className="btn-secondary"
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "750",
                  cursor: "pointer"
                }}
              >
                <FaCalendarAlt size={14} />
                <span>Schedule Meeting</span>
              </button>
              <button
                onClick={() => setActiveView && setActiveView("teams")}
                className="btn-primary"
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  background: "var(--accent, #f97316)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "750",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)"
                }}
              >
                <FaUsers size={14} />
                <span>Create Student Team</span>
              </button>
            </div>
          </div>

          {/* Real-time Notification Alert for Recent Deliverables Awaiting Verification */}
          {spokeSubmissions.filter(s => s.status === "Awaiting Review").length > 0 && (
            <div className="glass-panel" style={{
              padding: "16px 22px",
              background: "linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(239, 68, 68, 0.06))",
              border: "1.5px solid rgba(249, 115, 22, 0.35)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              animation: "fadeIn 0.3s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "rgba(249, 115, 22, 0.2)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0
                }}>
                  <FaBell />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <strong style={{ fontSize: "14.5px", color: "var(--text-main)" }}>
                      Recent Student Deliverables Awaiting Verification
                    </strong>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      color: "#ffffff",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4.5px",
                      boxShadow: "0 1px 3px rgba(220, 38, 38, 0.35)",
                      whiteSpace: "nowrap",
                      lineHeight: 1
                    }}>
                      <span style={{
                        width: "4.5px",
                        height: "4.5px",
                        borderRadius: "50%",
                        background: "#ffffff",
                        display: "inline-block",
                        boxShadow: "0 0 3px #ffffff",
                        flexShrink: 0
                      }} />
                      <span>{spokeSubmissions.filter(s => s.status === "Awaiting Review").length} Pending</span>
                    </span>
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--text-muted)", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
                    {spokeSubmissions.filter(s => s.status === "Awaiting Review").map(s => (
                      <span
                        key={s._id || s.id}
                        onClick={() => {
                          const targetProj = getProjectForSubmission(s) || assignedProjects.find(p => String(p._id || p.id) === String(s.projectId));
                          if (targetProj) setDeliverablesModalProject(targetProj);
                        }}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                        title="Click to view deliverables for this project"
                      >
                        <span>👤</span> <strong>{s.studentName}</strong>: <span style={{ color: "var(--primary)", fontWeight: "700" }}>{s.projectName || getProjectForSubmission(s)?.title || "Project"}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const firstPending = spokeSubmissions.find(s => s.status === "Awaiting Review");
                  if (firstPending) {
                    const targetProj = getProjectForSubmission(firstPending) || assignedProjects.find(p => String(p._id || p.id) === String(firstPending.projectId));
                    if (targetProj) {
                      setDeliverablesModalProject(targetProj);
                      return;
                    }
                  }
                  if (assignedProjects.length > 0) {
                    setDeliverablesModalProject(assignedProjects[0]);
                  }
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "var(--accent, #f97316)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "12.5px",
                  fontWeight: "750",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(249, 115, 22, 0.3)"
                }}
              >
                <span>Review Deliverables →</span>
              </button>
            </div>
          )}

          {/* Quick Metrics Summary */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "14px"
          }}>
            <div className="glass-panel" style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "750", color: "var(--text-muted)", textTransform: "uppercase" }}>Projects Handled</span>
                <FaBriefcase size={16} style={{ color: "#3b82f6" }} />
              </div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)", marginTop: "8px" }}>
                {assignedProjects.length}
              </div>
              <span style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px", display: "block" }}>
                Assigned corporate projects
              </span>
            </div>

            <div className="glass-panel" style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "750", color: "var(--text-muted)", textTransform: "uppercase" }}>Student Teams</span>
                <FaUsers size={16} style={{ color: "#8b5cf6" }} />
              </div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-main)", marginTop: "8px" }}>
                {existingTeams.length}
              </div>
              <span style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px", display: "block" }}>
                Active custom sprint teams
              </span>
            </div>

            <div className="glass-panel" style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "750", color: "var(--text-muted)", textTransform: "uppercase" }}>Pending Deliverables</span>
                <FaClipboardList size={16} style={{ color: "#f59e0b" }} />
              </div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "#f59e0b", marginTop: "8px" }}>
                {spokeSubmissions.filter(s => s.status === "Awaiting Review").length}
              </div>
              <span style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px", display: "block" }}>
                Awaiting your evaluation
              </span>
            </div>

            <div className="glass-panel" style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "750", color: "var(--text-muted)", textTransform: "uppercase" }}>Verified Deliverables</span>
                <FaCheckCircle size={16} style={{ color: "#10b981" }} />
              </div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "#10b981", marginTop: "8px" }}>
                {spokeSubmissions.filter(s => s.status === "Approved").length}
              </div>
              <span style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px", display: "block" }}>
                Approved & graded
              </span>
            </div>
          </div>

          {/* Upcoming Campus Syncs */}
          {meetings.filter(m => m.campusId === String(sessionUser?.spokeId || sessionUser?.campusId || "3")).length > 0 && (
            <div className="glass-panel" style={{ padding: "16px 24px", borderLeft: "4px solid #f59e0b" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaCalendarAlt style={{ color: "#f59e0b" }} /> Upcoming Meetings & Reviews
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {meetings.filter(m => m.campusId === String(sessionUser?.spokeId || sessionUser?.campusId || "3")).map(meet => (
                  <div key={meet.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: "8px" }}>
                    <div>
                      <div style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                        {meet.cadenceType || "General Sync"}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>
                        {meet.title}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--primary)" }}>{meet.time}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{meet.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects You Are Handling (Assigned Projects) */}
          <div className="glass-panel" style={{ padding: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "850", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaBriefcase size={17} style={{ color: "#3b82f6" }} /> Projects You Are Handling
                  <span style={{
                    fontSize: "11.5px",
                    fontWeight: "800",
                    background: "rgba(59, 130, 246, 0.1)",
                    color: "#3b82f6",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    padding: "2px 8px",
                    borderRadius: "6px"
                  }}>
                    {assignedProjects.length}
                  </span>
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
                  Click on any project to view complete specifications, scope, problem statement document, and mentor checklist.
                </p>
              </div>
            </div>

            {assignedProjects.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "16px"
              }}>
                {assignedProjects.map(proj => {
                  const pId = proj._id || proj.id;
                  const assignedTeam = existingTeams.find(t => t.projectId === pId);

                  return (
                    <div
                      key={pId}
                      onClick={() => setProjectDetailsModal(proj)}
                      style={{
                        border: "1px solid var(--border-glass)",
                        borderRadius: "14px",
                        background: "rgba(255, 255, 255, 0.02)",
                        padding: "18px 20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(59, 130, 246, 0.06)";
                        e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.35)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                        e.currentTarget.style.borderColor = "var(--border-glass)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Card Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                          <CompanyLogo company={proj.company} size={36} />
                          <div style={{ minWidth: 0 }}>
                            <span style={{
                              fontSize: "10.5px",
                              fontWeight: "800",
                              color: "var(--primary, #3b529a)",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px"
                            }}>
                              {proj.company || "Enterprise Partner"}
                            </span>
                            <h4 style={{
                              margin: "2px 0 0 0",
                              fontSize: "14.5px",
                              fontWeight: "800",
                              color: "var(--text-main)",
                              lineHeight: "1.3"
                            }}>
                              {proj.title}
                            </h4>
                          </div>
                        </div>

                        {proj.status && (
                          <span style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            background: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            color: "#10b981",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            whiteSpace: "nowrap",
                            textTransform: "uppercase"
                          }}>
                            {proj.status}
                          </span>
                        )}
                      </div>

                      {/* Description Preview */}
                      {proj.description && (
                        <p style={{
                          margin: 0,
                          fontSize: "12.5px",
                          color: "var(--text-muted)",
                          lineHeight: "1.5",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}>
                          {proj.description}
                        </p>
                      )}

                      {/* Metadata row */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                        fontSize: "11.5px",
                        color: "var(--text-muted)",
                        paddingTop: "6px",
                        borderTop: "1px solid var(--border-glass)"
                      }}>
                        {proj.duration && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <FaClock size={11} style={{ color: "#6366f1" }} />
                            <span>{proj.duration}</span>
                          </span>
                        )}
                        {proj.proposedDueDate && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <FaCalendarAlt size={11} style={{ color: "#2563eb" }} />
                            <span>Due: {proj.proposedDueDate}</span>
                          </span>
                        )}
                        {assignedTeam ? (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#8b5cf6",
                            fontWeight: "700"
                          }}>
                            <FaUsers size={11} />
                            <span>Team: {assignedTeam.name}</span>
                          </span>
                        ) : (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "var(--accent, #f97316)",
                            fontWeight: "600",
                            fontSize: "11px"
                          }}>
                            <span>No team assigned yet</span>
                          </span>
                        )}
                      </div>

                      {/* View details, Kanban, and Deliverables buttons */}
                      <div style={{
                        marginTop: "auto",
                        paddingTop: "12px",
                        borderTop: "1px solid var(--border-glass)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "8px"
                      }}>
                        <button
                          type="button"
                          onClick={(e) => handleOpenProjectKanban(proj, e)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "6px",
                            background: "rgba(99, 102, 241, 0.08)",
                            border: "1px solid rgba(99, 102, 241, 0.25)",
                            color: "#6366f1",
                            fontSize: "11px",
                            fontWeight: "750",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            transition: "all 0.15s ease"
                          }}
                          title={`Open Kanban board for ${proj.title}`}
                        >
                          <FaClipboardList size={11} />
                          <span>Project Kanban</span>
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "nowrap" }}>
                          {(() => {
                            const projDeliverables = getDeliverablesForProject(proj);
                            const pendingCount = projDeliverables.filter(d => d.status === "Awaiting Review").length;
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeliverablesModalProject(proj);
                                }}
                                style={{
                                  background: pendingCount > 0 ? "rgba(239, 68, 68, 0.06)" : "rgba(59, 130, 246, 0.05)",
                                  border: pendingCount > 0 ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(59, 130, 246, 0.2)",
                                  borderRadius: "7px",
                                  padding: "4.5px 9px",
                                  fontSize: "11px",
                                  fontWeight: "750",
                                  color: pendingCount > 0 ? "var(--text-main, #0f172a)" : "var(--primary, #3b529a)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                  transition: "all 0.15s ease",
                                  boxShadow: pendingCount > 0 ? "0 1px 3px rgba(239, 68, 68, 0.08)" : "none"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = pendingCount > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.12)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = pendingCount > 0 ? "rgba(239, 68, 68, 0.06)" : "rgba(59, 130, 246, 0.05)";
                                }}
                                title="Click to view deliverables for this project"
                              >
                                <FaClipboardList size={11} style={{ color: pendingCount > 0 ? "#ef4444" : "var(--primary, #3b529a)", flexShrink: 0 }} />
                                <span style={{ whiteSpace: "nowrap" }}>View Deliverables ({projDeliverables.length})</span>
                                {pendingCount > 0 ? (
                                  <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4.5px",
                                    fontSize: "9.5px",
                                    fontWeight: "800",
                                    padding: "2px 7.5px",
                                    borderRadius: "9999px",
                                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                    color: "#ffffff",
                                    boxShadow: "0 1px 3px rgba(220, 38, 38, 0.35)",
                                    whiteSpace: "nowrap",
                                    letterSpacing: "0.2px",
                                    lineHeight: 1
                                  }}>
                                    <span style={{
                                      width: "4.5px",
                                      height: "4.5px",
                                      borderRadius: "50%",
                                      background: "#ffffff",
                                      display: "inline-block",
                                      boxShadow: "0 0 3px #ffffff",
                                      flexShrink: 0
                                    }} />
                                    <span>{pendingCount} Pending</span>
                                  </span>
                                ) : projDeliverables.length > 0 ? (
                                  <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    fontSize: "9.5px",
                                    fontWeight: "800",
                                    padding: "1.5px 6px",
                                    borderRadius: "9999px",
                                    background: "rgba(16, 185, 129, 0.12)",
                                    color: "#059669",
                                    border: "1px solid rgba(16, 185, 129, 0.25)",
                                    whiteSpace: "nowrap",
                                    lineHeight: 1
                                  }}>
                                    <span>✓ Graded</span>
                                  </span>
                                ) : null}
                              </button>
                            );
                          })()}

                          <span style={{
                            fontSize: "11.5px",
                            fontWeight: "750",
                            color: "var(--primary, #3b529a)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            whiteSpace: "nowrap",
                            flexShrink: 0
                          }}>
                            <span>Details</span>
                            <FaChevronRight size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "48px 24px",
                border: "1px dashed var(--border-glass)",
                borderRadius: "14px",
                color: "var(--text-dim)",
                fontSize: "13.5px"
              }}>
                <FaBriefcase size={28} style={{ opacity: 0.35, marginBottom: "8px" }} />
                <p style={{ margin: 0, fontWeight: "700", color: "var(--text-muted)" }}>No projects currently assigned to you.</p>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>
                  Projects allocated by the Central Moderator or Campus Coordinator will appear in this portfolio.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CREATE & MANAGE TEAMS */}
      {currentView === "teams" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Teams Header Banner */}
          <div className="glass-panel" style={{
            padding: "22px 28px",
            background: "linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(99, 102, 241, 0.04))",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "var(--accent, #f97316)",
                  background: "rgba(249, 115, 22, 0.1)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  textTransform: "uppercase"
                }}>
                  Team Operations
                </span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "750",
                  color: "#6366f1",
                  background: "rgba(99, 102, 241, 0.1)",
                  padding: "3px 8px",
                  borderRadius: "6px"
                }}>
                  {existingTeams.length} Active Teams
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
                Create & Manage Student Teams
              </h2>
              <p style={{ margin: "6px 0 0 0", fontSize: "13.5px", color: "var(--text-muted)" }}>
                Assemble student sprint teams for assigned projects, designate team leaders, and evaluate final team milestones.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={() => setActiveView && setActiveView("dashboard")}
                className="btn-secondary"
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "750"
                }}
              >
                <FaChartPie size={14} />
                <span>Back to Overview</span>
              </button>
            </div>
          </div>

          {/* Teams Stack: Full-Width Form on Top, Full-Width Managed Teams Below */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
            
            {/* Form a Student Sprint Team (Full Width) */}
            <div className="glass-panel" style={{ padding: "26px 28px", width: "100%", borderRadius: "16px", position: "relative", zIndex: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "850", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaPlus size={16} style={{ color: "var(--primary)" }} /> Form a Student Sprint Team
                  </h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
                    Assemble student sprint teams for assigned projects, designate team leaders, and configure mentor guidance.
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleCreateTeam} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Row 1: Team Name & Project */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>
                      Team Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. KLE Jetson Edge AI Team A"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="form-input"
                      style={{ width: "100%", padding: "10px 14px", fontSize: "13px" }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>
                      Select Project *
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="form-input"
                      style={{ width: "100%", padding: "10px 14px", fontSize: "13px" }}
                      required
                    >
                      <option value="">-- Choose Project --</option>
                      {assignedProjects.map(proj => (
                        <option key={proj._id || proj.id} value={proj._id || proj.id}>
                          [{proj.company}] {proj.title}
                        </option>
                      ))}
                    </select>
                    {assignedProjects.length === 0 && (
                      <span style={{ fontSize: "11.5px", color: "#ef4444", marginTop: "4px", display: "block" }}>
                        No projects have been assigned to you yet.
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: Select Student Developers Dropdown */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Select Student Developers *
                    </label>
                    {selectedStudentIds.length > 0 && (
                      <span style={{
                        fontSize: "10.5px",
                        fontWeight: "800",
                        color: "var(--primary)",
                        background: "rgba(99, 102, 241, 0.12)",
                        padding: "2px 8px",
                        borderRadius: "6px"
                      }}>
                        {selectedStudentIds.length} Selected
                      </span>
                    )}
                  </div>
                  
                  {/* Dropdown Trigger */}
                  <div
                    onClick={() => setIsStudentDropdownOpen(prev => !prev)}
                    className="form-input"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      userSelect: "none",
                      boxSizing: "border-box",
                      border: isStudentDropdownOpen ? "1px solid var(--primary)" : "1px solid var(--border-glass)",
                      borderRadius: isStudentDropdownOpen ? "8px 8px 0 0" : "8px",
                      background: isStudentDropdownOpen ? "rgba(99, 102, 241, 0.04)" : undefined,
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                      {selectedStudentIds.length === 0 ? (
                        <span style={{ color: "var(--text-dim)" }}>-- Click to Choose Student Developers --</span>
                      ) : (
                        <span style={{ color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "650" }}>
                          {selectedStudentsObjects.map(s => s.displayName).join(", ")}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "10px" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "750",
                        color: isStudentDropdownOpen ? "var(--primary)" : "var(--text-dim)",
                        background: isStudentDropdownOpen ? "rgba(99, 102, 241, 0.12)" : "rgba(255,255,255,0.04)",
                        padding: "2px 8px",
                        borderRadius: "4px"
                      }}>
                        {isStudentDropdownOpen ? "Collapse ▲" : "Expand ▼"}
                      </span>
                      <FaChevronDown
                        size={12}
                        style={{
                          color: "var(--text-muted)",
                          transition: "transform 0.2s ease",
                          transform: isStudentDropdownOpen ? "rotate(180deg)" : "rotate(0deg)"
                        }}
                      />
                    </div>
                  </div>

                  {/* Expanded Dropdown Panel (In Normal Flow - Never covers other fields or clips behind other cards) */}
                  {isStudentDropdownOpen && (
                    <div
                      style={{
                        background: "var(--bg-card, #1e293b)",
                        border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.15))",
                        borderTop: "none",
                        borderRadius: "0 0 10px 10px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                        padding: "12px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}
                    >
                      {/* Top Action Bar */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "2px 4px 10px 4px",
                        borderBottom: "1px solid var(--border-glass)",
                        flexWrap: "wrap",
                        gap: "8px"
                      }}>
                        <span style={{ fontSize: "11px", fontWeight: "750", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {selectedStudentIds.length} of {students.length} Selected
                        </span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentIds(students.map(s => s.accountId));
                            }}
                            style={{
                              background: "rgba(99, 102, 241, 0.12)",
                              border: "1px solid rgba(99, 102, 241, 0.25)",
                              color: "var(--primary)",
                              fontSize: "10.5px",
                              fontWeight: "750",
                              cursor: "pointer",
                              padding: "4px 10px",
                              borderRadius: "4px"
                            }}
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentIds([]);
                              setTeamLeaderId("");
                            }}
                            style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "#ef4444",
                              fontSize: "10.5px",
                              fontWeight: "750",
                              cursor: "pointer",
                              padding: "4px 10px",
                              borderRadius: "4px"
                            }}
                          >
                            Clear All
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsStudentDropdownOpen(false);
                            }}
                            style={{
                              background: "rgba(16, 185, 129, 0.12)",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              color: "#10b981",
                              fontSize: "10.5px",
                              fontWeight: "750",
                              cursor: "pointer",
                              padding: "4px 10px",
                              borderRadius: "4px"
                            }}
                          >
                            Done ✓
                          </button>
                        </div>
                      </div>

                      {/* Search Filter */}
                      {students.length > 5 && (
                        <div>
                          <input
                            type="text"
                            placeholder="Filter students by name or email..."
                            value={studentSearchQuery}
                            onChange={(e) => setStudentSearchQuery(e.target.value)}
                            className="form-input"
                            style={{
                              width: "100%",
                              padding: "7px 12px",
                              fontSize: "12px",
                              borderRadius: "6px",
                              background: "rgba(255, 255, 255, 0.04)"
                            }}
                          />
                        </div>
                      )}

                      {/* Scrollable Students Grid List */}
                      <div style={{
                        maxHeight: "260px",
                        overflowY: "auto",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "8px",
                        paddingRight: "4px"
                      }}>
                        {filteredStudents.map(student => {
                          const isSelected = selectedStudentIds.includes(student.accountId);
                          return (
                            <div
                              key={student.accountId}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStudentCheckboxChange(student.accountId);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
                                padding: "10px 14px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                background: isSelected ? "rgba(99, 102, 241, 0.12)" : "rgba(255, 255, 255, 0.02)",
                                border: isSelected ? "1.5px solid rgba(99, 102, 241, 0.45)" : "1px solid var(--border-glass)",
                                transition: "all 0.15s ease"
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                style={{ marginTop: "3px", cursor: "pointer", pointerEvents: "none", accentColor: "var(--primary)" }}
                              />
                              <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1, gap: "2px" }}>
                                <span style={{
                                  fontSize: "13px",
                                  fontWeight: isSelected ? "800" : "650",
                                  color: isSelected ? "var(--primary)" : "var(--text-main)",
                                  lineHeight: 1.3
                                }}>
                                  {student.displayName}
                                </span>
                                <span style={{
                                  fontSize: "11.5px",
                                  color: isSelected ? "var(--primary)" : "var(--text-dim)",
                                  lineHeight: 1.3,
                                  wordBreak: "break-all"
                                }}>
                                  {student.emailAddress}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {filteredStudents.length === 0 && (
                          <div style={{ padding: "14px", textAlign: "center", color: "var(--text-dim)", fontSize: "12px", fontStyle: "italic", gridColumn: "1 / -1" }}>
                            {students.length === 0 ? "No students found in your campus spoke." : "No students matching filter."}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 3: Co-Mentor & Leader */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>
                      Co-Faculty Mentor (Optional)
                    </label>
                    <select
                      value={subMentorId}
                      onChange={(e) => setSubMentorId(e.target.value)}
                      className="form-input"
                      style={{ width: "100%", padding: "10px 14px", fontSize: "13px" }}
                    >
                      <option value="">-- Select Co-Mentor --</option>
                      {subMentorOptions.map(m => (
                        <option key={m.accountId} value={m.accountId}>{m.displayName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>
                      Team Leader *
                    </label>
                    <select
                      value={teamLeaderId}
                      onChange={(e) => setTeamLeaderId(e.target.value)}
                      className="form-input"
                      style={{ width: "100%", padding: "10px 14px", fontSize: "13px" }}
                      required
                    >
                      <option value="">-- Designate Leader --</option>
                      {selectedStudentsObjects.map(s => (
                        <option key={s.accountId} value={s.accountId}>{s.displayName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                  <button
                    type="submit"
                    disabled={isCreatingTeam}
                    className="btn-primary"
                    style={{
                      padding: "11px 32px",
                      background: "var(--accent, #f97316)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      fontWeight: "750",
                      fontSize: "13.5px",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)"
                    }}
                  >
                    {isCreatingTeam ? "Creating Student Team..." : "Create Student Team"}
                  </button>
                </div>
              </form>
            </div>

            {/* Managed Student Teams (Full Width Below) */}
            <div className="glass-panel" style={{ padding: "26px 28px", width: "100%", borderRadius: "16px", position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "850", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaUsers size={18} style={{ color: "#8b5cf6" }} /> Managed Student Teams
                    <span style={{
                      fontSize: "11.5px",
                      fontWeight: "800",
                      background: "rgba(139, 92, 246, 0.1)",
                      color: "#8b5cf6",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                      padding: "2px 8px",
                      borderRadius: "6px"
                    }}>
                      {existingTeams.length}
                    </span>
                  </h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
                    Active project teams, assigned project links, GitHub spaces, and final milestone submissions.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {existingTeams.map(team => {
                  const linkedProj = assignedProjects.find(p => p._id === team.projectId || p.id === team.projectId);
                  return (
                    <div key={team._id || team.id} style={{
                      padding: "18px",
                      background: "rgba(255,255,255,0.015)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: "850", color: "var(--text-main)" }}>
                          {team.name}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {linkedProj && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenProjectKanban(linkedProj, e)}
                              style={{
                                background: "rgba(99, 102, 241, 0.08)",
                                border: "1px solid rgba(99, 102, 241, 0.25)",
                                borderRadius: "6px",
                                color: "#6366f1",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "750",
                                padding: "4px 10px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px"
                              }}
                              title={`Open Kanban board for ${linkedProj.title}`}
                            >
                              <FaClipboardList size={11} />
                              <span>Project Board</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (setActiveView) setActiveView("meetings");
                            }}
                            style={{
                              background: "rgba(249, 115, 22, 0.08)",
                              border: "1px solid rgba(249, 115, 22, 0.25)",
                              borderRadius: "6px",
                              color: "var(--accent, #f97316)",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: "750",
                              padding: "4px 10px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px"
                            }}
                            title={`Schedule sync meeting for team ${team.name}`}
                          >
                            <FaCalendarAlt size={11} />
                            <span>Schedule Sync</span>
                          </button>
                          <button
                            onClick={() => handleDisbandTeam(team._id || team.id)}
                            style={{
                              background: "rgba(239, 68, 68, 0.08)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              borderRadius: "6px",
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: "750",
                              padding: "4px 8px"
                            }}
                          >
                            Disband Team
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                        Project: <strong style={{ color: "var(--text-main)" }}>{linkedProj ? linkedProj.title : "Unresolved Project"}</strong>
                      </div>
                      {team.githubRepo && (
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          GitHub Space: <a href={team.githubRepo} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: "700" }}>{team.githubRepo}</a>
                        </div>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11.5px" }}>
                        <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.01)", borderRadius: "6px", border: "1px solid var(--border-glass)" }}>
                          <span style={{ color: "var(--text-muted)", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: "750" }}>Team Leader</span>
                          <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{team.teamLeader?.displayName || "N/A"}</span>
                        </div>
                        <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.01)", borderRadius: "6px", border: "1px solid var(--border-glass)" }}>
                          <span style={{ color: "var(--text-muted)", display: "block", fontSize: "10px", textTransform: "uppercase", fontWeight: "750" }}>Co-Faculty Mentor</span>
                          <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{team.subMentor?.displayName || "None"}</span>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "750", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Cohort Members:</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
                          {team.members?.map(m => (
                            <span key={m.accountId} style={{
                              fontSize: "11px",
                              padding: "4px 8px",
                              background: "rgba(99, 102, 241, 0.08)",
                              color: "var(--primary)",
                              border: "1px solid rgba(99, 102, 241, 0.15)",
                              borderRadius: "6px"
                            }}>
                              {m.displayName}
                            </span>
                          ))}
                        </div>
                      </div>

                      {team.finalProgress && team.finalProgress.status !== "Pending" ? (
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px", fontSize: "12px" }}>
                          <span style={{ fontSize: "10.5px", fontWeight: "750", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Final Work Progress</span>
                          <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div>
                              Report URL: <a href={team.finalProgress.reportUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: "600" }}>{team.finalProgress.reportUrl}</a>
                            </div>
                            {team.finalProgress.facultyComments && (
                              <div style={{ color: "var(--text-muted)" }}>Comments: <em>"{team.finalProgress.facultyComments}"</em></div>
                            )}
                            {team.finalProgress.grade && (
                              <div style={{ color: "var(--text-muted)" }}>Assigned Grade: <strong style={{ color: "var(--accent)" }}>{team.finalProgress.grade}</strong></div>
                            )}
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px" }}>
                              Status: 
                              <span style={{
                                fontSize: "9px",
                                fontWeight: "900",
                                background: team.finalProgress.status === "Evaluated" ? "rgba(45, 212, 191, 0.08)" : "rgba(251, 146, 60, 0.08)",
                                color: team.finalProgress.status === "Evaluated" ? "#2dd4bf" : "var(--accent)",
                                border: team.finalProgress.status === "Evaluated" ? "1px solid rgba(45, 212, 191, 0.2)" : "1px solid rgba(251, 146, 60, 0.2)",
                                padding: "2px 6px",
                                borderRadius: "3px",
                                textTransform: "uppercase"
                              }}>{team.finalProgress.status}</span>
                            </div>
                            {team.finalProgress.status === "Evaluated" && (
                              <div style={{
                                background: "rgba(45, 212, 191, 0.03)",
                                borderLeft: "3px solid #2dd4bf",
                                padding: "8px 10px",
                                borderRadius: "0 6px 6px 0",
                                marginTop: "6px"
                              }}>
                                <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-main)" }}>
                                  Rating: {Array.from({ length: team.finalProgress.rating }).map((_, i) => (
                                    <span key={i} style={{ color: "#fbbf24" }}>★</span>
                                  ))} ({team.finalProgress.rating}/5)
                                </div>
                                {team.finalProgress.companyGrade && (
                                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                                    Project Grade: <strong style={{ color: "var(--accent)" }}>{team.finalProgress.companyGrade}</strong>
                                  </div>
                                )}
                                {team.finalProgress.companyFeedback && (
                                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                                    Feedback: <strong>{team.finalProgress.companyFeedback}</strong>
                                  </div>
                                )}
                                <span style={{ fontSize: "9.5px", color: "var(--text-dim)", display: "block", marginTop: "4px" }}>Reviewed by {team.finalProgress.evaluatedBy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px" }}>
                          <button
                            onClick={() => handleSubmitFinalProgressClick(team._id || team.id)}
                            style={{
                              padding: "7px 12px",
                              background: "rgba(249, 115, 22, 0.08)",
                              border: "1px solid rgba(249, 115, 22, 0.2)",
                              borderRadius: "6px",
                              color: "var(--accent)",
                              fontSize: "11.5px",
                              fontWeight: "750",
                              cursor: "pointer",
                              width: "100%",
                              textAlign: "center"
                            }}
                          >
                            Submit Final Work Progress
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {existingTeams.length === 0 && (
                  <div style={{
                    padding: "36px 20px",
                    textAlign: "center",
                    color: "var(--text-dim)",
                    border: "1px dashed var(--border-glass)",
                    borderRadius: "12px",
                    fontSize: "13px"
                  }}>
                    <FaUsers size={24} style={{ opacity: 0.35, marginBottom: "6px" }} />
                    <p style={{ margin: 0, fontWeight: "700", color: "var(--text-muted)" }}>No student sprint teams created yet.</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "11.5px" }}>Use the form above to assemble and launch your first team.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 3: STUDENT VERIFICATIONS */}
      {currentView === "student-approvals" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Header Banner */}
          <div className="glass-panel" style={{
            padding: "22px 28px",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 82, 154, 0.05))",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.1)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  textTransform: "uppercase"
                }}>
                  Campus Spoke Security & Verification
                </span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  background: pendingStudentsList.length > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                  color: pendingStudentsList.length > 0 ? "#ef4444" : "#10b981",
                  padding: "3px 8px",
                  borderRadius: "6px"
                }}>
                  {pendingStudentsList.length} Pending
                </span>
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                Student Registration Verifications
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                Review and approve newly registered students for your campus spoke before granting workspace access.
              </p>
            </div>

            <button
              onClick={fetchPendingStudents}
              className="btn-secondary"
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "12.5px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <FaSyncAlt size={12} className={isPendingStudentsLoading ? "pulse-glow" : ""} />
              <span>Refresh Queue</span>
            </button>
          </div>

          {/* Pending Students List or Empty State */}
          {isPendingStudentsLoading ? (
            <div className="glass-panel" style={{ padding: "48px", textAlign: "center", borderRadius: "14px" }}>
              <FaSyncAlt size={24} className="pulse-glow" style={{ color: "var(--primary)", animation: "pulseGlow 1.5s infinite linear" }} />
              <p style={{ marginTop: "12px", color: "var(--text-muted)", fontSize: "14px" }}>Loading pending student registrations...</p>
            </div>
          ) : pendingStudentsList.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pendingStudentsList.map(student => (
                <div
                  key={student.id}
                  className="glass-panel"
                  style={{
                    padding: "18px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                    borderRadius: "14px",
                    border: "1px solid var(--border-glass)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "800"
                    }}>
                      {student.displayName ? student.displayName[0].toUpperCase() : "S"}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>{student.displayName}</strong>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "rgba(245, 158, 11, 0.12)",
                          color: "#f59e0b",
                          border: "1px solid rgba(245, 158, 11, 0.25)"
                        }}>
                          Pending Verification
                        </span>
                      </div>
                      <div style={{ fontSize: "12.5px", color: "var(--text-muted)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        <span>📧 {student.email}</span>
                        <span>📅 Registered: {new Date(student.createdAt).toLocaleDateString()}</span>
                        <span>🎓 Role: Student Developer</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => handleRejectStudent(student.id, student.displayName)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        background: "rgba(239, 68, 68, 0.08)",
                        color: "#ef4444",
                        fontWeight: "750",
                        fontSize: "12.5px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <FaUserX /> Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveStudent(student.id, student.displayName)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#10b981",
                        color: "#ffffff",
                        fontWeight: "750",
                        fontSize: "12.5px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <FaUserCheck /> Verify & Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: "48px 24px", textAlign: "center", borderRadius: "14px" }}>
              <div style={{ fontSize: "36px", color: "#10b981", marginBottom: "12px" }}>
                <FaUserCheck />
              </div>
              <h4 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", margin: "0 0 6px" }}>
                No Pending Student Registrations
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
                All student accounts for your campus spoke have been verified and activated.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Project Details Popup Screen Modal (Almost Full Screen - Theme Adaptive) */}
      {projectDetailsModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setProjectDetailsModal(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box"
          }}
        >
          <div
            className="fade-in"
            style={{
              background: "var(--bg-card, #ffffff)",
              border: "1px solid var(--border-subtle, #e2e8f0)",
              borderRadius: "20px",
              width: "95vw",
              maxWidth: "1400px",
              height: "92vh",
              maxHeight: "94vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.2), 0 2px 10px rgba(0, 0, 0, 0.06)",
              animation: "fadeIn 0.2s ease-out",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{
              padding: "20px 32px",
              borderBottom: "1px solid var(--border-subtle, #e2e8f0)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              background: "var(--bg-card, #ffffff)",
              flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                <CompanyLogo company={projectDetailsModal.company} size={46} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "var(--primary, #3b529a)",
                      background: "rgba(59, 82, 154, 0.08)",
                      border: "1px solid rgba(59, 82, 154, 0.2)",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      {projectDetailsModal.company || "Industry Partner"}
                    </span>
                    {projectDetailsModal.status && (
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "750",
                        padding: "3px 10px",
                        borderRadius: "6px",
                        background: "rgba(249, 115, 22, 0.1)",
                        border: "1px solid rgba(249, 115, 22, 0.25)",
                        color: "#ea580c"
                      }}>
                        Status: {projectDetailsModal.status}
                      </span>
                    )}
                  </div>
                  <h2 style={{
                    margin: "4px 0 0 0",
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "var(--text-main, #0f172a)",
                    wordBreak: "break-word"
                  }}>
                    {projectDetailsModal.title}
                  </h2>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    const proj = projectDetailsModal;
                    setProjectDetailsModal(null);
                    handleOpenProjectKanban(proj, e);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    color: "#6366f1",
                    fontSize: "12.5px",
                    fontWeight: "750",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
                  }}
                  title="Open Kanban board for this specific project"
                >
                  <FaClipboardList size={13} />
                  <span>Open Project Kanban</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProjectDetailsModal(null)}
                  style={{
                    background: "var(--bg-content, #f8fafc)",
                    border: "1px solid var(--border-subtle, #e2e8f0)",
                    color: "var(--text-muted, #475569)",
                    cursor: "pointer",
                    borderRadius: "10px",
                    width: "38px",
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s ease"
                  }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-content, #f8fafc)";
                  e.currentTarget.style.color = "var(--text-muted, #475569)";
                }}
                title="Close modal"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>

            {/* Scrollable Content Body */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "28px 32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              background: "var(--bg-content, #f8fafc)"
            }}>
              {/* Metric Cards Banner */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px"
              }}>
                <div style={{
                  padding: "16px 20px",
                  background: "var(--bg-card, #ffffff)",
                  border: "1px solid var(--border-subtle, #e2e8f0)",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                }}>
                  <span style={{ fontSize: "11px", fontWeight: "750", color: "var(--text-muted, #475569)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaCalendarAlt size={12} style={{ color: "#2563eb" }} /> Target Deadline
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                    {projectDetailsModal.proposedDueDate || "Not specified"}
                  </span>
                </div>

                <div style={{
                  padding: "16px 20px",
                  background: "var(--bg-card, #ffffff)",
                  border: "1px solid var(--border-subtle, #e2e8f0)",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                }}>
                  <span style={{ fontSize: "11px", fontWeight: "750", color: "var(--text-muted, #475569)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaClock size={12} style={{ color: "#6366f1" }} /> Sprint Duration
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "800", color: "#6366f1" }}>
                    {projectDetailsModal.duration || "N/A"}
                  </span>
                </div>

                <div style={{
                  padding: "16px 20px",
                  background: "var(--bg-card, #ffffff)",
                  border: "1px solid var(--border-subtle, #e2e8f0)",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                }}>
                  <span style={{ fontSize: "11px", fontWeight: "750", color: "var(--text-muted, #475569)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaBuilding size={12} style={{ color: "#ea580c" }} /> Sponsoring Enterprise
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                    {projectDetailsModal.company || "Industry Partner"}
                  </span>
                </div>
              </div>

              {/* Two Column Layout for Scope & Attachments */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2.3fr) minmax(0, 1.2fr)",
                gap: "24px",
                alignItems: "start"
              }}>
                {/* Left Column: Full Description & Scope */}
                <div style={{
                  background: "var(--bg-card, #ffffff)",
                  border: "1px solid var(--border-subtle, #e2e8f0)",
                  borderRadius: "14px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
                }}>
                  <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "var(--text-main, #0f172a)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaBriefcase size={16} style={{ color: "var(--primary, #3b529a)" }} /> Project Scope & Implementation Requirements
                  </h3>
                  <div style={{
                    fontSize: "14px",
                    lineHeight: "1.75",
                    color: "var(--text-main, #0f172a)",
                    whiteSpace: "pre-wrap",
                    padding: "18px 20px",
                    background: "var(--bg-content, #f8fafc)",
                    border: "1px solid var(--border-subtle, #e2e8f0)",
                    borderRadius: "10px"
                  }}>
                    {projectDetailsModal.description || "No detailed description provided for this project."}
                  </div>
                </div>

                {/* Submitted Milestone Deliverables for this Project */}
                {(() => {
                  const projDeliverables = getDeliverablesForProject(projectDetailsModal);
                  const pendingDeliverables = projDeliverables.filter(d => d.status === "Awaiting Review");

                  return (
                    <div style={{
                      background: "var(--bg-card, #ffffff)",
                      border: "1px solid var(--border-subtle, #e2e8f0)",
                      borderRadius: "14px",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "var(--text-main, #0f172a)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <FaClipboardList size={16} style={{ color: "var(--accent, #f97316)" }} /> Project Milestone Deliverables
                        </h3>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "3px 9px",
                          borderRadius: "6px",
                          background: pendingDeliverables.length > 0 ? "rgba(249, 115, 22, 0.12)" : "rgba(16, 185, 129, 0.12)",
                          color: pendingDeliverables.length > 0 ? "var(--accent, #f97316)" : "#10b981",
                          border: pendingDeliverables.length > 0 ? "1px solid rgba(249, 115, 22, 0.25)" : "1px solid rgba(16, 185, 129, 0.25)"
                        }}>
                          {projDeliverables.length} Total {pendingDeliverables.length > 0 ? `(${pendingDeliverables.length} Awaiting Review)` : "Verified"}
                        </span>
                      </div>

                      {projDeliverables.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {projDeliverables.map(del => {
                            const isPending = del.status === "Awaiting Review";
                            return (
                              <div
                                key={del._id || del.id}
                                style={{
                                  padding: "12px 16px",
                                  background: "var(--bg-content, #f8fafc)",
                                  borderRadius: "10px",
                                  border: isPending ? "1.5px solid rgba(249, 115, 22, 0.35)" : "1px solid var(--border-subtle, #e2e8f0)",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "12px"
                                }}
                              >
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <strong style={{ fontSize: "13.5px", color: "var(--text-main, #0f172a)" }}>
                                      {del.studentName}
                                    </strong>
                                    <span style={{ fontSize: "11px", color: "var(--primary, #3b529a)", fontFamily: "var(--mono)", fontWeight: "700" }}>
                                      Sprint Task #{del.taskId}
                                    </span>
                                    <span style={{
                                      fontSize: "10px",
                                      fontWeight: "800",
                                      padding: "2px 7px",
                                      borderRadius: "4px",
                                      background: del.status === "Approved" ? "rgba(45, 212, 191, 0.12)" : del.status === "Re-work Requested" ? "rgba(239, 68, 68, 0.12)" : "rgba(249, 115, 22, 0.12)",
                                      color: del.status === "Approved" ? "#2dd4bf" : del.status === "Re-work Requested" ? "#ef4444" : "var(--accent, #f97316)",
                                      border: del.status === "Approved" ? "1px solid rgba(45, 212, 191, 0.25)" : del.status === "Re-work Requested" ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(249, 115, 22, 0.25)"
                                    }}>
                                      {del.status}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                    <a
                                      href={del.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        fontSize: "12px",
                                        color: "var(--primary, #3b529a)",
                                        fontWeight: "750",
                                        textDecoration: "none",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "5px"
                                      }}
                                    >
                                      <FaLink size={12} />
                                      <span>{del.fileName}</span>
                                    </a>
                                    {del.comments && (
                                      <span style={{ fontSize: "11.5px", color: "var(--text-muted, #475569)", fontStyle: "italic" }}>
                                        "{del.comments}"
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  {isPending ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEvalModal({
                                            isOpen: true,
                                            type: "approve",
                                            submission: del,
                                            grade: del.grade || "A",
                                            feedback: "Meets all FIP criteria. Excellent work!"
                                          });
                                        }}
                                        style={{
                                          padding: "6px 14px",
                                          background: "rgba(45, 212, 191, 0.15)",
                                          border: "1px solid rgba(45, 212, 191, 0.35)",
                                          borderRadius: "6px",
                                          color: "#2dd4bf",
                                          fontSize: "11.5px",
                                          fontWeight: "800",
                                          cursor: "pointer"
                                        }}
                                      >
                                        Approve & Grade
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEvalModal({
                                            isOpen: true,
                                            type: "rework",
                                            submission: del,
                                            grade: "",
                                            feedback: "Re-work required: please refine your layout controller and revise task artifacts."
                                          });
                                        }}
                                        style={{
                                          padding: "6px 14px",
                                          background: "rgba(239, 68, 68, 0.15)",
                                          border: "1px solid rgba(239, 68, 68, 0.35)",
                                          borderRadius: "6px",
                                          color: "#ef4444",
                                          fontSize: "11.5px",
                                          fontWeight: "800",
                                          cursor: "pointer"
                                        }}
                                      >
                                        Flag Re-work
                                      </button>
                                    </>
                                  ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <span style={{ fontSize: "12px", fontWeight: "800", color: "#10b981" }}>
                                        Grade: {del.grade || "Approved"}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{
                          padding: "24px 16px",
                          textAlign: "center",
                          color: "var(--text-muted, #475569)",
                          background: "var(--bg-content, #f8fafc)",
                          border: "1px dashed var(--border-subtle, #e2e8f0)",
                          borderRadius: "10px",
                          fontSize: "12.5px"
                        }}>
                          No milestone deliverables submitted for this project yet.
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Right Column: Problem Statement Document & Mentor Guidance */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Problem Statement Card */}
                  <div style={{
                    background: "var(--bg-card, #ffffff)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                    borderRadius: "14px",
                    padding: "22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "rgba(99, 102, 241, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#6366f1"
                      }}>
                        <FaLink size={16} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                          Problem Statement
                        </h4>
                        <span style={{ fontSize: "11.5px", color: "var(--text-muted, #475569)" }}>
                          External specification & requirements
                        </span>
                      </div>
                    </div>

                    {projectDetailsModal.problemStatementUrl ? (
                      <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted, #475569)", lineHeight: "1.5" }}>
                          Click the link below to review official problem statements and project guidelines.
                        </p>
                        <a
                          href={projectDetailsModal.problemStatementUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #3b529a, #6366f1)",
                            color: "#fff",
                            fontSize: "12.5px",
                            fontWeight: "750",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: "0 4px 14px rgba(59, 82, 154, 0.25)",
                            marginTop: "4px"
                          }}
                        >
                          <span>Open Problem Statement</span>
                          <FaChevronRight size={12} />
                        </a>
                      </div>
                    ) : (
                      <div style={{ fontSize: "12px", color: "var(--text-dim, #94a3b8)", fontStyle: "italic", marginTop: "4px" }}>
                        No external document link provided for this project.
                      </div>
                    )}
                  </div>

                  {/* Mentor Allocation Quick Checklist */}
                  <div style={{
                    background: "var(--bg-card, #ffffff)",
                    border: "1px solid var(--border-subtle, #e2e8f0)",
                    borderRadius: "14px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
                  }}>
                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "var(--text-main, #0f172a)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Mentor Checklist
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--text-muted, #475569)", lineHeight: "1.7" }}>
                      <li>Ensure a student team leader is designated.</li>
                      <li>Allocate Co-Faculty Mentor if additional support is needed.</li>
                      <li>Review weekly sprint deliverables against these project requirements.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: "16px 32px",
              borderTop: "1px solid var(--border-subtle, #e2e8f0)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--bg-card, #ffffff)",
              flexShrink: 0
            }}>
              <span style={{ fontSize: "12px", color: "var(--text-dim, #94a3b8)" }}>
                Click anywhere outside or press Close to return to your dashboard.
              </span>
              <button
                type="button"
                onClick={() => setProjectDetailsModal(null)}
                style={{
                  padding: "9px 24px",
                  borderRadius: "8px",
                  background: "var(--primary, #3b529a)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "12.5px",
                  fontWeight: "750",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(59, 82, 154, 0.25)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Project Deliverables Modal */}
      {deliverablesModalProject && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeliverablesModalProject(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box"
          }}
        >
          <div
            className="fade-in"
            style={{
              background: "var(--bg-card, #ffffff)",
              border: "1px solid var(--border-subtle, #e2e8f0)",
              borderRadius: "18px",
              width: "92vw",
              maxWidth: "850px",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: "20px 26px",
              borderBottom: "1px solid var(--border-subtle, #e2e8f0)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              background: "var(--bg-card, #ffffff)",
              flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                <CompanyLogo company={deliverablesModalProject.company} size={42} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "var(--primary, #3b529a)",
                      background: "rgba(59, 82, 154, 0.08)",
                      border: "1px solid rgba(59, 82, 154, 0.2)",
                      padding: "2px 8px",
                      borderRadius: "5px",
                      textTransform: "uppercase"
                    }}>
                      {deliverablesModalProject.company || "Industry Partner"}
                    </span>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "750",
                      color: "var(--accent, #f97316)",
                      background: "rgba(249, 115, 22, 0.1)",
                      padding: "2px 8px",
                      borderRadius: "5px"
                    }}>
                      Project Deliverables
                    </span>
                  </div>
                  <h3 style={{
                    margin: "4px 0 0 0",
                    fontSize: "17px",
                    fontWeight: "800",
                    color: "var(--text-main, #0f172a)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "540px"
                  }}>
                    {deliverablesModalProject.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeliverablesModalProject(null)}
                style={{
                  background: "var(--bg-content, #f8fafc)",
                  border: "1px solid var(--border-subtle, #e2e8f0)",
                  color: "var(--text-muted, #475569)",
                  cursor: "pointer",
                  borderRadius: "8px",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
                title="Close"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 26px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              background: "var(--bg-content, #f8fafc)"
            }}>
              {(() => {
                const projDeliverables = getDeliverablesForProject(deliverablesModalProject);
                const pendingDeliverables = projDeliverables.filter(d => d.status === "Awaiting Review");
                const assignedTeam = existingTeams.find(t => String(t.projectId) === String(deliverablesModalProject._id || deliverablesModalProject.id));

                return (
                  <>
                    {/* Summary Row */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                      padding: "12px 18px",
                      background: "var(--bg-card, #ffffff)",
                      border: "1px solid var(--border-subtle, #e2e8f0)",
                      borderRadius: "12px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "750", color: "var(--text-main)" }}>
                          Deliverables Portfolio
                        </span>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: pendingDeliverables.length > 0 ? "rgba(249, 115, 22, 0.12)" : "rgba(16, 185, 129, 0.12)",
                          color: pendingDeliverables.length > 0 ? "var(--accent)" : "#10b981"
                        }}>
                          {projDeliverables.length} Total ({pendingDeliverables.length} Pending Evaluation)
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {assignedTeam && (
                          <span style={{ fontSize: "12px", color: "#8b5cf6", fontWeight: "750", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <FaUsers size={12} />
                            <span>Team: {assignedTeam.name}</span>
                          </span>
                        )}
                        {pendingDeliverables.length > 0 && typeof handleRunAiVerificationSweep === "function" && (
                          <button
                            type="button"
                            onClick={handleRunAiVerificationSweep}
                            style={{
                              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                              color: "#fff",
                              border: "none",
                              padding: "5px 12px",
                              borderRadius: "7px",
                              fontSize: "11px",
                              fontWeight: "750",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              boxShadow: "0 2px 6px rgba(99, 102, 241, 0.25)"
                            }}
                          >
                            <span>🤖 Run AI Verification Sweep</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Deliverables Cards */}
                    {projDeliverables.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {projDeliverables.map(del => {
                          const isPending = del.status === "Awaiting Review";
                          return (
                            <div
                              key={del._id || del.id}
                              style={{
                                padding: "18px 20px",
                                background: "var(--bg-card, #ffffff)",
                                borderRadius: "12px",
                                border: isPending ? "1.5px solid rgba(249, 115, 22, 0.35)" : "1px solid var(--border-subtle, #e2e8f0)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <div style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    background: "rgba(59, 130, 246, 0.12)",
                                    color: "#3b82f6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "800",
                                    fontSize: "14px"
                                  }}>
                                    {del.studentName ? del.studentName[0].toUpperCase() : "S"}
                                  </div>
                                  <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <strong style={{ fontSize: "14px", color: "var(--text-main, #0f172a)" }}>
                                        {del.studentName}
                                      </strong>
                                      <span style={{ fontSize: "11px", color: "var(--primary, #3b529a)", fontFamily: "var(--mono)", fontWeight: "700" }}>
                                        Task #{del.taskId}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted, #475569)" }}>
                                      Submitted {del.submittedAt ? new Date(del.submittedAt).toLocaleDateString() : "recently"}
                                    </span>
                                  </div>
                                </div>

                                <span style={{
                                  fontSize: "10.5px",
                                  fontWeight: "850",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  background: del.status === "Approved" ? "rgba(45, 212, 191, 0.12)" : del.status === "Re-work Requested" ? "rgba(239, 68, 68, 0.12)" : "rgba(249, 115, 22, 0.12)",
                                  color: del.status === "Approved" ? "#2dd4bf" : del.status === "Re-work Requested" ? "#ef4444" : "var(--accent)",
                                  border: del.status === "Approved" ? "1px solid rgba(45, 212, 191, 0.25)" : del.status === "Re-work Requested" ? "1px solid rgba(239, 68, 68, 0.25)" : "1px solid rgba(249, 115, 22, 0.25)"
                                }}>
                                  {del.status}
                                </span>
                              </div>

                              {/* Artifact Link & Note */}
                              <div style={{
                                padding: "10px 14px",
                                background: "var(--bg-content, #f8fafc)",
                                borderRadius: "8px",
                                border: "1px solid var(--border-subtle, #e2e8f0)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "10px"
                              }}>
                                <a
                                  href={del.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: "12.5px",
                                    color: "var(--primary, #3b529a)",
                                    fontWeight: "750",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px"
                                  }}
                                >
                                  <FaLink size={12} />
                                  <span>{del.fileName}</span>
                                </a>
                                {del.comments && (
                                  <span style={{ fontSize: "12px", color: "var(--text-muted, #475569)", fontStyle: "italic" }}>
                                    "{del.comments}"
                                  </span>
                                )}
                              </div>

                              {/* Feedback and Grade */}
                              {del.grade && (
                                <div style={{ fontSize: "12px", color: "var(--text-muted, #475569)" }}>
                                  Grade Assigned: <strong style={{ color: "#10b981", fontSize: "13px" }}>{del.grade}</strong>
                                </div>
                              )}

                              {/* Evaluation Actions */}
                              {isPending ? (
                                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid var(--border-subtle, #e2e8f0)", paddingTop: "12px" }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEvalModal({
                                        isOpen: true,
                                        type: "approve",
                                        submission: del,
                                        grade: del.grade || "A",
                                        feedback: "Meets all FIP criteria. Excellent work!"
                                      });
                                    }}
                                    style={{
                                      padding: "7px 18px",
                                      background: "rgba(45, 212, 191, 0.15)",
                                      border: "1px solid rgba(45, 212, 191, 0.35)",
                                      borderRadius: "7px",
                                      color: "#2dd4bf",
                                      fontSize: "12px",
                                      fontWeight: "800",
                                      cursor: "pointer"
                                    }}
                                  >
                                    ✓ Approve & Grade
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEvalModal({
                                        isOpen: true,
                                        type: "rework",
                                        submission: del,
                                        grade: "",
                                        feedback: "Re-work required: please refine your layout controller and revise task artifacts."
                                      });
                                    }}
                                    style={{
                                      padding: "7px 18px",
                                      background: "rgba(239, 68, 68, 0.15)",
                                      border: "1px solid rgba(239, 68, 68, 0.35)",
                                      borderRadius: "7px",
                                      color: "#ef4444",
                                      fontSize: "12px",
                                      fontWeight: "800",
                                      cursor: "pointer"
                                    }}
                                  >
                                    ↺ Flag Re-work
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                  <span style={{ fontSize: "12px", fontWeight: "750", color: "#10b981", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                    <FaCheckCircle size={13} />
                                    <span>Verified & Recorded</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{
                        padding: "36px 20px",
                        textAlign: "center",
                        background: "var(--bg-card, #ffffff)",
                        border: "1px dashed var(--border-subtle, #e2e8f0)",
                        borderRadius: "12px",
                        color: "var(--text-muted, #475569)"
                      }}>
                        <FaClipboardList size={28} style={{ opacity: 0.35, marginBottom: "8px" }} />
                        <p style={{ margin: 0, fontWeight: "750" }}>No deliverables submitted for this project yet.</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>Deliverables submitted by team developers will appear here for verification.</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "14px 26px",
              borderTop: "1px solid var(--border-subtle, #e2e8f0)",
              display: "flex",
              justifyContent: "flex-end",
              background: "var(--bg-card, #ffffff)",
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setDeliverablesModalProject(null)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  background: "var(--primary, #3b529a)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "12.5px",
                  fontWeight: "750",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive In-App Deliverable Evaluation & Re-Work Modal */}
      {evalModal.isOpen && evalModal.submission && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEvalModal(prev => ({ ...prev, isOpen: false }));
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.72)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 12000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box"
          }}
        >
          <div
            className="fade-in"
            style={{
              background: "var(--bg-card, #ffffff)",
              border: evalModal.type === "approve"
                ? "1.5px solid rgba(45, 212, 191, 0.45)"
                : "1.5px solid rgba(239, 68, 68, 0.45)",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "520px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-subtle, #e2e8f0)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
              background: evalModal.type === "approve" ? "rgba(45, 212, 191, 0.08)" : "rgba(239, 68, 68, 0.08)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: evalModal.type === "approve" ? "rgba(45, 212, 191, 0.2)" : "rgba(239, 68, 68, 0.2)",
                  color: evalModal.type === "approve" ? "#0d9488" : "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0
                }}>
                  {evalModal.type === "approve" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                    {evalModal.type === "approve" ? "Approve & Grade Deliverable" : "Request Deliverable Re-Work"}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-muted, #475569)", marginTop: "2px" }}>
                    Student: <strong>{evalModal.submission.studentName}</strong> • Task <span style={{ fontFamily: "var(--mono)", color: "var(--primary)" }}>#{evalModal.submission.taskId}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEvalModal(prev => ({ ...prev, isOpen: false }))}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted, #475569)",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newStatus = evalModal.type === "approve" ? "Approved" : "Re-work Requested";
                handleUpdateSubmissionStatus(
                  evalModal.submission._id || evalModal.submission.id,
                  newStatus,
                  evalModal.feedback,
                  evalModal.grade
                );
                setEvalModal(prev => ({ ...prev, isOpen: false }));
              }}
              style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* Submission Info Snippet */}
              <div style={{
                padding: "10px 14px",
                background: "var(--bg-content, #f8fafc)",
                border: "1px solid var(--border-subtle, #e2e8f0)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <FaLink size={12} style={{ color: "var(--primary)" }} />
                  <span style={{ fontSize: "12.5px", fontWeight: "750", color: "var(--text-main, #0f172a)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {evalModal.submission.fileName}
                  </span>
                </div>
                <a
                  href={evalModal.submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "var(--primary, #3b529a)",
                    textDecoration: "none",
                    flexShrink: 0
                  }}
                >
                  Inspect ↗
                </a>
              </div>

              {/* If Approve: Grade Selection */}
              {evalModal.type === "approve" && (
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted, #475569)", marginBottom: "8px", letterSpacing: "0.5px" }}>
                    Assign Letter Grade *
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                    {["A+", "A", "B+", "B", "C", "D"].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setEvalModal(prev => ({ ...prev, grade: g }))}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "8px",
                          border: evalModal.grade === g ? "2px solid #0d9488" : "1px solid var(--border-subtle, #e2e8f0)",
                          background: evalModal.grade === g ? "rgba(45, 212, 191, 0.18)" : "var(--bg-content, #f8fafc)",
                          color: evalModal.grade === g ? "#0d9488" : "var(--text-main, #0f172a)",
                          fontWeight: "800",
                          fontSize: "12.5px",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={evalModal.grade}
                    onChange={(e) => setEvalModal(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder="Custom Grade (e.g. A, 95%, Excellent)"
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", fontSize: "12.5px" }}
                    required
                  />
                </div>
              )}

              {/* Evaluation Comments / Re-work Instructions */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted, #475569)", marginBottom: "8px", letterSpacing: "0.5px" }}>
                  {evalModal.type === "approve" ? "Evaluation Comments / Feedback" : "Requested Changes / Revision Notes *"}
                </label>
                <textarea
                  rows={4}
                  value={evalModal.feedback}
                  onChange={(e) => setEvalModal(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder={evalModal.type === "approve" ? "Enter evaluation feedback for student..." : "Specify what needs to be fixed before re-evaluating..."}
                  className="form-input"
                  style={{ width: "100%", padding: "10px 12px", fontSize: "13px", resize: "vertical", fontFamily: "inherit" }}
                  required={evalModal.type === "rework"}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setEvalModal(prev => ({ ...prev, isOpen: false }))}
                  className="btn-secondary"
                  style={{ padding: "9px 18px", borderRadius: "8px", fontSize: "12.5px", fontWeight: "750" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 22px",
                    borderRadius: "8px",
                    border: "none",
                    background: evalModal.type === "approve" ? "#0d9488" : "#dc2626",
                    color: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: evalModal.type === "approve" ? "0 4px 12px rgba(13, 148, 136, 0.3)" : "0 4px 12px rgba(220, 38, 38, 0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  {evalModal.type === "approve" ? "✓ Approve & Grade" : "↺ Request Re-Work"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
