import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Worker, TimeEntry } from "@/services/personnelApi";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export const exportWorkersToPDF = (workers: Worker[]) => {
  try {
    if (!workers || workers.length === 0) {
      alert("No workers to export");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.text("Worker Directory", pageWidth / 2, 15, { align: "center" });

    // Date
    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      22,
      {
        align: "center",
      }
    );

    // Table data
    const tableData = workers.map((w) => [
      `${w.first_name} ${w.last_name}`,
      w.email || "-",
      w.phone || "-",
      w.role || "-",
      w.home_address || "-",
      w.hire_date ? new Date(w.hire_date).toLocaleDateString() : "-",
      w.is_active ? "Active" : "Inactive",
    ]);

    // Create table
    autoTable(doc, {
      head: [
        ["Name", "Email", "Phone", "Role", "Address", "Hire Date", "Status"],
      ],
      body: tableData,
      startY: 30,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(8);
    doc.text(`Total Workers: ${workers.length}`, 15, finalY + 10);

    doc.save("worker_directory.pdf");
    console.log("✅ Worker PDF exported successfully");
  } catch (error) {
    console.error("❌ Error exporting workers PDF:", error);
    alert("Error exporting PDF. Check console for details.");
  }
};

export const exportTimeEntriesToPDF = (
  entries: Array<any>,
  workers: Map<string, Worker>,
  dateRange?: { from?: Date; to?: Date }
) => {
  try {
    if (!entries || entries.length === 0) {
      alert("No time entries to export");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.text("Time Entries Report", pageWidth / 2, 15, { align: "center" });

    // Date range info
    doc.setFontSize(10);
    let dateRangeText = `Generated: ${new Date().toLocaleDateString()}`;
    if (dateRange?.from || dateRange?.to) {
      const from = dateRange.from?.toLocaleDateString() || "Start";
      const to = dateRange.to?.toLocaleDateString() || "End";
      dateRangeText += ` | Period: ${from} to ${to}`;
    }
    doc.text(dateRangeText, pageWidth / 2, 22, { align: "center" });

    // Table data
    const tableData = entries.map((e) => [
      e.worker_name || "-",
      e.date ? new Date(e.date).toLocaleDateString() : "-",
      e.hours?.toString() || "-",
      e.project_id || "-",
      e.work_order_id || "-",
      e.notes || "-",
    ]);

    // Create table
    autoTable(doc, {
      head: [["Worker", "Date", "Hours", "Project", "Work Order", "Notes"]],
      body: tableData,
      startY: 30,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY;
    const totalHours = entries.reduce((sum, e) => sum + (e.hours || 0), 0);

    doc.setFontSize(10);
    doc.text(`Total Entries: ${entries.length}`, 15, finalY + 10);
    doc.text(`Total Hours: ${totalHours.toFixed(2)}`, 15, finalY + 17);

    doc.save("time_entries_report.pdf");
    console.log("✅ Time entries PDF exported successfully");
  } catch (error) {
    console.error("❌ Error exporting time entries PDF:", error);
    alert("Error exporting PDF. Check console for details.");
  }
};

export const exportWorkerDetailsToCSV = (workers: Worker[]) => {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Home Address",
    "Position",
    "Role",
    "Hire Date",
    "Status",
  ];

  const rows = workers.map((w) => [
    w.first_name,
    w.last_name,
    w.email || "",
    w.phone || "",
    w.home_address || "",
    w.position_applying_for || "",
    w.role || "",
    w.hire_date ? new Date(w.hire_date).toLocaleDateString() : "",
    w.is_active ? "Active" : "Inactive",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "worker_directory.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export const exportTimeEntriesToCSV = (entries: Array<any>) => {
  const headers = [
    "Worker Name",
    "Date",
    "Hours",
    "Project ID",
    "Work Order ID",
    "Notes",
  ];

  const rows = entries.map((e) => [
    e.worker_name || "",
    e.date ? new Date(e.date).toLocaleDateString() : "",
    e.hours?.toString() || "",
    e.project_id || "",
    e.work_order_id || "",
    e.notes || "",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "time_entries.csv";
  link.click();
  URL.revokeObjectURL(url);
};
