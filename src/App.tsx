import { useState, useEffect, useRef, type CSSProperties, ReactNode } from "react";
import styles from "./App.module.scss";
import NumControl from "./components/NumControl/NumControl";
import { LinkBreak2Icon, Link2Icon, HeightIcon, CopyIcon, GitHubLogoIcon, LinkedInLogoIcon, Share1Icon } from "@radix-ui/react-icons";
import About from "./components/About/About";
import share from "./utilities/share";

const defaultColor = "#ff8c2e";
const defaultBackgroundColor = "#38c3b9";
const colorInputTitleModulator = 0.8;
const minSize = 25;
const maxSize = 225;
const maxBevel = 5;
const maxElevation = 40;

type Mode = "neu" | "glass";

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

function randHex() {
  return "#000000".replace(/0/g, function () {
    return (~~(Math.random() * 16)).toString(16);
  });
}

function randBetween(min: number, max: number) {
  return Math.round(Math.random() * (max - min)) + min;
}

function copyCode() {
  const code = document.getElementById("code")?.innerText;
  if (!code) return;
  console.log(code);
  navigator.clipboard
    .writeText(code)
    .then(() => alert("Copied to clipboard!"))
    .catch(() => alert("Failed to copy :("));
}

function Var({ v }: { v: string }) {
  return <span className={styles.variable}>{v}</span>;
}

function Prop({ p }: { p: string }) {
  return <span className={styles.property}>{p}</span>;
}

function Selector({ s }: { s: string }) {
  return <span className={styles.selector}>{s}</span>;
}

function Indent({ children }: { children: ReactNode }) {
  return <div className={styles.indented}>{children}</div>;
}

function angleBetween(p1: [number, number], p2: [number, number]) {
  return (Math.atan2(p1[1] - p2[1], p1[0] - p2[0]) * 180) / Math.PI;
}

function App() {
  const [radius, setRadius] = useState(8);
  const [size, setSize] = useState(175);
  const [color, setColor] = useState(defaultColor);
  const [backgroundColor, setBackgroundColor] = useState(defaultBackgroundColor);
  const [angle, setAngle] = useState(237);
  const [elevation, setElevation] = useState(20);
  const [intensity, setIntensity] = useState(50);
  const [diffusion, setDiffusion] = useState(50);
  const [blurriness, setBlurriness] = useState(2);
  const [bevel, setBevel] = useState(2);
  const [opacity, setOpacity] = useState(50);
  const [isLinked, setIsLinked] = useState(false);
  const [mode, setMode] = useState<Mode>("neu");
  const bulbRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const lightRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const phantomBulbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLinked && color !== backgroundColor) setBackgroundColor(color);
  }, [isLinked]);

  // The effect and event listers for dragging the light
  useEffect(() => {
    const pointermoveHandler = (event: PointerEvent) => {
      const { left, top, bottom, right } = targetRef.current!.getBoundingClientRect();
      const targetCoords: [number, number] = [left + (right - left) / 2, top + (bottom - top) / 2];
      const pointerCoords: [number, number] = [event.clientX, event.clientY];
      const angle = angleBetween(targetCoords, pointerCoords);
      setAngle(Math.round(angle + 180));
    };

    const pointerupHandler: EventListener = () => {
      lightRef.current?.classList.add("animated");
      logoRef.current?.classList.add("animated");
      targetRef.current?.classList.add("animated");
      window.document.removeEventListener("pointermove", pointermoveHandler);
    };

    const pointerdownHandler: EventListener = () => {
      lightRef.current?.classList.remove("animated");
      logoRef.current?.classList.remove("animated");
      targetRef.current?.classList.remove("animated");
      window.document.addEventListener("pointermove", pointermoveHandler);
      window.document.addEventListener("pointerup", pointerupHandler);
    };

    bulbRef.current?.addEventListener("pointerdown", pointerdownHandler);

    return () => {
      bulbRef.current?.removeEventListener("pointerdown", pointerdownHandler);
    };
  }, [bulbRef, lightRef, targetRef, logoRef]);

  // Set the logo lighting angle
  useEffect(() => {
    // We have to use a phantom bulb because the real bulb is animated, so its position in space lags behind the actual angle
    if (!phantomBulbRef.current || !logoRef.current) return;

    const { left: bLeft, top: bTop, bottom: bBottom, right: bRight } = phantomBulbRef.current.getBoundingClientRect();
    const bulbCoords: [number, number] = [bLeft + (bRight - bLeft) / 2, bTop + (bBottom - bTop) / 2];

    const { left: lLeft, top: lTop, bottom: lBottom, right: lRight } = logoRef.current.getBoundingClientRect();
    const logoCoords: [number, number] = [lLeft + (lRight - lLeft) / 2, lTop + (lBottom - lTop) / 2];

    const logoAngle = `${angleBetween(bulbCoords, logoCoords)}deg`;

    logoRef.current.style.setProperty("--angle", logoAngle);
  }, [angle, phantomBulbRef, logoRef]);

  // =============================================================
  // ========================== Utilities ========================
  // =============================================================

  function randomize() {
    setMode(Math.random() > 0.5 ? "glass" : "neu");

    const colorHex = randHex();
    setColor(colorHex);
    setBackgroundColor(isLinked ? colorHex : randHex());

    setSize(randBetween(minSize, maxSize));
    setRadius(randBetween(0, 50));
    setBevel(randBetween(0, maxBevel));
    setElevation(randBetween(0, maxElevation));

    setBlurriness(randBetween(0, 10));
    setOpacity(randBetween(0, 100));

    setAngle(randBetween(0, 360));
    setIntensity(randBetween(0, 100));
    setDiffusion(randBetween(0, 100));
  }

  const textColorForElement = hexIsLight(color)
    ? adjustHexColor(color, -colorInputTitleModulator)
    : adjustHexColor(color, colorInputTitleModulator);

  const textColorForBackground = hexIsLight(backgroundColor)
    ? adjustHexColor(backgroundColor, -colorInputTitleModulator)
    : adjustHexColor(backgroundColor, colorInputTitleModulator);

  // =============================================================
  // ========================== The Page =========================
  // =============================================================

  return (
    <div
      className={styles.app}
      style={
        {
          backgroundColor,
          "--blurriness": `${blurriness}px`,
          "--color": color,
          "--bevel": bevel + "px",
          "--opacity": `${opacity}%`,
          "--elevation": elevation + "px",
          "--intensity": intensity,
          "--diffusion": diffusion,
        } as CSSProperties
      }
    >
      <div className={styles.links}>
        <a title="View this repo on GitHub" href="https://github.com/PeterTYLiu/xmorphic" target="_blank">
          <GitHubLogoIcon />
        </a>
        <a title="LinkedIn" href="https://www.linkedin.com/in/peter-ty-liu/" target="_blank">
          <LinkedInLogoIcon />
        </a>
        <button title="share site" onClick={share}>
          <Share1Icon />
        </button>
      </div>

      <header className={styles.header}>
        <div
          className={`animated ${styles.logo} ${styles[mode]}`}
          ref={logoRef}
          style={
            {
              color: textColorForElement,
              "--angle": "0deg",
            } as CSSProperties
          }
        >
          <h1>𝑥morphic.dev</h1>
          <p>
            Physics-based, variable-driven CSS generator by{" "}
            <a target="_blank" href="https://github.com/PeterTYLiu">
              Peter Liu
            </a>
          </p>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.controls}>
          <section>
            <button className={styles.random} onClick={randomize}>
              🌈 Randomize!
            </button>
          </section>
          <section className={styles.modes}>
            <button className={mode === "neu" ? styles.active : ""} onClick={() => setMode("neu")}>
              Matte
            </button>
            <button className={mode === "glass" ? styles.active : ""} onClick={() => setMode("glass")}>
              Glass
            </button>
          </section>
          <section className={styles.colors}>
            <button title={isLinked ? "Unlink" : "Link"} onClick={() => setIsLinked(!isLinked)}>
              {isLinked ? <Link2Icon /> : <LinkBreak2Icon />}
            </button>
            <div>
              <input
                type="color"
                name="color"
                value={color}
                data-title={`Element: ${color}`}
                style={
                  {
                    "--color": textColorForElement,
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
                data-title={`Background: ${backgroundColor}`}
                style={
                  {
                    "--color": textColorForBackground,
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
                title="Switch element and background colors"
                onClick={() => {
                  setBackgroundColor(color);
                  setColor(backgroundColor);
                }}
              >
                <HeightIcon />
              </button>
            )}
          </section>
          <section>
            <NumControl name="Size" value={size} setValue={setSize} min={minSize} max={maxSize} suffix="px" />

            <NumControl name="Radius" value={radius} setValue={setRadius} min={0} max={50} suffix="%" />
            <NumControl name="Bevel" value={bevel} setValue={setBevel} min={0} max={maxBevel} step={0.1} suffix="px" />

            <NumControl
              name="Elevation"
              value={elevation}
              description="The element can be thought of as a physical object with a certain elevation above the ground; the size and shape of its shadows are in part determined by this elevation"
              setValue={setElevation}
              suffix="px"
              min={0}
              max={maxElevation}
            />
          </section>

          {mode === "glass" && (
            <section>
              <h2>Glass properties</h2>
              <NumControl name="Blurriness" value={blurriness} setValue={setBlurriness} min={0} max={10} step={0.1} />
              <NumControl name="Opacity" value={opacity} setValue={setOpacity} min={0} max={100} suffix="%" />
              {opacity === 100 && (
                <details>
                  <summary>
                    Hey, isn't <i>matte</i> just <i>glass</i> at 100% opacity? 🤔
                  </summary>
                  <p>
                    Almost! But if you{" "}
                    <a target="_blank" href="https://www.youtube.com/watch?v=yxXANiCBkGU&t=62s">
                      look closely,
                    </a>{" "}
                    you can see the surface sheen is different. This is to avoid using a pseudo element when there is no glass effect.
                  </p>
                </details>
              )}
            </section>
          )}

          <section>
            <h2>Light properties</h2>
            <NumControl
              name="Angle"
              value={angle}
              setValue={setAngle}
              min={0}
              max={360}
              suffix="°"
              description="Try dragging the light bulb to change the angle!"
            />
            <NumControl
              name="Intensity"
              value={intensity}
              setValue={setIntensity}
              min={0}
              max={100}
              description="How intense is the light?"
            />

            <NumControl
              name="Diffusion"
              value={diffusion}
              description="How diffuse is the light?"
              setValue={setDiffusion}
              min={0}
              max={100}
            />
          </section>
        </div>

        <div className={styles.container}>
          <div
            className={`${styles.text} animated`}
            style={{
              opacity: mode === "glass" ? "1" : "0",
              color: textColorForBackground,
            }}
          >
            For my military knowledge, though I'm plucky and adventury,
            <br />
            Has only been brought down to the beginning of the century;
            <br />
            But still, in matters vegetable, animal, and mineral,
            <br />I am the very model of a modern Major-General.
          </div>
          <div className={`${styles.light} ${styles["phantom-light"]}`} style={{ rotate: angle + 90 + "deg" }}>
            <div className={styles["phantom-bulb"]} ref={phantomBulbRef} />
          </div>
          <div className={`${styles.light} animated`} ref={lightRef} style={{ rotate: angle + 90 + "deg" }}>
            <div className={styles.bulb} ref={bulbRef} style={{ "--intensity": intensity } as CSSProperties} />
          </div>
          <div
            className={`${styles.target} ${styles[mode]} animated`}
            ref={targetRef}
            style={
              {
                width: size + "px",
                "--angle": `${angle}deg`,
                "--radius": radius + "%",
              } as CSSProperties
            }
          />
        </div>

        <code className={styles.code} id="code">
          <button className={styles.copy} onClick={copyCode} title="Copy to clipboard">
            <CopyIcon />
          </button>
          <pre className={styles.pre}>
            <Selector s=".parent" /> {"{"}
            <Indent>
              <Prop p="background-color" />: {backgroundColor};
            </Indent>
            {"}"}
            <br />
            <br />
            <Selector s=".my-element" /> {"{"}
            <Indent>
              <span className={styles.comment}>/*===== Configurable Variables =====*/</span>
              <br />
              <span className={styles.comment}>/*======= Only these change! =======*/</span>
              <br />
              <Var v="--color" />: {color};
              <br />
              <Var v="--radius" />: {radius}%;
              <br />
              <Var v="--elevation" />: {elevation}px;
              <br />
              <Var v="--bevel" />: {bevel}px;
              <br />
              {mode === "glass" && (
                <>
                  <Var v="--opacity" />: {opacity}%;
                  <br />
                  <Var v="--blurriness" />: {blurriness}px;
                  <br />
                </>
              )}
              <Var v="--angle" />: {angle}deg;
              <br />
              <Var v="--intensity" />: {intensity};
              <br />
              <Var v="--diffusion" />: {diffusion};
              <br />
              <br />
              <span className={styles.comment}>/*======= Computed Variables =======*/</span>
              <br />
              <Var v="--sin" />: calc(sin(var(
              <Var v="--angle" />
              )));
              <br />
              <Var v="--sin-90" />: calc(sin(var(
              <Var v="--angle" />
              ) + 90deg));
              <br />
              <Var v="--sin-180" />: calc(sin(var(
              <Var v="--angle" />
              ) + 180deg));
              <br />
              <Var v="--sin-270" />: calc(sin(var(
              <Var v="--angle" />
              ) + 270deg));
              <br />
              <Var v="--x-displacement" />: calc(var(
              <Var v="--sin-270" />) * (var(
              <Var v="--elevation" />) + 1px));
              <br />
              <Var v="--y-displacement" />: calc(var(
              <Var v="--sin-180" />) * (var(
              <Var v="--elevation" />) + 1px));
              <br />
              <Var v="--edge-opacity" />: calc(var(
              <Var v="--intensity" />) * 0.006 - var(
              <Var v="--diffusion" />) * 0.002);
              <br />
              <Var v="--edge-blur" />: calc(var(
              <Var v="--bevel" />) * 1.5);
              <br />
              <Var v="--surface-contrast" />: calc(var(
              <Var v="--intensity" />) * 0.01 - var(
              <Var v="--diffusion" />) * 0.005);
              <br />
              <br />
              <span className={styles.comment}>/*======= Computed Properties =======*/</span>
              <br />
              <Prop p="border-radius" />: var(
              <Var v="--radius" />
              );
              <br />
              <Prop p="box-shadow" />: var(
              <Var v="--x-displacement" />) var(
              <Var v="--y-displacement" />) calc(var(
              <Var v="--diffusion" />) * 0.3px + (var(
              <Var v="--elevation" />) * 0.15)) calc(var(
              <Var v="--elevation" />) / 2) rgba(0, 0, 0, calc(var(
              <Var v="--intensity" />) * 0.006)),
              <Indent>
                0px 0px calc(var(
                <Var v="--diffusion" />) * 1.4px) rgba(255, 255, 255, calc(var(
                <Var v="--intensity" />) * 0.004)),
                <br />
                inset calc(var(
                <Var v="--bevel" />) * -1) 0 var(
                <Var v="--edge-blur" />) hsla(100, 0%, calc((var(
                <Var v="--sin-90" />) + 1) * 50%), var(
                <Var v="--edge-opacity" />
                )),
                <br />
                inset 0 var(
                <Var v="--bevel" />) var(
                <Var v="--edge-blur" />) hsla(100, 0%, calc((var(
                <Var v="--sin-180" />) + 1) * 50%), var(
                <Var v="--edge-opacity" />
                )),
                <br />
                inset var(
                <Var v="--bevel" />) 0 var(
                <Var v="--edge-blur" />) hsla(100, 0%, calc((var(
                <Var v="--sin-270" />) + 1) * 50%), var(
                <Var v="--edge-opacity" />
                )),
                <br />
                inset 0 calc(var(
                <Var v="--bevel" />) * -1) var(
                <Var v="--edge-blur" />) hsla(100, 0%, calc((var(
                <Var v="--sin" />) + 1) * 50%), var(
                <Var v="--edge-opacity" />
                ));
              </Indent>
              {mode === "glass" && (
                <>
                  <Prop p="backdrop-filter" />: blur(var(
                  <Var v="--blurriness" />
                  ));
                  <br />
                  <Prop p="background-color" />: color-mix(in srgb, var(
                  <Var v="--color" />) var(
                  <Var v="--opacity" />
                  ), transparent calc(100% - var(
                  <Var v="--opacity" />
                  )));
                  <br />
                </>
              )}
              {mode !== "glass" && (
                <>
                  <Prop p="background" />: linear-gradient(
                  <Indent>
                    calc(var(
                    <Var v="--angle" />) + 90deg),
                    <br />
                    rgba(0, 0, 0, var(
                    <Var v="--surface-contrast" />
                    )),
                    <br />
                    rgba(255, 255, 255, var(
                    <Var v="--surface-contrast" />
                    ))
                    <br />
                    ),
                    <br />
                    var(
                    <Var v="--color" />
                    );
                  </Indent>
                </>
              )}
              <br />
              <span className={styles.comment}>/*======== Static Properties ========*/</span>
              <br />
              <Prop p="background-blend-mode" />: soft-light;
              {mode === "glass" && (
                <>
                  <br />
                  <Prop p="position" />: relative;
                </>
              )}
            </Indent>
            {"}"}
            {mode === "glass" && (
              <>
                <br />
                <br />
                <Selector s=".my-element::before" /> {"{"}
                <Indent>
                  <Prop p="content" />: "";
                  <br />
                  <Prop p="position" />: absolute;
                  <br />
                  <Prop p="bottom" />: 0;
                  <br />
                  <Prop p="top" />: 0;
                  <br />
                  <Prop p="left" />: 0;
                  <br />
                  <Prop p="right" />: 0;
                  <br />
                  <Prop p="border-radius" />: var(
                  <Var v="--radius" />
                  );
                  <br />
                  <Prop p="background" />: linear-gradient(calc(var(
                  <Var v="--angle" />) + 90deg), hsla(0, 0%, 100%, 0) 40%, hsla(0, 0%, 100%, var(
                  <Var v="--surface-contrast" />
                  )));
                </Indent>
                {"}"}
              </>
            )}
            <br />
            <br />
            <span className={styles.comment}>/*== Made using xmorphic.dev by Peter Liu ==*/</span>
          </pre>
        </code>
      </main>
      <About color={textColorForBackground} />
    </div>
  );
}

export default App;
