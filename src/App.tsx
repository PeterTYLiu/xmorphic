import { useState, useEffect, useRef, type CSSProperties } from "react";
import styles from "./App.module.scss";
import NumControl from "./components/NumControl/NumControl";
import { LinkBreak2Icon, Link2Icon, HeightIcon } from "@radix-ui/react-icons";

const defaultColor = "#59a680";
const colorInputTitleModulator = 0.8;
type Mode = "skeuo" | "neu" | "glass" | "x";

function adjustHexColor(hex: string, magnitude: number) {
  // magnitude is a float between -1 and 1;
  // -1 darkens the color to black, +1 lightens it to white
  if (magnitude === 0) return hex;
  const clampedMag = Math.min(Math.max(magnitude, -1), 1);
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  const hexArr = [r, g, b].map((v) => {
    const float = clampedMag > 0 ? Math.min(v + (255 - v) * clampedMag, 255) : v + v * clampedMag;
    const str = Math.round(float).toString(16);
    return str.length === 1 ? `0${str}` : str;
  });

  return `#${hexArr.join("")}`;
}

function hexIsLight(hex: string) {
  const num = parseInt(hex.substring(1), 16);
  return num > 256 ** 3 / 2;
}

function numToHex(num: number) {
  const str = (num * 255).toString(16);
  return str.length === 1 ? `0${str}` : str.substring(0, 2);
}

function Var({ v }: { v: string }) {
  return <span className={styles.variable}>{v}</span>;
}

function Prop({ p }: { p: string }) {
  return <span className={styles.property}>{p}</span>;
}

function App() {
  const [radius, setRadius] = useState(8);
  const [size, setSize] = useState(175);
  const [color, setColor] = useState(defaultColor);
  const [backgroundColor, setBackgroundColor] = useState(defaultColor);
  const [angle, setAngle] = useState(237);
  const [elevation, setElevation] = useState(20);
  const [intensity, setIntensity] = useState(50);
  const [blurriness, setBlurriness] = useState(3);
  const [bevel, setBevel] = useState(1.5);
  const [opacity, setOpacity] = useState(0.5);
  const [isLinked, setIsLinked] = useState(true);
  const [mode, setMode] = useState<Mode>("neu");
  const bulbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLinked && color !== backgroundColor) setBackgroundColor(color);
  }, [isLinked]);

  // The effect and event listers for dragging the light
  useEffect(() => {
    const pointermoveHandler = (event: PointerEvent) => {
      const { left, top, bottom, right } = document.getElementById("target")!.getBoundingClientRect();
      const [targetX, targetY] = [left + (right - left) / 2, top + (bottom - top) / 2];
      const [pointerX, pointerY] = [event.clientX, event.clientY];
      const angle = (Math.atan2(targetY - pointerY, targetX - pointerX) * 180) / Math.PI;
      setAngle(Math.round(angle + 180));
    };

    const pointerupHandler: EventListener = (event) => {
      window.document.removeEventListener("pointermove", pointermoveHandler);
    };

    const pointerdownHandler: EventListener = (event) => {
      window.document.addEventListener("pointermove", pointermoveHandler);
      window.document.addEventListener("pointerup", pointerupHandler);
    };

    if (bulbRef) bulbRef.current?.addEventListener("pointerdown", pointerdownHandler);

    return () => {
      bulbRef.current?.removeEventListener("pointerdown", pointerdownHandler);
    };
  }, [bulbRef]);

  // =============================================================
  // ==================== Intermediary Values ====================
  // =============================================================

  const backgroundGradientAngle = (angle + 90) % 360;

  // =============================================================
  // ========================== The Page =========================
  // =============================================================

  return (
    <div className={styles.App} style={{ backgroundColor }}>
      <header className={styles.header}>
        <select onChange={(e) => setMode(e.target.value as Mode)}>
          <option value="neu">neu</option>
          <option value="glass">glass</option>
          <option value="skeuo">skeuo</option>
          <option value="x">𝑥</option>
        </select>
        morphic
      </header>
      <main className={styles.main}>
        <div className={styles.controls}>
          <div className={styles.colors}>
            <button onClick={() => setIsLinked(!isLinked)}>{isLinked ? <Link2Icon /> : <LinkBreak2Icon />}</button>
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
          <NumControl name="Size" value={size} setValue={setSize} min={25} max={225} suffix="px" />

          <NumControl name="Radius" value={radius} setValue={setRadius} min={0} max={50} suffix="%" />

          <NumControl name="Angle" value={angle} setValue={setAngle} min={0} max={360} suffix="°" />

          <NumControl
            name="Elevation"
            value={elevation}
            description="The element can be thought of as a physical object with a certain elevation above the ground; the size and shape of its shadows are in part determined by this elevation"
            setValue={setElevation}
            min={0}
            max={40}
          />

          <NumControl name="Intensity" value={intensity} setValue={setIntensity} min={0} max={100} />
          <NumControl name="Bevel" value={bevel} setValue={setBevel} min={0} max={20} step={0.1} />

          {mode === "glass" && (
            <>
              <NumControl name="Opacity" value={opacity} setValue={setOpacity} min={0} max={1} step={0.01} />
              <NumControl name="Blur" value={blurriness} setValue={setBlurriness} min={0} max={10} step={0.1} />
            </>
          )}
        </div>

        <div className={styles.container}>
          {mode === "glass" && (
            <div
              className={styles.text}
              style={{
                color: hexIsLight(backgroundColor)
                  ? adjustHexColor(backgroundColor, -colorInputTitleModulator)
                  : adjustHexColor(backgroundColor, colorInputTitleModulator),
              }}
            >
              For my military knowledge, though I'm plucky and adventury,
              <br />
              Has only been brought down to the beginning of the century;
              <br />
              But still, in matters vegetable, animal, and mineral,
              <br />I am the very model of a modern Major-General.
            </div>
          )}
          <div className={styles.light} style={{ rotate: angle + 90 + "deg" }}>
            <div className={styles.bulb} ref={bulbRef} style={{ "--intensity": intensity } as CSSProperties} />
          </div>
          <div
            className={`${styles.target} ${styles[mode]}`}
            id="target"
            style={
              {
                "--blur": `${blurriness}px`,
                "--radius": radius + "%",
                "--color": color,
                "--bevel": bevel + "px",
                "--glass-bg": color + numToHex(opacity),
                "--angle": `${backgroundGradientAngle}deg`,
                "--elevation": elevation,
                "--intensity": intensity,
                "--size": size + "px",
              } as CSSProperties
            }
          />
        </div>

        <pre className={styles.code}>
          {!isLinked && (
            <>
              <span className={styles.property}>background-color:</span> {backgroundColor};{" "}
              <span className={styles.comment}>/* Put this on the element's parent */</span>
              <br />
              <br />
            </>
          )}
          <span className={styles.comment}>/*========= Configurable Variables =========*/</span>
          <br />
          <span className={styles.comment}>/*=========== Only these change! ===========*/</span>
          <br />
          <Var v="--primary-color" />: {color};
          <br />
          <Var v="--size" />: {size}px;
          <br />
          <Var v="--radius" />: {radius}%;
          <br />
          <Var v="--angle" />: {backgroundGradientAngle}deg;
          <br />
          <Var v="--elevation" />: {elevation};
          <br />
          <Var v="--intensity" />: {intensity};
          <br />
          <Var v="--bevel" />: {bevel}px;
          <br />
          <br />
          <span className={styles.comment}>/*=========== Computed Variables ===========*/</span>
          <br />
          <Var v="--sin" />: calc(sin(var(
          <Var v="--angle" />
          )));
          <br />
          <Var v="--sin-90" />: calc(sin(var(
          <Var v="--angle" />
          ) + 90deg));;
          <br />
          <Var v="--sin-180" />: calc(sin(var(
          <Var v="--angle" />
          ) + 180deg));;
          <br />
          <Var v="--sin-270" />: calc(sin(var(
          <Var v="--angle" />
          ) + 270deg));;
          <br />
          <Var v="--x-displacement" />: calc(var(
          <Var v="--size" />) * var(
          <Var v="--sin-180" />) * 0.01 * var(
          <Var v="--elevation" />
          ));
          <br />
          <Var v="--y-displacement" />: calc(var(
          <Var v="--size" />) * var(
          <Var v="--sin-90" />) * 0.01 * var(
          <Var v="--elevation" />
          ));
          <br />
          <Var v="--edge-opacity" />: calc(var(
          <Var v="--elevation" />) * 0.003);
          <br />
          <br />
          <span className={styles.comment}>/*=========== Computed Properties ===========*/</span>
          <br />
          <Prop p="width" />: <Var v="--size" />;
          <br />
          <Prop p="border-radius" />: <Var v="--radius" />;
          <br />
          <Prop p="background" />: linear-gradient(
          <br />
          <span className={styles.indented2}>
            var(
            <Var v="--angle" />
            ),
          </span>
          <br />
          <span className={styles.indented2}>
            rgba(0, 0, 0, calc(var(
            <Var v="--intensity" />) * 0.002)),
          </span>
          <br />
          <span className={styles.indented2}>
            rgba(255, 255, 255, calc(var(
            <Var v="--intensity" />) * 0.002))
          </span>
          <br />
          <span className={styles.indented}>),</span>
          <br />
          <span className={styles.indented}>
            var(
            <Var v="--primary-color" />
            );
          </span>
          <br />
          <Prop p="box-shadow" />: calc(var(
          <Var v="--x-displacement" />) * -1) calc(var(
          <Var v="--y-displacement" />) * -1) calc(var(
          <Var v="--size" />) * 2.5) rgba(255, 255, 255, calc(var(
          <Var v="--intensity" />) * 0.004)),
          <br />
          <span className={styles.indented}>
            var(
            <Var v="--x-displacement" />) var(
            <Var v="--y-displacement" />) calc(var(
            <Var v="--size" />) * 0.02 * var(
            <Var v="--elevation" />
            )) rgba(0, 0, 0, calc(var(
            <Var v="--intensity" />) * 0.006)),
          </span>
          <br />
          <span className={styles.indented}>
            inset -1px 0 hsla(100, 0%, calc((var(
            <Var v="--sin" />) + 1) * 50%), var(
            <Var v="--edge-opacity" />
            )),
          </span>
          <br />
          <span className={styles.indented}>
            inset 0 1px hsla(100, 0%, calc((var(
            <Var v="--sin-90" />) + 1) * 50%), var(
            <Var v="--edge-opacity" />
            )),
          </span>
          <br />
          <span className={styles.indented}>
            inset 1px 0 hsla(100, 0%, calc((var(
            <Var v="--sin-180" />) + 1) * 50%), var(
            <Var v="--edge-opacity" />
            )),
          </span>
          <br />
          <span className={styles.indented}>
            inset 0 -1px hsla(100, 0%, calc((var(
            <Var v="--sin-270" />) + 1) * 50%), var(
            <Var v="--edge-opacity" />
            ));
          </span>
          <br />
          <br />
          <span className={styles.comment}>/*============ Static Properties ============*/</span>
          <br />
          <Prop p="background-blend-mode" />: soft-light;
          <br />
          <Prop p="aspect-ratio" />: 1;
        </pre>
      </main>
    </div>
  );
}

export default App;
