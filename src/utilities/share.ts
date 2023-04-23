export default function share() {
  if (navigator.share)
    return navigator.share({
      title: "𝑥morphic | Modern skeuomorphic, glassmorphic, and neumorphic CSS generator",
      url: "https://xmorphic.dev",
      text: "𝑥morphic generates skeuomorphic, glassmorphic, and neumorphic CSS containing easilt-configurable variables",
    });

  navigator.clipboard.writeText("https://xmorphic.dev").then(
    () => alert("Copied link to clipboard!"),
    () => alert("Could not share :(")
  );
}
