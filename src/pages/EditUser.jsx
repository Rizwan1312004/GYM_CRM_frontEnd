import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Loader2,
  UserCog,
  Eye,
  EyeOff,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "trainer", label: "Trainer" },
  { value: "member", label: "Member" },
];

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition shadow-sm ${className}`}
      {...props}
    />
  );
}

export default function EditUser() {
  const { id } = useParams();
  const { user: authUser, token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    role: "member",
    phone_number: "",
    is_active: true,
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Guard: non-admins get bounced
  useEffect(() => {
    if (authUser && authUser.role !== "admin") {
      toast.error("Access denied. Admins only.");
      navigate("/");
    }
  }, [authUser, navigate]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          username: data.username || "",
          role: data.role || "member",
          phone_number: data.phone_number || "",
          is_active: data.is_active ?? true,
          password: "",
        });
      } catch {
        toast.error("Failed to load user. They may not exist.");
        navigate("/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Only send password if filled in
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      const res = await fetch(`${API_BASE}/users/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("User updated successfully!");
        navigate("/users");
      } else {
        const err = await res.json();
        const msg = Object.values(err)[0];
        toast.error(Array.isArray(msg) ? msg[0] : msg || "Update failed.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/users")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <UserCog className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit User</h1>
          <p className="text-sm text-slate-500">
            Editing{" "}
            <span className="font-medium text-slate-700">
              {form.first_name || form.username}
            </span>
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name">
              <Input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
              />
            </Field>
            <Field label="Last Name">
              <Input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
              />
            </Field>
          </div>

          {/* Username */}
          <Field label="Username" hint="The unique login handle for this user.">
            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="johndoe"
            />
          </Field>

          {/* Email */}
          <Field label="Email Address">
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
            />
          </Field>

          {/* Phone */}
          <Field label="Phone Number">
            <Input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="+91 99999 99999"
            />
          </Field>

          {/* Role */}
          <Field label="Role">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition shadow-sm"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          {/* New Password */}
          <Field
            label="New Password"
            hint="Leave blank to keep the existing password."
          >
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep unchanged"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </Field>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Account Active
              </p>
              <p className="text-xs text-slate-400">
                Inactive users cannot log in
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-400 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/users")}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
