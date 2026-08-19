"use client";

import { useState } from "react";
import PageContainer from "@/components/ai-usage/layout/PageContainer";
import ImportForm from "@/components/ai-usage/import/ImportForm";
import ManualEntryForm from "@/components/ai-usage/import/ManualEntryForm";

export default function ImportPage() {
  // Bump to nudge children to refetch after a write, if needed later.
  const [, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  return (
    <PageContainer
      title="Import & log usage"
      subtitle="Bring usage in from console exports, or log entries by hand. Costs are computed for you."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <ImportForm onImported={bump} />
        <ManualEntryForm onSaved={bump} />
      </div>
    </PageContainer>
  );
}
