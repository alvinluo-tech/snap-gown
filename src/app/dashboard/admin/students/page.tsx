import { getAdminStudents } from "@/app/actions/verification";
import { StudentsClient } from "./StudentsClient";
import COPY from "@/lib/constants/copy";

export default async function StudentsPage() {
  let students;
  try {
    students = await getAdminStudents();
  } catch {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{COPY.ADMIN.FAILED_TO_LOAD}</p>
      </div>
    );
  }

  return <StudentsClient students={students} />;
}
