'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { database } from "@/lib/firebase";
import { ref, onValue, push, remove } from "firebase/database";

interface Announcement {
  id: string;
  message: string;
  author: string;
  timestamp: number;
}

export default function AnnouncementBoard({ isAdmin }: { isAdmin: boolean }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    const annRef = ref(database, 'announcements');
    onValue(annRef, (snapshot) => {
      const data = snapshot.val() || {};
      const loaded = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as Omit<Announcement, "id">),
      }));
      setAnnouncements(loaded.sort((a, b) => b.timestamp - a.timestamp));
    });
  }, []);

  const addAnnouncement = async () => {
    if (!newMessage.trim()) return;
    const annRef = ref(database, 'announcements');
    await push(annRef, {
      message: newMessage.trim(),
      author: author.trim() || "Anonymous",
      timestamp: Date.now(),
    });
    setNewMessage("");
  };

  const deleteAnnouncement = async (id: string) => {
    if (!isAdmin) return;
    const itemRef = ref(database, `announcements/${id}`);
    await remove(itemRef);
  };

  const getAvatarEmoji = (name: string) => {
    const emojis = ['😄','😎','🤓','🧐','🧙‍♂️','🧑‍🚀','👩‍💻','🦸‍♀️','🧛‍♂️','🧚‍♀️','🐱','🐶','🐵','🐼','🐧'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return emojis[hash % emojis.length];
  };

  const getColorStyle = (author: string) => {
    const colors = [
      'bg-blue-100 border-blue-200',
      'bg-green-100 border-green-200',
      'bg-pink-100 border-pink-200',
      'bg-yellow-100 border-yellow-200',
      'bg-purple-100 border-purple-200',
      'bg-orange-100 border-orange-200',
      'bg-cyan-100 border-cyan-200',
      'bg-lime-100 border-lime-200',
    ];
    let hash = 0;
    for (let i = 0; i < author.length; i++) {
      hash = author.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">📢 Team Announcements</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addAnnouncement();
        }}
        className="flex flex-col gap-2 md:flex-row md:items-center mb-4"
      >
        <Input
          placeholder="Enter your name (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <Input
          placeholder="Write an announcement 💫"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button type="submit">Post</Button>
      </form>

      <ul className="space-y-3">
        {announcements.map((item) => (
          <li
            key={item.id}
            className={`p-4 rounded-xl shadow-sm border ${getColorStyle(item.author || "Anon")}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getAvatarEmoji(item.author || "Anon")}</div>
              <div className="flex-1">
                <div className="text-sm text-gray-800">{item.message}</div>
                <div className="mt-1 text-xs text-gray-500 flex justify-between">
                  <span>— {item.author || "Anonymous"}</span>
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 mt-2"
                onClick={() => deleteAnnouncement(item.id)}
              >
                Delete
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
