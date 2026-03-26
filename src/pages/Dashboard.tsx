import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Clock } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const { documents, loading } = useDocuments();

  const handleCreateDocument = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title: "مستند جديد", content: "" })
      });
      if (res.ok) {
        const doc = await res.json();
        navigate(`/editor/${doc.id}`);
      }
    } catch (error) {
      console.error("Failed to create document", error);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">مستنداتك</h2>
          <p className="text-muted-foreground">
            أنشئ وحرّر أبحاثك وتقاريرك من مكان واحد.
          </p>
        </div>
        <Button onClick={handleCreateDocument} className="shrink-0 gap-2 rounded-full">
          <Plus className="h-4 w-4" />
          مستند جديد
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">لا توجد مستندات بعد</p>
          <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
            ابدأ بإنشاء مستند جديد لكتابة بحثك أو تقريرك.
          </p>
          <Button onClick={handleCreateDocument} className="mt-6 gap-2 rounded-full">
            <Plus className="h-4 w-4" />
            إنشاء أول مستند
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Link key={doc.id} to={`/editor/${doc.id}`}>
              <Card className="h-full cursor-pointer border-border/80 transition-all hover:border-primary/40 hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start gap-2 text-lg">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="line-clamp-2">{doc.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="ml-1.5 h-3.5 w-3.5" />
                    آخر تحديث {doc.updatedAt}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

