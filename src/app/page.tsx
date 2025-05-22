'use client';

import { useEffect, useState } from "react";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { database, ref, push, onValue, remove } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ActionsFromLastSprint from "@/components/ActionsFromLastSprint";
import AnnouncementBoard from "@/components/AnnouncementBoard";

type Feedback = {
  id: string;
  name?: string;
  good?: string;
  bad?: string;
  action?: string;
};

export default function Retrospective() {
  const [uid, setUid] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [submissions, setSubmissions] = useState<Feedback[]>([]);
  const [form, setForm] = useState({
    name: "",
    good: "",
    bad: "",
    action: "",
  });
  const [actionItems, setActionItems] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newActionText, setNewActionText] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    console.log("Initializing authentication and data subscription...");
    const auth = getAuth();

    signInAnonymously(auth)
      .then(() => console.log("Anonymous sign-in successful"))
      .catch((error) => console.error("Anonymous sign-in error:", error));

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user.uid);
        setUid(user.uid);
      } else {
        console.log("User signed out");
        setUid(null);
      }
    });

    const feedbackRef = ref(database, 'feedback');
    const unsubscribeDB = onValue(feedbackRef, (snapshot) => {
      const data = snapshot.val() || {};
      console.log("Received feedback data:", data);
      const loaded = Object.entries(data).map(([key, value]) => ({ id: key, ...value })) as Feedback[];
      setSubmissions(loaded.reverse());
    }, (error) => {
      console.error("Error fetching feedback data:", error);
    });

    const actionRef = ref(database, 'actionItems');
    onValue(actionRef, (snapshot) => {
      const data = snapshot.val() || {};
      const loaded = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as { text: string; done: boolean })
      }));
      setActionItems(loaded);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDB();
      console.log("Cleanup subscriptions");
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    console.log(`Form updated: ${e.target.name} = ${e.target.value}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form:", form);

    if (!form.good.trim() && !form.bad.trim() && !form.action.trim()) {
      alert("Please fill at least one feedback field.");
      console.warn("Submission prevented: no feedback entered");
      return;
    }

    try {
      const feedbackRef = ref(database, 'feedback');
      await push(feedbackRef, form);
      console.log("Feedback submitted successfully");
      setForm({ name: "", good: "", bad: "", action: "" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!adminMode) {
      console.warn("Delete attempted without admin mode");
      return;
    }
    console.log("Deleting feedback with id:", id);
    const itemRef = ref(database, `feedback/${id}`);
    await remove(itemRef);
    console.log("Deleted feedback with id:", id);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Retrospective special edition</h1>

      <AnnouncementBoard isAdmin={adminMode} />

      <ActionsFromLastSprint readonly={!adminMode} />

      <hr className="my-5" />

      <h2 className="text-xl font-bold mb-4">Retrospective time!!! 🚗💨 🌴</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 bg-white p-6 rounded-2xl shadow"
      >
        <Input
          name="name"
          placeholder="Namae wa? (optional)"
          value={form.name}
          onChange={handleChange}
        />
        <Textarea
          name="good"
          placeholder="What went well?"
          value={form.good}
          onChange={handleChange}
          rows={3}
        />
        <Textarea
          name="bad"
          placeholder="What could be improved?"
          value={form.bad}
          onChange={handleChange}
          rows={3}
        />
        <Textarea
          name="action"
          placeholder="What should do next?"
          value={form.action}
          onChange={handleChange}
          rows={3}
        />
        <Button type="submit">Submit</Button>
      </form>

      <hr className="my-25" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">🟩 What went well</h2>
          {submissions.map((s) =>
            s.good ? (
              <Card key={`good-${s.id}`} className="mb-2">
                <CardContent className="p-3 text-sm">
                  <p>{s.good}</p>
                  {s.name && <p className="text-xs text-gray-400 mt-2">- {s.name}</p>}
                  {adminMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 mt-2"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : null
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">🟨 What could be improved</h2>
          {submissions.map((s) =>
            s.bad ? (
              <Card key={`bad-${s.id}`} className="mb-2">
                <CardContent className="p-3 text-sm">
                  <p>{s.bad}</p>
                  {s.name && <p className="text-xs text-gray-400 mt-2">- {s.name}</p>}
                  {adminMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 mt-2"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : null
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">✨ Action Items</h2>
          {submissions.map((s) =>
            s.action ? (
              <Card key={`action-${s.id}`} className="mb-2">
                <CardContent className="p-3 text-sm">
                  <p>{s.action}</p>
                  {s.name && <p className="text-xs text-gray-400 mt-2">- {s.name}</p>}
                  {adminMode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 mt-2"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : null
          )}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <p></p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdminMode(!adminMode)}
        >
          {adminMode ? "Exit Admin Mode" : "Enter Admin Mode"}
        </Button>
      </div>
    </div>
  );
}
