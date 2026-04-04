import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExportLanguage, ExportOptions } from "@/lib/report-exporter";
import type { AssistantUILang } from "@/lib/assistant-i18n";
import { exportCoverCopy } from "@/lib/assistant-i18n";

type Props = {
  open: boolean;
  initial?: ExportOptions;
  onClose: () => void;
  onConfirm: (options: ExportOptions) => void;
  title?: string;
  /** لغة واجهة حوار التصدير (عربي / English) */
  uiLang?: AssistantUILang;
};

function normalizeLang(v: string): ExportLanguage {
  if (v === "ar" || v === "en" || v === "auto") return v;
  return "auto";
}

export function ExportCoverDialog({ open, initial, onClose, onConfirm, title, uiLang = "ar" }: Props) {
  const t = exportCoverCopy[uiLang];
  const initialState = useMemo<ExportOptions>(() => {
    return {
      language: initial?.language ?? "auto",
      title: initial?.title ?? "",
      subtitle: initial?.subtitle ?? "",
      authorName: initial?.authorName ?? "",
      institution: initial?.institution ?? "",
      course: initial?.course ?? "",
      supervisor: initial?.supervisor ?? "",
      date: initial?.date ?? "",
      showHeader: initial?.showHeader ?? true,
      showFooter: initial?.showFooter ?? true,
      includeToc: initial?.includeToc ?? true,
      referencesStyle: initial?.referencesStyle ?? "none",
    };
  }, [initial]);

  const [state, setState] = useState<ExportOptions>(initialState);

  useEffect(() => {
    if (!open) return;
    setState(initialState);
  }, [open, initialState]);

  if (!open) return null;

  const confirm = () => {
    onConfirm({
      ...state,
      language: normalizeLang(String(state.language ?? "auto")),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-2 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t.closeAria}
      />
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-background/95 shadow-2xl max-sm:max-h-[92dvh] sm:max-h-[88vh]">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground sm:text-base">{t.headerTitle}</p>
            <p className="text-xs text-muted-foreground truncate">
              {title ?? t.headerSubtitleFallback}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}>
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        <div className="overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t.reportTitle}</Label>
              <Input
                value={state.title ?? ""}
                onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
                placeholder={t.reportTitlePh}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t.subtitle}</Label>
              <Input
                value={state.subtitle ?? ""}
                onChange={(e) => setState((s) => ({ ...s, subtitle: e.target.value }))}
                placeholder={t.subtitlePh}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t.author}</Label>
              <Input
                value={state.authorName ?? ""}
                onChange={(e) => setState((s) => ({ ...s, authorName: e.target.value }))}
                placeholder={t.authorPh}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.institution}</Label>
              <Input
                value={state.institution ?? ""}
                onChange={(e) => setState((s) => ({ ...s, institution: e.target.value }))}
                placeholder={t.institutionPh}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.course}</Label>
              <Input
                value={state.course ?? ""}
                onChange={(e) => setState((s) => ({ ...s, course: e.target.value }))}
                placeholder={t.coursePh}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.supervisor}</Label>
              <Input
                value={state.supervisor ?? ""}
                onChange={(e) => setState((s) => ({ ...s, supervisor: e.target.value }))}
                placeholder={t.supervisorPh}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t.date}</Label>
              <Input
                value={state.date ?? ""}
                onChange={(e) => setState((s) => ({ ...s, date: e.target.value }))}
                placeholder={t.datePh}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-muted/30 p-3.5 sm:grid-cols-2 sm:p-4">
            <div className="space-y-1.5">
              <Label>{t.language}</Label>
              <select
                value={String(state.language ?? "auto")}
                onChange={(e) => setState((s) => ({ ...s, language: normalizeLang(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="auto">{t.langAuto}</option>
                <option value="ar">{t.langAr}</option>
                <option value="en">{t.langEn}</option>
              </select>
            </div>

            <div className="space-y-2 pt-1.5">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(state.includeToc ?? true)}
                  onChange={(e) => setState((s) => ({ ...s, includeToc: e.target.checked }))}
                />
                {t.toc}
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(state.showHeader ?? true)}
                  onChange={(e) => setState((s) => ({ ...s, showHeader: e.target.checked }))}
                />
                {t.header}
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(state.showFooter ?? true)}
                  onChange={(e) => setState((s) => ({ ...s, showFooter: e.target.checked }))}
                />
                {t.footer}
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-background/95 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-5 sm:py-4">
          <Button variant="outline" className="h-10 rounded-full max-sm:w-full" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button className="h-10 rounded-full max-sm:w-full" onClick={confirm}>
            {t.export}
          </Button>
        </div>
      </div>
    </div>
  );
}

