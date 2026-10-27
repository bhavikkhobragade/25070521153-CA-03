import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  // Restore the login session after refreshing the page
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("flexiToken");

    if (!token) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    async function restoreSession() {
      try {
        const response = await fetch(`${API}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const data = await response.json();

        if (active) {
          setUser(data.user);
        }
      } catch {
        localStorage.removeItem("flexiToken");
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);

    try {
      const endpoint = isRegister ? "register" : "login";

      const response = await fetch(`${API}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      localStorage.setItem("flexiToken", data.token);
      setUser(data.user);
      setActivePage("Dashboard");
      setForm({ name: "", email: "", password: "" });
      setSuccess("");
      setError("");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that your server is running."
          : err.message
      );
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("flexiToken");
    setUser(null);
    setActivePage("Dashboard");
    setIsRegister(false);
    setError("");
    setSuccess("");
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">F</div>
        <p>Loading your FLEXI workspace...</p>
      </div>
    );
  }

  // Login and registration screen
  if (!user) {
    return (
      <main className="auth-layout">
        <section className="auth-intro">
          <div className="brand brand-light">
            <div className="brand-mark">F</div>
            <div>
              <strong>FLEXI</strong>
              <span>EVENT HUB</span>
            </div>
          </div>

          <div className="intro-content">
            <span className="intro-label">
              YOUR CAMPUS. YOUR COMMUNITY.
            </span>
            <h1>
              Make every
              <br />
              campus moment
              <br />
              <span>count.</span>
            </h1>
            <p>
              Discover workshops, join hackathons, and find
              opportunities to learn, build, and connect.
            </p>

            <div className="intro-points">
              <div>
                <span className="point-icon">01</span>
                <span>Discover college events</span>
              </div>
              <div>
                <span className="point-icon">02</span>
                <span>Register in a few clicks</span>
              </div>
              <div>
                <span className="point-icon">03</span>
                <span>Keep everything organised</span>
              </div>
            </div>
          </div>

          <div className="intro-footer">
            FLEXI PROJECT · EVENT MANAGEMENT PORTAL
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <div className="mobile-brand brand">
              <div className="brand-mark">F</div>
              <strong>FLEXI</strong>
            </div>

            <div className="form-heading">
              <span className="eyebrow">
                {isRegister ? "GET STARTED" : "WELCOME BACK"}
              </span>

              <h2>
                {isRegister ? "Create your account" : "Sign in to FLEXI"}
              </h2>

              <p>
                {isRegister
                  ? "Join your campus event community."
                  : "Your next campus experience starts here."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {isRegister && (
                <label>
                  Full name
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    minLength={2}
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  placeholder={
                    isRegister
                      ? "At least 6 characters"
                      : "Enter your password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  minLength={isRegister ? 6 : undefined}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  required
                />
              </label>

              {error && <div className="message error">{error}</div>}
              {success && (
                <div className="message success">{success}</div>
              )}

              <button className="primary-button" disabled={busy}>
                {busy
                  ? "Please wait..."
                  : isRegister
                    ? "Create account"
                    : "Sign in to dashboard"}
                {!busy && <span>→</span>}
              </button>
            </form>

            <div className="auth-switch">
              {isRegister
                ? "Already have an account?"
                : "New to FLEXI?"}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                  setSuccess("");
                }}
              >
                {isRegister ? "Sign in" : "Create account"}
              </button>
            </div>

            <div className="secure-note">
              <span>✓</span> Your account details are protected
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Dashboard shown after successful login
  const firstName = user.name.split(" ")[0] || user.name;

  const navItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Explore Events", icon: "◇" },
    { name: "My Registrations", icon: "▤" }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand sidebar-brand">
          <div className="brand-mark">F</div>
          <div>
            <strong>FLEXI</strong>
            <span>EVENT HUB</span>
          </div>
        </div>

        <div className="nav-caption">WORKSPACE</div>

        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={
                activePage === item.name ? "nav-item active" : "nav-item"
              }
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
              {item.name === "Dashboard" && (
                <span className="nav-dot" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-symbol">✳</div>
            <strong>Your next big idea starts here.</strong>
            <p>Stay curious. Keep learning. Get involved.</p>
          </div>

          <button className="logout-button" onClick={logout}>
            <span>↪</span> Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">STUDENT WORKSPACE</span>
            <h2>{activePage}</h2>
          </div>

          <div className="profile">
            <div className="profile-copy">
              <strong>{user.name}</strong>
              <span>Student account</span>
            </div>
            <div className="avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {activePage === "Dashboard" ? (
          <div className="dashboard-content">
            <section className="welcome-banner">
              <div className="welcome-text">
                <span className="welcome-tag">YOUR CAMPUS HUB</span>
                <h1>
                  Welcome back, {firstName} <span>✦</span>
                </h1>
                <p>
                  Your campus journey is full of possibilities.
                  Find something new to learn today.
                </p>

                <button
                  className="banner-button"
                  onClick={() => setActivePage("Explore Events")}
                >
                  Explore events <span>→</span>
                </button>
              </div>

              <div className="banner-decoration">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="orbit-center">F</div>
                <span className="spark spark-one">✦</span>
                <span className="spark spark-two">✧</span>
                <span className="spark spark-three">✳</span>
              </div>
            </section>

            <div className="section-heading">
              <div>
                <h3>Your overview</h3>
                <p>Your personal event workspace at a glance.</p>
              </div>
              <span className="status-pill">
                <span /> ACCOUNT ACTIVE
              </span>
            </div>

            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-top">
                  <span>EVENTS</span>
                  <span className="stat-icon purple">◇</span>
                </div>
                <h2>—</h2>
                <p>Upcoming campus events</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>REGISTRATIONS</span>
                  <span className="stat-icon orange">▤</span>
                </div>
                <h2>—</h2>
                <p>Your registered events</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>PROFILE</span>
                  <span className="stat-icon green">✓</span>
                </div>
                <h2>Active</h2>
                <p>Your account is ready to use</p>
              </article>
            </section>

            <section className="content-card">
              <div className="card-heading">
                <div>
                  <h3>Get started with FLEXI</h3>
                  <p>Everything you need for your campus experience.</p>
                </div>
                <span className="mini-badge">YOUR SPACE</span>
              </div>

              <div className="getting-started-grid">
                <button
                  className="action-card"
                  onClick={() => setActivePage("Explore Events")}
                >
                  <div className="action-icon purple">◈</div>
                  <strong>Discover events</strong>
                  <span>Browse workshops and competitions.</span>
                  <span className="action-link">Explore now →</span>
                </button>

                <button
                  className="action-card"
                  onClick={() => setActivePage("My Registrations")}
                >
                  <div className="action-icon orange">▤</div>
                  <strong>My registrations</strong>
                  <span>Keep track of your event sign-ups.</span>
                  <span className="action-link">View registrations →</span>
                </button>
              </div>
            </section>
          </div>
        ) : (
          <section className="empty-page">
            <div className="empty-icon">
              {activePage === "Explore Events" ? "◇" : "▤"}
            </div>
            <span className="eyebrow">COMING NEXT</span>
            <h2>{activePage}</h2>
            <p>
              Your login and dashboard are ready. In the next step,
              we will connect this section to MongoDB to display real
              events and student registrations.
            </p>
            <button
              className="primary-button empty-button"
              onClick={() => setActivePage("Dashboard")}
            >
              ← Back to dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;