"use client";

import Image from "next/image";
import { useState } from "react";
import { skills } from "@/data/skills";
import { skillIcons } from "@/data/skill-icons";
import styles from "./TechStack.module.css";

export function TechStackFilter() {
  const [selected, setSelected] = useState("all");
  const categories = [{ id: "all", label: "All" }, ...skills];
  const visibleSkills = skills
    .filter((category) => selected === "all" || selected === category.id)
    .flatMap((category) => [...category.items]);

  return (
    <>
      <div className={styles.filters} role="group" aria-label="Filter tech stack by category">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-pressed={selected === category.id}
            aria-controls="skill-list"
            onClick={() => setSelected(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
      <ul key={selected} id="skill-list" className={styles.list} aria-label="Skills and tools" role="list">
        {visibleSkills.map((item) => (
            <li key={item} className={styles.chip}>
              {skillIcons[item] ? (
                <Image
                  src={skillIcons[item]}
                  alt=""
                  width={16}
                  height={16}
                  className={`${styles.icon} ${["Next.js", "GitHub", "Vercel", "Codex"].includes(item) ? styles.adaptiveIcon : ""}`}
                />
              ) : null}
              <span>{item}</span>
            </li>
        ))}
      </ul>
      <p className={styles.status} role="status">
        {selected === "all" ? "All categories" : categories.find((category) => category.id === selected)?.label}: {visibleSkills.length} skills and tools
      </p>
    </>
  );
}
