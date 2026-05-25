import { getAdminStudents } from "@/app/actions/verification";
import { StudentsClient } from "./StudentsClient";

export default async function StudentsPage() {
  let students;
  try {
    students = await getAdminStudents();
  } catch {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Failed to load students.</p>
      </div>
    );
  }

  return <StudentsClient students={students} />;
}
