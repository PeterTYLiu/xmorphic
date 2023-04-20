import type { Dispatch } from "react";
import styles from "./NumControl.module.scss";

interface NumControlProps {
  value: number;
  setValue: Dispatch<number>;
  name: string;
  min: number;
  max: number;
  prefix?: string;
  suffix?: string;
  description?: string;
}

export default function NumControl({
  value,
  setValue,
  name,
  prefix = "",
  suffix = "",
  description = "",
  min,
  max,
}: NumControlProps) {
  return (
    <div className={styles["num-control"]}>
      <label htmlFor={name}>
        {description ? <abbr title={description}>{name}</abbr> : name}
      </label>
      <input
        id={name}
        name={name}
        type="range"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        min={min}
        max={max}
      />
      <span>
        {prefix}
        {value}
        {suffix}
      </span>
    </div>
  );
}
