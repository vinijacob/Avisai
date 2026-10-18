"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import type { Area, Catalog, Shift } from "./types";

let cached: Promise<Catalog> | null = null;

function loadCatalog() {
  cached ??= api.catalog().catch((error) => {
    cached = null;
    throw error;
  });
  return cached;
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  useEffect(() => {
    let active = true;
    loadCatalog()
      .then((data) => active && setCatalog(data))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return catalog;
}

export const areaLabels: Record<Area, string> = {
  technology: "Tecnologia",
  health: "Saúde",
  business: "Negócios",
  engineering: "Engenharias",
  humanities: "Humanas",
};

export const shiftLabels: Record<Shift, string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
  full_time: "Integral",
};

export function coursesByArea(catalog: Catalog) {
  return catalog.areas.map((area) => ({
    ...area,
    courses: catalog.courses.filter((course) => course.area === area.value).map((course) => course.name),
  }));
}
