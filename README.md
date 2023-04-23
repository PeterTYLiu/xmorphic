# [𝑥morphic](https://xmorphic.dev)

[𝑥morphic](https://xmorphic.dev) is a skeuo/glass/neu-morphic CSS generator built with Vite + React + TS. It is inspired by (but not forked from) [neumorphism.io](https://neumorphism.io) and [css.glass](https://https://glass.css), and aims to improve upon those projects in a few crucial ways.

## Design goals

- **Portability:** Once your CSS is generated, you shouldn't have to come back to the website if you want tweak its parameters. 𝑥morphic generates CSS with accessible variables that even non-developers can adjust locally.

- **Realism:** 𝑥morphic leans on real-world physical properties to create its styles. This not only looks good, but also ensures that (almost) every combination of parameters results in a realistic-looking element.

- **Using the platform:** 𝑥morphic takes advantage of CSS variables and other modern CSS features, without requiring third-party libraries or Javascript.

## Shortcomings

- **Too much code!** 𝑥morphic generates a lot of code! And while it's easy to configure, it's often hard to understand, or to modify its internal logic.

- **Bad blending 😔** The element's shadow would ideally use a `soft-light` or `multiply` blend mode onto the background, but this was not possible for technical reasons.

- **Old news!** Almost all the code in 𝑥morphic will be redundant once [relative colors](https://www.w3.org/TR/css-color-5/#relative-RGB) gains widespead browser support. C'est la vie.
