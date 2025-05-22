'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { database } from "@/lib/firebase";
import { ref, onValue, push, remove, update } from "firebase/database";

interface ActionItem {
  id: string;
  text: string;
  done: boolean;
}

export default function ActionsFromLastSprint({ readonly = false }: { readonly?: boolean }) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionText, setNewActionText] = useState("");

  useEffect(() => {
    const actionRef = ref(database, 'actionItems');
    onValue(actionRef, (snapshot) => {
      const data = snapshot.val() || {};
      const loaded = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as { text: string; done: boolean }),
      }));
      setActionItems(loaded);
    });
  }, []);

  const addActionItem = async () => {
    if (!newActionText.trim()) return;
    const refToPush = ref(database, 'actionItems');
    await push(refToPush, { text: newActionText.trim(), done: false });
    setNewActionText("");
  };

  const toggleDone = async (id: string, done: boolean) => {
    if (readonly) return;
    const itemRef = ref(database, `actionItems/${id}`);
    await update(itemRef, { done: !done });
  };

  const deleteItem = async (id: string) => {
    if (readonly) return;
    const itemRef = ref(database, `actionItems/${id}`);
    await remove(itemRef);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">📌 Actions from Last Sprint</h2>

      {!readonly && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addActionItem();
          }}
          className="flex gap-2 mb-4"
        >
          <Input
            placeholder="Add new action item..."
            value={newActionText}
            onChange={(e) => setNewActionText(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </form>
      )}

      <ul className="space-y-3">
        {actionItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm"
          >
            <label className="flex items-center gap-3 w-full">
              <input
                type="checkbox"
                checked={item.done}
                disabled={readonly}
                onChange={() => toggleDone(item.id, item.done)}
              />
              <span className={item.done ? "line-through text-gray-400" : ""}>
                {item.text}
              </span>
            </label>
            {!readonly && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500"
                onClick={() => deleteItem(item.id)}
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
