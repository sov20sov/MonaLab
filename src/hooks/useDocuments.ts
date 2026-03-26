import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { DocumentListItem, DocumentListRow } from "@/types/document";

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentListRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        const response = await fetch("/api/documents", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (response.ok) {
          const data = (await response.json()) as DocumentListItem[];
          setDocuments(
            data.map((doc) => ({
              ...doc,
              updatedAt: new Date(doc.updatedAt).toLocaleDateString("ar-SA"),
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch documents", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchDocs();
  }, []);

  return { documents, loading };
}
