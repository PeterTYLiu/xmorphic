import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import styles from "./App.module.scss";
import NumControl from "./components/NumControl/NumControl";
import { LinkBreak2Icon, Link2Icon, HeightIcon, CopyIcon, GitHubLogoIcon, LinkedInLogoIcon, Share1Icon } from "@radix-ui/react-icons";
import About from "./components/About/About";
import share from "./utilities/share";
import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";

const defaultColor = "#41b011";
const defaultBackgroundColor = "#8a6bc0";
const colorInputTitleModulator = 0.8;
const minSize = 25;
const maxSize = 225;
const maxBevel = 5;
const maxElevation = 40;
const defaultIntensity = 70;
const defaultDiffusion = 30;
const defaultRadius = 10;

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

function angleBetween(p1: [number, number], p2: [number, number]) {
  return (Math.atan2(p1[1] - p2[1], p1[0] - p2[0]) * 180) / Math.PI;
}

function App() {
  const [radius, setRadius] = useState(defaultRadius);
  const [size, setSize] = useState(175);
  const [color, setColor] = useState(defaultColor);
  const [backgroundColor, setBackgroundColor] = useState(defaultBackgroundColor);
  const [angle, setAngle] = useState(237);
  const [elevation, setElevation] = useState(20);
  const [intensity, setIntensity] = useState(defaultIntensity);
  const [diffusion, setDiffusion] = useState(defaultDiffusion);
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
  const codeRef = useRef<HTMLElement | null>(null);

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

  // Highlight the generated CSS
  useEffect(() => {
    hljs.registerLanguage("css", css);
    hljs.configure({ languages: ["css"] });
  }, []);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute("data-highlighted");
      codeRef.current.classList.remove("hljs", "langauge-css");
      hljs.highlightElement(codeRef.current);
    }
  }, [radius, color, backgroundColor, angle, elevation, intensity, diffusion, blurriness, bevel, opacity, mode, codeRef]);

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

  function copyCode() {
    const code = codeRef.current?.innerText;
    if (!code) return;
    navigator.clipboard
      .writeText(code)
      .then(() => alert("Copied to clipboard!"))
      .catch(() => alert("Failed to copy :("));
  }

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

        <pre className={styles.pre}>
          <button className={styles.copy} onClick={copyCode} title="Copy to clipboard">
            <CopyIcon />
          </button>
          <code className={styles.code} ref={codeRef}>
            {`.parent {
  background-color: ${backgroundColor};
}

.my-element {
  /*===== Configurable Variables =====*/
  /*======= Only these change! =======*/
  --color: ${color};
  --radius: ${radius}%;
  --elevation: ${elevation}px;
  --bevel: ${bevel}px;${
              mode === "glass"
                ? `
  --opacity: ${opacity}%;
  --blurriness: ${blurriness}px;`
                : ``
            }
  --angle: ${angle}deg;
  --intensity: ${intensity};
  --diffusion: ${diffusion};

  /*======= Computed Variables =======*/
  --sin: calc(sin(var(--angle)));
  --cos: calc(cos(var(--angle)));
  --x-displacement: calc(-1 * var(--cos) * (var(--elevation) + 1px));
  --y-displacement: calc(-1 * var(--sin) * (var(--elevation) + 1px));
  --edge-opacity: calc(var(--intensity) * 0.006 - var(--diffusion) * 0.002);
  --edge-blur: calc(var(--bevel) * 1.5);
  --surface-contrast: calc(var(--intensity) * 0.01 - var(--diffusion) * 0.005);

  /*======= Computed Properties =======*/
  border-radius: var(--radius);
  box-shadow: var(--x-displacement) var(--y-displacement) calc(var(--diffusion) * 0.3px + (var(--elevation))) calc(var(--elevation) / 2) rgba(0, 0, 0, calc(var(--intensity) * 0.006)),
    0px 0px calc(var(--diffusion) * 1.4px) rgba(255, 255, 255, calc(var(--intensity) * 0.004)),
    inset calc(var(--bevel) * -1) 0 var(--edge-blur) hsla(100, 0%, calc((var(--cos) + 1) * 50%), var(--edge-opacity)),
    inset 0 var(--bevel) var(--edge-blur) hsla(100, 0%, calc((-1 * var(--sin) + 1) * 50%), var(--edge-opacity)),
    inset var(--bevel) 0 var(--edge-blur) hsla(100, 0%, calc((-1 * var(--cos) + 1) * 50%), var(--edge-opacity)),
    inset 0 calc(var(--bevel) * -1) var(--edge-blur) hsla(100, 0%, calc((var(--sin) + 1) * 50%), var(--edge-opacity));
  ${
    mode === "glass"
      ? `background-color: color-mix(in srgb, var(--color) var(--opacity), transparent calc(100% - var(--opacity)));
  backdrop-filter: blur(var(--blurriness));
      `
      : `background: linear-gradient(
    calc(var(--angle) + 90deg),
    rgba(0, 0, 0, var(--surface-contrast)),
    rgba(255, 255, 255, var(--surface-contrast))
    ),
    var(--color);`
  }
  /*======== Static Properties ========*/
  background-blend-mode: soft-light;${
    mode === "glass"
      ? `
  position: relative;`
      : ""
  }${
              mode === "glass"
                ? `

  /*====== Nested Pseudo-Element ======*/
  &::before {
    content: "";
    position: absolute;
    bottom: 0;
    top: 0;
    left: 0;
    right: 0;
    border-radius: var(--radius);
    background: linear-gradient(calc(var(--angle) + 90deg), hsla(0, 0%, 100%, 0) 40%, hsla(0, 0%, 100%, var(--surface-contrast)));
  }`
                : ""
            }
}

/*==== Made using xmorphic.dev ====*/`}
          </code>
        </pre>
      </main>
      <About color={textColorForBackground} />
    </div>
  );
}

export default App;
