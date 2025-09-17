import {
  FaRoad,
  FaTrash,
  FaTint,
  FaEnvelope,
  FaUserShield,
  FaTools,
  FaClipboard,
  FaCheckCircle,
  FaUsers,
} from "./icons";
import "./home.css";
import supabase from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { firebaseAuth } from "../lib/firebaseClient";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

function Home() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted && data?.user) {
        setUser(data.user);
        return;
      }
      // fallback: check firebase user
      const fbUser = firebaseAuth.currentUser;
      if (mounted && fbUser) {
        setUser({ email: fbUser.email, user_metadata: { fullName: fbUser.displayName } });
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user || null);
    });

    const unsubscribeFb = onAuthStateChanged(firebaseAuth, (fbUser) => {
      if (!mounted) return;
      if (fbUser) {
        setUser({ email: fbUser.email, user_metadata: { fullName: fbUser.displayName } });
      } else {
        // if firebase user signed out, but supabase session exists, keep supabase user
        supabase.auth.getUser().then(({ data }) => {
          if (mounted) setUser(data?.user || null);
        });
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
      unsubscribeFb();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (e) {
      // ignore
    }
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  const getInitials = (u) => {
    if (!u) return "U";
    const name = u.user_metadata?.fullName || u.email || "User";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const categories = [
    { name: "Potholes", icon: <FaRoad /> },
    { name: "Domestic Garbage", icon: <FaTrash /> },
    { name: "Water Logging", icon: <FaTint /> },
    { name: "Sanitary Issue", icon: <FaEnvelope /> },
    { name: "Law & Order Issue", icon: <FaUserShield /> },
    { name: "Miscellaneous", icon: <FaTools /> },
  ];

  const steps = [
    {
      title: "Step 1: Report an Issue",
      desc: "Select a category and submit details with optional images.",
      icon: <FaClipboard />,
    },
    {
      title: "Step 2: Verification",
      desc: "Authorities review reports to confirm authenticity and priority.",
      icon: <FaCheckCircle />,
    },
    {
      title: "Step 3: Resolution",
      desc: "Track progress in real-time and receive notifications on fixes.",
      icon: <FaTools />,
    },
    {
      title: "Step 4: Community Updates",
      desc: "Stay informed about local initiatives and similar reports.",
      icon: <FaUsers />,
    },
  ];

  return (
    <div className="home-wrapper">
      <header className="home-header">
        <h1 className="fade-in">SwarajSetu</h1>
        <p className="fade-in delay-1">Your bridge to self-governance</p>

        {user && (
          <div className="user-wrapper" onClick={() => setMenuOpen((s) => !s)}>
            <button
              className="avatar-button"
              aria-label="User menu"
              title={user.email}
            >
              <span className="avatar-circle">{getInitials(user)}</span>
            </button>

            {menuOpen && (
              <div className="user-menu" role="menu">
                <div className="user-info">
                  <strong>{user.user_metadata?.fullName || user.email}</strong>
                  <div className="user-role">{user.user_metadata?.role || "Member"}</div>
                </div>
                <button className="logout-btn" onClick={handleLogout} role="menuitem">
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <h2 className="home-title fade-in delay-2">Report an Issue</h2>
      <p className="home-subtitle fade-in delay-3">Choose a category to get started</p>

      <div className="categories-grid">
        {categories.map((cat, index) => (
          <div
            key={index}
            className={`category-card fade-in delay-${index + 4}`}
          >
            <div className="category-icon">{cat.icon}</div>
            <h3>{cat.name}</h3>
          </div>
        ))}
      </div>

      <section className="how-it-works fade-in delay-10" aria-labelledby="how-heading">
        <div className="how-header">
          <h2 id="how-heading">How SwarajSetu Works</h2>
          <p className="how-sub">Your bridge to self-governance, step by step.</p>
        </div>

        <div className="steps-grid">
          {steps.map((s, i) => (
            <article key={i} className={`step-card fade-in delay-${i + 11}`}>
              <div className="step-icon">{s.icon}</div>
              <div className="step-body">
                <h4 className="step-title">{s.title}</h4>
                <p className="step-desc">{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
