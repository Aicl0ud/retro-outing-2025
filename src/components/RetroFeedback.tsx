import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface Feedback {
  id: string;
  name?: string;
  good?: string;
  bad?: string;
  action?: string;
}
interface RetroFeedbackProps {
  submissions: Feedback[];
  form: Feedback;
  adminMode: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleDelete: (id: string) => void;
}

export default function RetroFeedback({ submissions, form, adminMode, handleChange, handleSubmit, handleDelete }: RetroFeedbackProps) {
  return (


<>
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
</>
  );
}
