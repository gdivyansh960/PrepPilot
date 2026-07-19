import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function ProfilePage() {
  const { user, saveProfile } = useAuth();
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setForm({ name: user?.name || "", email: user?.email || "" });
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      nextErrors.email = "Enter a valid email address";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      const response = await saveProfile(form);
      showToast(response.message);
    } catch (error) {
      showToast(
        getErrorMessage(error, "Could not save your profile."),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Personal workspace"
        title="Profile"
        description="Keep your account details current across your PrepPilot workspace."
      />
      <div className="grid max-w-4xl gap-5 lg:grid-cols-[.7fr_1.3fr]">
        <Card className="p-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-xl font-bold text-violet-700">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            {user?.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Account role
            </p>
            <p className="mt-2 text-sm font-semibold capitalize text-slate-700">
              {user?.role || "student"}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Edit your details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Use the name and email you want associated with your preparation
            plan.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              id="profile-name"
              label="Full name"
              value={form.name}
              error={errors.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
            <Input
              id="profile-email"
              label="Email address"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
            <div className="pt-2">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
