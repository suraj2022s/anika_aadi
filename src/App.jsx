import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import netlifyIdentity from "netlify-identity-widget";

/* -------------------------- Identity helpers -------------------------- */

const useIdentity = () => {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    netlifyIdentity.init();
    setUser(netlifyIdentity.currentUser());
    const onLogin = (u) => setUser(u);
    const onLogout = () => setUser(null);
    netlifyIdentity.on("login", onLogin);
    netlifyIdentity.on("logout", onLogout);
    return () => {
      netlifyIdentity.off("login", onLogin);
      netlifyIdentity.off("logout", onLogout);
    };
  }, []);

  const roles =
    (user && user.app_metadata && user.app_metadata.roles) || [];

  return {
    user,
    roles,
    isAdmin: roles.includes("admin"),
    isPaid: roles.includes("member") || roles.includes("vip") || roles.includes("admin"),
  };
};

/* -------------------------- Small UI helpers -------------------------- */

const Badge = ({ children }) => (
  <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
    {children}
  </span>
);

const Card = ({ children }) => (
  <div className="glass rounded-2xl p-4 shadow-md border border-pink-100">
    {children}
  </div>
);

/* ------------------------------- Layout ------------------------------- */

const Header = () => {
  const { user } = useIdentity();
  return (
    <header className="sticky top-0 z-10 border-b border-pink-200/50 glass">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-brand-700"
        >
          Anika<span className="text-brand-500">&</span>Aadi
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {["photos", "videos", "membership", "blog", "live"].map((p) => (
            <NavLink
              key={p}
              to={`/${p}`}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-all ${
                  isActive
                    ? "bg-brand-100 text-brand-800"
                    : "text-gray-700 hover:bg-pink-50"
                }`
              }
            >
              {p[0].toUpperCase() + p.slice(1)}
            </NavLink>
          ))}
          <NavLink
            to="/admin-login"
            className="px-3 py-2 rounded-md bg-brand-500 text-white hover:bg-brand-600"
          >
            {user ? "Account" : "Sign in"}
          </NavLink>
        </nav>

        <button
          className="md:hidden px-3 py-2 rounded-md bg-brand-500 text-white"
          onClick={() => {
            const m = document.getElementById("mobile-menu");
            if (m) m.classList.toggle("hidden");
          }}
        >
          Menu
        </button>
      </div>

      <div
        id="mobile-menu"
        className="md:hidden hidden border-t border-pink-200 bg-white/80 backdrop-blur"
      >
        <div className="px-4 py-2 flex flex-col gap-2">
          {["photos", "videos", "membership", "blog", "live"].map((p) => (
            <Link
              key={p}
              to={`/${p}`}
              className="px-3 py-2 rounded-md hover:bg-pink-50"
            >
              {p[0].toUpperCase() + p.slice(1)}
            </Link>
          ))}
          <Link
            to="/admin-login"
            className="px-3 py-2 rounded-md bg-brand-500 text-white text-center"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="mt-16">
    <div className="max-w-7xl mx-auto px-4 py-10 text-sm text-gray-600">
      <p>
        18+ Only. © {new Date().getFullYear()} Anika & Aadi ·{" "}
        <a className="underline" href="/admin">
          CMS
        </a>
      </p>
    </div>
  </footer>
);

/* ------------------------------- Home -------------------------------- */

const Home = () => (
  <div className="hero">
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-5xl font-black text-brand-700 leading-tight">
            Soft, Pastel & Playful
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            A warm, intimate space with previews for all and full access for
            members.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              className="px-5 py-3 rounded-xl bg-brand-500 text-white shadow hover:-translate-y-0.5 transition"
              to="/membership"
            >
              Become a Member
            </Link>
            <Link
              className="px-5 py-3 rounded-xl bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 transition"
              to="/photos"
            >
              See Photos
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <img
            className="rounded-2xl shadow-lg"
            src="https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop"
            alt="sample1"
          />
          <img
            className="rounded-2xl shadow-lg"
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop"
            alt="sample2"
          />
          <img
            className="rounded-2xl shadow-lg col-span-2"
            src="https://images.unsplash.com/photo-1520975922284-5f5730a6c600?q=80&w=1200&auto=format&fit=crop"
            alt="sample3"
          />
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------- Content loaders (fetch) ------------------------- */

function useJson(url) {
  const [data, setData] = React.useState([]);
  React.useEffect(() => {
    let alive = true;
    fetch(url)
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => alive && setData([]));
    return () => {
      alive = false;
    };
  }, [url]);
  return data;
}

/* --------------------------- Photos & Videos --------------------------- */

const PhotosPage = () => {
  const items = useJson("/data/photos.json"); // from public/data/photos.json
  const { isPaid } = useIdentity();
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-extrabold text-brand-700 mb-6">Photos</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {items.map((item, idx) => (
          <Card key={idx}>
            <div className="relative">
              <img
                src={item.image}
                alt={item.title}
                className={`rounded-xl w-full h-56 object-cover ${
                  item.free || isPaid ? "" : "blurred"
                }`}
              />
              {!item.free && !isPaid && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 rounded-lg px-3 py-2 text-sm">
                    Locked — join to view
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="font-semibold">{item.title}</div>
              <Badge>{item.free ? "Free" : "Members"}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const VideosPage = () => {
  const items = useJson("/data/videos.json"); // from public/data/videos.json
  const { isPaid } = useIdentity();
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-extrabold text-brand-700 mb-6">Videos</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <Card key={idx}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{item.title}</div>
                <Badge>{item.free ? "Free" : "Members"}</Badge>
              </div>
              {item.free || isPaid ? (
                <video controls className="w-full rounded-lg">
                  <source src={item.url} type="video/mp4" />
                </video>
              ) : (
                <div className="h-48 flex items-center justify-center rounded-lg bg-pink-50 border border-pink-100 text-sm text-gray-600">
                  Locked — become a member to watch
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ----------------------------- Membership ----------------------------- */

const Membership = () => (
  <div className="max-w-7xl mx-auto px-4 py-12">
    <h2 className="text-3xl font-extrabold text-brand-700 mb-6">Membership</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { plan: "basic", price: 800, desc: "Full photos & videos" },
        { plan: "premium", price: 1600, desc: "Exclusive content + discounts" },
        { plan: "vip", price: 4000, desc: "All access + live sessions" },
      ].map((t) => (
        <div key={t.plan} className="rounded-2xl p-6 border border-pink-100 glass">
          <div className="text-xl font-bold">{t.plan.toUpperCase()}</div>
          <div className="text-3xl font-black text-brand-600 mt-2">
            ₹{t.price}
            <span className="text-base text-gray-500">/mo</span>
          </div>
          <p className="mt-2 text-gray-600">{t.desc}</p>
          <Link
            className="inline-block mt-4 px-5 py-2 rounded-xl bg-brand-500 text-white shadow hover:-translate-y-0.5 transition"
            to={`/checkout?plan=${t.plan}&amount=${t.price}`}
          >
            Join
          </Link>
        </div>
      ))}
    </div>
  </div>
);

/* ---------------------------- Auth / Admin ---------------------------- */

const AdminLogin = () => {
  React.useEffect(() => {
    netlifyIdentity.init();
    netlifyIdentity.on("login", () => {
      window.location.href = "/admin-dashboard";
    });
  }, []);
  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-4">Account</h2>
      <div className="space-x-3">
        <button
          className="px-4 py-2 bg-brand-500 text-white rounded-xl"
          onClick={() => netlifyIdentity.open()}
        >
          Sign in / Sign up
        </button>
        <button
          className="px-4 py-2 bg-gray-200 rounded-xl"
          onClick={() => netlifyIdentity.logout()}
        >
          Sign out
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Admins can access CMS and dashboard. Members see paid content.
      </p>
    </div>
  );
};

const RequireAdmin = ({ children }) => {
  const { isAdmin } = useIdentity();
  return isAdmin ? children : <Navigate to="/admin-login" replace />;
};

const AdminDashboard = () => {
  const [rows, setRows] = React.useState([]);

  const load = async () => {
    const user = netlifyIdentity.currentUser();
    const token = user ? await user.jwt() : null;
    const res = await fetch("/.netlify/functions/admin-paymentsList", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    setRows(data.items || []);
  };

  React.useEffect(() => {
    load();
  }, []);

  const markPaid = async (orderId) => {
    const user = netlifyIdentity.currentUser();
    const token = user ? await user.jwt() : null;
    await fetch("/.netlify/functions/admin-markPaid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ orderId }),
    });
    load();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-extrabold text-brand-700 mb-6">
        Admin Dashboard
      </h2>
      <div className="mb-4 flex gap-3">
        <a className="px-4 py-2 rounded-xl bg-gray-200" href="/admin">
          Open CMS
        </a>
        <button className="px-4 py-2 rounded-xl bg-gray-200" onClick={load}>
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto glass rounded-2xl border border-pink-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-pink-50 text-gray-700">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.orderId} className="border-t border-pink-100">
                <td className="p-3">{r.orderId}</td>
                <td className="p-3">{r.plan}</td>
                <td className="p-3">₹{r.amountINR}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3">
                  {r.status !== "paid" && (
                    <button
                      className="px-3 py-1 rounded bg-brand-500 text-white"
                      onClick={() => markPaid(r.orderId)}
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan="5">
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* --------------------------- Checkout / Status -------------------------- */

const Checkout = () => {
  const [search] = useSearchParams();
  const plan = search.get("plan") || "basic";
  const amountParam = Number(search.get("amount") || 800);
  const [order, setOrder] = React.useState(null);
  const [status, setStatus] = React.useState(null);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  const createOrder = async () => {
    setError(null);
    const res = await fetch("/.netlify/functions/payments-createOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, amountINR: amountParam }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create order");
      return;
    }
    setOrder(data);
    pollStatus(data.orderId);
  };

  const pollStatus = async (orderId) => {
    const loop = async () => {
      const r = await fetch(
        `/.netlify/functions/payments-getStatus?orderId=${encodeURIComponent(
          orderId
        )}`
      );
      const s = await r.json();
      setStatus(s);
      if (s.status === "paid") {
        navigate(`/success?orderId=${encodeURIComponent(orderId)}`);
      } else {
        setTimeout(loop, 5000);
      }
    };
    loop();
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-3xl font-extrabold text-brand-700 mb-4">
        Checkout
      </h2>
      <p className="text-gray-600 mb-6">
        Plan: <b className="uppercase">{plan}</b> · Amount: <b>₹{amountParam}</b>
      </p>

      {!order ? (
        <button
          className="px-5 py-3 rounded-xl bg-brand-500 text-white shadow"
          onClick={createOrder}
        >
          Generate UPI Link & QR
        </button>
      ) : (
        <div className="space-y-4">
          <Card>
            <p className="text-gray-700">UPI Link:</p>
            <a className="underline break-all text-brand-700" href={order.upiLink}>
              {order.upiLink}
            </a>
          </Card>

          <Card>
            <p className="text-gray-700 mb-2">Scan to pay:</p>
            <img
              className="bg-white p-2 rounded"
              alt="UPI QR"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
                order.upiLink
              )}`}
            />
          </Card>

          {status && status.status !== "paid" && (
            <p className="text-yellow-700">Current status: {status.status}</p>
          )}
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

const Success = () => {
  const [search] = useSearchParams();
  return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <h2 className="text-3xl font-extrabold text-brand-700 mb-2">
        Payment Successful 🎉
      </h2>
      <p className="text-gray-700">Order ID: {search.get("orderId")}</p>
      <p className="text-gray-600 mt-2">
        Your member access will be updated shortly.
      </p>
      <Link
        className="inline-block mt-6 px-5 py-3 rounded-xl bg-gray-900 text-white"
        to="/membership"
      >
        Back to Membership
      </Link>
    </div>
  );
};

const Failure = () => (
  <div className="max-w-xl mx-auto p-8 text-center">
    <h2 className="text-3xl font-extrabold text-brand-700 mb-2">
      Payment Failed
    </h2>
    <p className="text-gray-600">Please try again or contact support.</p>
    <Link
      className="inline-block mt-6 px-5 py-3 rounded-xl bg-gray-900 text-white"
      to="/membership"
    >
      Back
    </Link>
  </div>
);

/* --------------------------------- App -------------------------------- */

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/membership" element={<Membership />} />
        <Route
          path="/blog"
          element={
            <div className="max-w-7xl mx-auto px-4 py-12">
              <h2 className="text-3xl font-extrabold text-brand-700 mb-6">
                Blog
              </h2>
              <p>Posts via CMS soon.</p>
            </div>
          }
        />
        <Route
          path="/live"
          element={
            <div className="max-w-7xl mx-auto px-4 py-12">
              <h2 className="text-3xl font-extrabold text-brand-700 mb-6">
                Live
              </h2>
              <p>Schedule coming soon.</p>
            </div>
          }
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/failure" element={<Failure />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin-dashboard"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
