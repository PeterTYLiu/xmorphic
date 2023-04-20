import { useState, useEffect, useRef, type CSSProperties } from "react";
import styles from "./App.module.scss";
import NumControl from "./components/NumControl/NumControl";
import { LinkBreak2Icon, Link2Icon, HeightIcon } from "@radix-ui/react-icons";

const pi = Math.PI;
const borderColorModulator = 0.13;
const backgroundGradientModulator = 0.06;
const defaultColor = "#59a680";
const colorInputTitleModulator = 0.8;

function adjustHexColor(hex: string, magnitude: number) {
  // magnitude is a float between -1 and 1;
  // -1 darkens the color to black, +1 lightens it to white
  if (magnitude === 0) return hex;
  const clampedMag = Math.min(Math.max(magnitude, -1), 1);
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  const hexArr = [r, g, b].map((v) => {
    const float =
      clampedMag > 0
        ? Math.min(v + (255 - v) * clampedMag, 255)
        : v + v * clampedMag;
    const str = Math.round(float).toString(16);
    return str.length === 1 ? `0${str}` : str;
  });

  return `#${hexArr.join("")}`;
}

function toRad(deg: number) {
  return deg * (pi / 180);
}

function hexIsLight(hex: string) {
  const num = parseInt(hex.substring(1), 16);
  return num > 256 ** 3 / 2;
}

function percentToHex(percent: number) {
  const hex = Math.round(percent * 2.55).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function App() {
  const [radius, setRadius] = useState(8);
  const [size, setSize] = useState(150);
  const [color, setColor] = useState(defaultColor);
  const [backgroundColor, setBackgroundColor] = useState(defaultColor);
  const [angle, setAngle] = useState(225);
  const [height, setHeight] = useState(10);
  const [opacity, setOpacity] = useState(100);
  const [isLinked, setIsLinked] = useState(true);
  const bulbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLinked && color !== backgroundColor) setBackgroundColor(color);
  }, [isLinked]);

  // The effect and event listers for dragging the light
  useEffect(() => {
    const pointermoveHandler = (event: PointerEvent) => {
      const { left, top, bottom, right } = document
        .getElementById("target")!
        .getBoundingClientRect();
      const [targetX, targetY] = [
        left + (right - left) / 2,
        top + (bottom - top) / 2,
      ];
      const [pointerX, pointerY] = [event.clientX, event.clientY];
      const angle =
        (Math.atan2(targetY - pointerY, targetX - pointerX) * 180) / Math.PI;
      setAngle(Math.round(angle + 180));
    };

    const pointerupHandler: EventListener = (event) => {
      window.document.removeEventListener("pointermove", pointermoveHandler);
    };

    const pointerdownHandler: EventListener = (event) => {
      window.document.addEventListener("pointermove", pointermoveHandler);
      window.document.addEventListener("pointerup", pointerupHandler);
    };

    if (bulbRef)
      bulbRef.current?.addEventListener("pointerdown", pointerdownHandler);

    return () => {
      bulbRef.current?.removeEventListener("pointerdown", pointerdownHandler);
    };
  }, [bulbRef]);

  // =============================================================
  // ==================== Intermediary Values ====================
  // =============================================================

  const rads = toRad(angle);

  const xDisplacement = Math.round(size * Math.cos(rads) * 0.01 * height);

  const yDisplacement = Math.round(size * Math.sin(rads) * 0.01 * height);

  const background = `linear-gradient(${
    (angle + 90) % 360
  }deg, ${adjustHexColor(color, -backgroundGradientModulator)}${
    percentToHex(opacity) === "ff" ? "" : percentToHex(opacity)
  }, ${adjustHexColor(color, backgroundGradientModulator)}${
    percentToHex(opacity) === "ff" ? "" : percentToHex(opacity)
  })`;

  // =============================================================
  // ======================== Box Shadow =========================
  // =============================================================

  const lightShadow = `${xDisplacement}px ${yDisplacement}px ${Math.round(
    size * 0.02 * height
  )}px #ffffff14`;

  const darkShadow = `${-xDisplacement}px ${-yDisplacement}px ${Math.round(
    size * 0.02 * (height + 0.5)
  )}px #00000033`;

  // Change which shadow is on top depending on the darkness of the primary color
  const combinedShadow = hexIsLight(color)
    ? `${darkShadow}, ${lightShadow}`
    : `${lightShadow}, ${darkShadow}`;

  const boxShadow = height ? combinedShadow : darkShadow;

  // =============================================================
  // ========================== Borders ==========================
  // =============================================================

  const borderTopColor = adjustHexColor(
    color,
    Math.sin(-rads) * borderColorModulator
  );
  const borderLeftColor = adjustHexColor(
    color,
    Math.sin(toRad(angle - 90)) * borderColorModulator
  );
  const borderBottomColor = adjustHexColor(
    color,
    Math.sin(rads) * borderColorModulator
  );
  const borderRightColor = adjustHexColor(
    color,
    Math.cos(rads) * borderColorModulator
  );

  // =============================================================
  // ========================== The Page =========================
  // =============================================================

  return (
    <div className={styles.App} style={{ backgroundColor }}>
      <div className={styles.controls}>
        <div className={styles.colors}>
          <button onClick={() => setIsLinked(!isLinked)}>
            {isLinked ? <Link2Icon /> : <LinkBreak2Icon />}
          </button>
          <div>
            <input
              type="color"
              name="color"
              value={color}
              data-title={`Element color: ${color}`}
              style={
                {
                  "--color": hexIsLight(color)
                    ? adjustHexColor(color, -colorInputTitleModulator)
                    : adjustHexColor(color, colorInputTitleModulator),
                } as CSSProperties
              }
              onChange={({ target }) => {
                setColor(target.value);
                if (isLinked) setBackgroundColor(target.value);
              }}
            />

            <input
              type="color"
              name="background color"
              value={backgroundColor}
              data-title={`Background color: ${backgroundColor}`}
              style={
                {
                  "--color": hexIsLight(backgroundColor)
                    ? adjustHexColor(backgroundColor, -colorInputTitleModulator)
                    : adjustHexColor(backgroundColor, colorInputTitleModulator),
                } as CSSProperties
              }
              onChange={({ target }) => {
                setBackgroundColor(target.value);
                if (isLinked) setColor(target.value);
              }}
            />
          </div>
          {!isLinked && color !== backgroundColor && (
            <button
              onClick={() => {
                setBackgroundColor(color);
                setColor(backgroundColor);
              }}
            >
              <HeightIcon />
            </button>
          )}
        </div>
        <NumControl
          name="Size"
          value={size}
          setValue={setSize}
          min={50}
          max={200}
          suffix="px"
        />

        <NumControl
          name="Radius"
          value={radius}
          setValue={setRadius}
          min={0}
          max={50}
          suffix="%"
        />

        <NumControl
          name="Angle"
          value={angle}
          setValue={setAngle}
          min={0}
          max={360}
          suffix="°"
        />

        <NumControl
          name="Height"
          value={height}
          description="The element can be thought of as a physical object with a certain height above the ground; the size and shape of its shadows are in part determined by this height"
          setValue={setHeight}
          min={0}
          max={30}
        />

        <NumControl
          name="Opacity"
          value={opacity}
          setValue={setOpacity}
          min={0}
          max={100}
          suffix="%"
        />
      </div>

      <div className={styles.container}>
        <div className={styles.light} style={{ rotate: angle + 90 + "deg" }}>
          <div className={styles.bulb} ref={bulbRef} />
        </div>
        <div
          className={styles.target}
          id="target"
          style={{
            borderRadius: radius + "%",
            background,
            width: size + "px",
            height: size + "px",
            borderTopColor,
            borderBottomColor,
            borderLeftColor,
            borderRightColor,
            boxShadow,
          }}
        />
      </div>

      <pre className={styles.code}>
        <span className={styles.comment}>/*** Primary color: {color} ***/</span>
        <br />
        {!isLinked && (
          <>
            <span className={styles.comment}>
              /*** Background color: {backgroundColor} ***/
            </span>
            <br />
          </>
        )}
        <br />
        <span className={styles.attribute}>border-radius:</span> {radius}%;
        <br />
        <span className={styles.attribute}>background:</span> {background};
        <br />
        <span className={styles.attribute}>box-shadow:</span> {boxShadow};
        <br />
        <br />
        <span className={styles.attribute}>border-width:</span> 1px;
        <br />
        <span className={styles.attribute}>border-style:</span> solid;
        <br />
        <span className={styles.attribute}>border-top-color:</span>{" "}
        {borderTopColor};
        <br />
        <span className={styles.attribute}>border-left-color:</span>{" "}
        {borderLeftColor};
        <br />
        <span className={styles.attribute}>border-bottom-color:</span>{" "}
        {borderBottomColor};
        <br />
        <span className={styles.attribute}>border-right-color:</span>{" "}
        {borderRightColor};
      </pre>
    </div>
  );
}

export default App;
