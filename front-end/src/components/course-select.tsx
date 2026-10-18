"use client";

import type { SelectHTMLAttributes } from "react";
import { coursesByArea, useCatalog } from "@/lib/catalog";
import { Select } from "./ui";

type CourseSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> & {
  value: string;
  onChange: (course: string) => void;
};

export function CourseSelect({ value, onChange, ...props }: CourseSelectProps) {
  const catalog = useCatalog();

  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} disabled={!catalog} {...props}>
      <option value="">{catalog ? "Selecione seu curso" : "Carregando cursos…"}</option>
      {catalog &&
        coursesByArea(catalog).map((area) => (
          <optgroup key={area.value} label={area.label}>
            {area.courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </optgroup>
        ))}
    </Select>
  );
}
