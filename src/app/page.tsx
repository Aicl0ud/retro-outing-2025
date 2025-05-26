'use client';

import { useEffect, useState } from "react";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { database, ref, push, onValue, remove } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import ActionsFromLastSprint from "@/components/ActionsFromLastSprint";
import AnnouncementBoard from "@/components/AnnouncementBoard";
import RetroFeedback from "@/components/RetroFeedback";

type Feedback = {
  id: string;
  name?: string;
  good?: string;
  bad?: string;
  action?: string;
};

// Define missing Announcement type
// type Announcement = {
//   id: string;
//   text: string;
//   timestamp: number;
// };

export default function Retrospective() {
  // Remove or comment out unused variables
  // const [uid, setUid] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [submissions, setSubmissions] = useState<Feedback[]>([]);
  const [form, setForm] = useState({
    name: "",
    good: "",
    bad: "",
    action: "",
  });
  // These state variables can be removed or commented out if not used
  // const [actionItems, setActionItems] = useState<{ id: string; text: string; done: boolean }[]>([]);
  // const [newActionText, setNewActionText] = useState("");
  // const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    console.log("Initializing authentication and data subscription...");
    const auth = getAuth();

    signInAnonymously(auth)
      .then(() => console.log("Anonymous sign-in successful"))
      .catch((error) => console.error("Anonymous sign-in error:", error));

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user.uid);
        // setUid(user.uid); - Not used, so we can remove this
      } else {
        console.log("User signed out");
        // setUid(null); - Not used, so we can remove this
      }
    });

    const feedbackRef = ref(database, 'feedback');
    const unsubscribeDB = onValue(feedbackRef, (snapshot) => {
      const data = snapshot.val() || {};
      console.log("Received feedback data:", data);
      const loaded = Object.entries(data).map(([key, value]) => ({ 
        id: key, 
        ...(value as object) 
      })) as Feedback[];
      setSubmissions(loaded.reverse());
    }, (error) => {
      console.error("Error fetching feedback data:", error);
    });

    // Since actionItems is not used in the UI, we can remove this part
    /*
    const actionRef = ref(database, 'actionItems');
    onValue(actionRef, (snapshot) => {
      const data = snapshot.val() || {};
      const loaded = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as { text: string; done: boolean })
      }));
      setActionItems(loaded);
    });
    */

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
      setForm({ ...form, good: "", bad: "", action: "" });
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

      <RetroFeedback
        submissions={submissions}
        form={{ id: "", ...form }}
        adminMode={adminMode}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
      />
    </div>
  );
}
