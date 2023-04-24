import styles from "./About.module.scss";
import share from "../../utilities/share";

export default function About({ color }: { color: string }) {
  return (
    <div className={styles.about} style={{ color }}>
      <h2>About 𝑥morphic</h2>
      <p>
        𝑥morphic was inspired by CSS generators like{" "}
        <a href="https://neumorphism.io" target="_blank">
          neumorphism.io
        </a>{" "}
        and{" "}
        <a href="https://css.glass" target="_blank">
          css.glass
        </a>
        , but takes a different approach, optimizing for portability and DX:
      </p>
      <p>
        The generated CSS uses a handful of human-readable{" "}
        <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties" target="_blank">
          CSS variables
        </a>
        . Once the code is generated, it can be modified by anyone, even someone who knows nothing about coding. This is unlike other
        generators, where you have to go back to the generator every time you need a new style.
      </p>
      <p>
        𝑥morphic puts those variables through modern CSS functions like{" "}
        <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/calc">
          calc
        </a>
        ,{" "}
        <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix">
          color-mix
        </a>
        , and{" "}
        <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/sin">
          trig
        </a>
        <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/cos">
          onom
        </a>
        <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/cos">
          etry
        </a>{" "}
        to render the most realistic styles possible, based on real-world physics.
      </p>
      <p>
        If you like my work, feel free to...
        <ul>
          <li>
            view the source code on{" "}
            <a href="https://github.com/PeterTYLiu/xmorphic" target="_blank">
              Github
            </a>
            , though please mind the mess!
          </li>
          <li>
            DM me on{" "}
            <a href="https://www.linkedin.com/in/peter-ty-liu" target="_blank">
              LinkedIn
            </a>
          </li>
          <li>
            <a onClick={share}>share this site</a>
          </li>
          <li>
            {" "}
            <a href="https://www.buymeacoffee.com/PeterLiu" target="_blank">
              buy me a coffee
            </a>
          </li>
          <li>
            check out{" "}
            <a href="https://sortabase.com" target="_blank">
              Sortabase
            </a>
            , which I work on full-time
          </li>
        </ul>
      </p>
      <p>
        (If there is enough demand, I will make a setting to generate hard-coded CSS without variables, which does have some performance
        benefits.)
      </p>
    </div>
  );
}
